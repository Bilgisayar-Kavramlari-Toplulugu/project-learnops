# Adding Betterleaks to LearnOps: Automated Secret Scanning in CI/CD

## Context: LearnOps and Why This Matters
LearnOps is an open‑source DevOps learning platform built with FastAPI, Next.js, and PostgreSQL. The project is community‑driven, which means many contributors, lots of pull requests, and constant iteration. That’s great for velocity, but it also increases one of the most common (and most costly) risks in modern software: accidental secret exposure.

In a fast‑moving codebase, secrets can slip in through many everyday actions:
- a copied `.env` line during debugging
- a temporary API key added for testing
- a token pasted into a README or script

We already had tests and lint checks in CI, but secrets detection was still manual and inconsistent. We wanted a guardrail that is:
- automatic
- fast
- reliable
- enforced at the pull request stage

That’s what led us to Betterleaks.

## What is Betterleaks?
Betterleaks is a secrets scanner designed specifically for Git repositories. It scans both the working tree and Git history, uses strong pattern‑based detection, and is lightweight enough to run on every PR.

For our use case, it checked three important boxes:
1. PR‑friendly – quick enough for a CI job
2. Git‑aware – can scan history, not just the current snapshot
3. Action‑friendly – easy to integrate into GitHub Actions with clear output

We didn’t need a huge platform or heavy configuration for a first pass. We just needed a consistent, enforced check that would go red if something sensitive appeared.

## How We Integrated It in This Repo
Our pipeline already had these checks:
- backend tests
- backend linting (ruff + mypy)
- frontend lint + type checks

We added a new job dedicated to secret scanning. The requirements we set were:

- Trigger on PRs to `develop`, `release`, and `main`
- Scan full git history, not just the current files
- Produce a clear summary so reviewers can understand results quickly
- Fail the workflow if leaks are detected

We chose a Docker‑less workflow step to keep it simple and avoid container entrypoint issues. The Betterleaks binary is downloaded from GitHub Releases and executed directly inside the GitHub runner.

That gives us two wins:
- no Docker CLI dependency in the workflow
- no Git “safe.directory” issues inside containers

## CI Flow (Betterleaks in the Pipeline)

![PR Security Gate: Secrets Scan in CI](images/betterleaks-ci-workflow.png)



## How It Works in This Repo
Here is the high‑level logic we integrated:

1. Checkout with full history
   This allows `betterleaks git .` to scan both the current tree and commit history.

2. Download the Betterleaks binary
   We fetch a pinned version from GitHub Releases to keep builds stable and reproducible.

3. Run the scan
   The command produces a JSON report. We use it to count findings for a summary.

4. Write a summary
   The workflow writes a `## Betterleaks Summary` section into GitHub Actions. This is visible to reviewers and makes it easy to see the number of findings without digging through logs.

5. Fail if leaks are found
   If the findings count is > 0, the job fails. With branch protection rules enabled, this blocks merges until the leak is removed.

The most important detail:
Betterleaks itself doesn’t “block merges” — it fails a required CI check. If branch protection requires that check, merges are blocked automatically.
![Betterleaks CI Flow (High-Level)](images/betterleaks-ci-flow.png)

## What This Looks Like During a PR
When a PR is opened:
- Betterleaks runs alongside tests and lint checks.
- If no leaks are found, the job is green and the summary shows “Findings: 0.”
- If leaks are detected, the job fails and the PR shows a red status.

This is the exact behavior we wanted: the scan happens at the same time as all other quality checks, and the PR can’t move forward if sensitive data is present.

## Why This Improves Our Release Safety
This change is more than just another CI job. It introduces a security practice that is:
- consistent: every PR is scanned
- repeatable: no reliance on a single reviewer
- objective: the scanner doesn’t miss things due to fatigue or bias
- visible: summaries make the result easy to understand

For a community project like LearnOps, that matters. It means contributors can move fast without compromising safety, and maintainers can trust the pipeline to catch risky mistakes.

## Key Takeaway
Adding Betterleaks was a practical example of “shift‑left” security. It didn’t require redesigning the pipeline or adding heavy tooling. It simply turned secret detection into a first‑class CI requirement — the same way we treat tests and linting.

