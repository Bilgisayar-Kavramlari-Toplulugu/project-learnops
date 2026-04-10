<details open>
<summary><strong>🇹🇷 Türkçe</strong></summary>
<br>

Bu belge, LearnOps reposuna Betterleaks tabanli secret scanning kontrolunun neden eklendigini, CI/CD icindeki calisma seklini ve ekip icin beklenen incident response akisini aciklar.

---

## Amac

LearnOps; FastAPI, Next.js ve PostgreSQL ile gelistirilen, topluluk odakli bir DevOps ogrenme platformudur. Topluluga acik bir projede cok sayida contributor, pull request ve hizli iterasyon bulunur. Bu hiz, gelistirme verimini artirirken en sik ve en maliyetli risklerden birini de buyutur: yanlislikla secret expose edilmesi.

Secret sizintilari gunluk gelistirme akisi icinde beklenmedik sekillerde ortaya cikabilir:

- Debug sirasinda `.env` icinden bir satirin kopyalanmasi
- Test amacli gecici bir API key eklenmesi
- README, script veya ornek komuta token yapistirilmasi

LearnOps'ta zaten test ve lint kontrolleri bulunuyordu. Ancak secret tespiti manuel ve tutarsizdi. Bu nedenle PR asamasinda otomatik, hizli, tekrar edilebilir ve zorunlu bir guvenlik kapisi eklemek istedik.

---

## Betterleaks Nedir?

Betterleaks, Git repository'leri icin tasarlanmis bir secret scanner'dir. Hem working tree'yi hem de Git history'yi tarayabilir, pattern tabanli tespit yapar ve pull request pipeline'larinda calisabilecek kadar hafiftir.

LearnOps icin tercih edilme nedenleri:

1. PR dostu olmasi
2. Git history tarayabilmesi
3. GitHub Actions ile kolay entegre olmasi
4. Basit ama etkili bir ilk guvenlik katmani saglamasi

---

## LearnOps Icindeki Entegrasyon

Mevcut pipeline zaten su kontrolleri calistiriyordu:

- Backend testleri
- Backend linting (`ruff` + `mypy`)
- Frontend lint ve type checks

Bunlara ek olarak ayri bir `betterleaks` isi eklendi.

Temel gereksinimlerimiz sunlardi:

- `develop`, `release` ve `main` hedefli PR'larda calismasi
- Yalnizca o anki dosyalari degil, tum Git history'yi taramasi
- Reviewer'lar icin net bir sonuc ozeti uretmesi
- Leak bulundugunda workflow'u fail etmesi

Docker tabanli bir action yerine binary dogrudan GitHub runner icinde indirilip calistirildi. Boylece:

- Workflow icinde Docker CLI bagimliligi olusmadi
- Container icindeki `safe.directory` sorunlariyla ugrasmak gerekmedi

![PR Security Gate: Secrets Scan in CI](images/betterleaks-ci-workflow.png)

---

## CI Akisi

Workflow dosyasi: `.github/workflows/ci-betterleaks.yaml`

Yuksek seviyede akisin mantigi su sekildedir:

1. `actions/checkout@v4` ile repo tam history ile cekilir.
2. Betterleaks binary'si GitHub Releases uzerinden pin'lenmis bir versiyonla indirilir.
3. `./betterleaks git . --report-format json --report-path betterleaks.json --redact=100` komutu calistirilir.
4. JSON rapordan bulgu sayisi hesaplanir.
5. GitHub Actions summary icine `## Betterleaks Summary` bolumu yazilir.
6. Bulgu sayisi `0` degilse job fail edilir.

Bu tasarim onemlidir; cunku Betterleaks tek basina merge bloklamaz. Merge'i engelleyen sey, fail olan CI kontrolunun branch protection tarafindan required check olarak tanimlanmis olmasidir.

![Betterleaks CI Flow (High-Level)](images/betterleaks-ci-flow.png)

---

## Onemli Guvenlik Notu

Buradaki en kritik nokta sudur:

Bir kisi secret'i kendi branch'ine push ettigi anda, secret zaten expose olmus sayilir.

Yani PR'da Betterleaks'in secret'i tespit etmesi cok degerlidir; ancak bu tespit, exposure gercegini geri almaz. Bu nedenle bir secret tespit edildiginde ilk ve en acil aksiyon secret'in rotate edilmesidir.

Onerilen acil aksiyon sirasi:

1. Expose olan secret'i hemen iptal et veya rotate et
2. Gerekirse ilgili servislerde aktif session / token etkisini degerlendir
3. Repo gecmisinde veya branch'te kalan izleri temizle
4. Pull request'i ancak rotation tamamlandiktan sonra duzelt

Ozetle: CI detection bir koruma katmanidir, ama incident response'un ilk adimi her zaman secret rotation olmalidir.

---

## Neden Sadece PR Asamasinda Yetinmemeliyiz?

PR seviyesindeki tarama merge oncesi koruma saglar, ancak exposure daha erken bir anda, yani push aninda gerceklesebilir. Her push'ta GitHub Actions ile scan calistirmak teorik olarak mumkun olsa da bu yaklasim:

- GitHub Actions kotasini daha hizli tuketir
- Geri bildirim dongusunu gereksiz sekilde uzatabilir
- Her kucuk push icin merkezi altyapiya yuk bindirir

Bu nedenle daha pratik yaklasim, CI taramasini korurken lokal tarafta da tarama yapmaktir.

---

## Onerilen Yaklasim: Lokal Betterleaks + Pre-Push Kontrolu

En iyi gelistirici deneyimi icin su model onerilir:

- Betterleaks CI icinde zorunlu olarak calismaya devam eder
- Her gelistirici Betterleaks'i kendi bilgisayarina kurar
- `git push` oncesinde lokal tarama calistirilir
- Mumkunse bu adim bir `pre-push` hook ile otomatiklestirilir

Bu modelin faydalari:

- Secret'lar merkezi repoya gitmeden once yakalanir
- Geri bildirim saniyeler icinde gelistiricinin makinesinde gorulur
- GitHub Actions kotasi gereksiz yere harcanmaz
- CI yine son savunma hatti olarak kalir

Basit bir ornek akis:

```bash
betterleaks git .
```

Eger komut bulgu uretirse push iptal edilir ve developer once secret'i kaldirir, gerekiyorsa rotate eder, sonra tekrar dener.

Bir adim ileri tasimak istersek ekip icin standart bir `pre-push` hook veya ortak bir developer setup script'i de eklenebilir.

---

## PR Sirasinda Beklenen Davranis

Bir PR acildiginda:

- Betterleaks diger kalite kontrolleriyle birlikte calisir
- Leak bulunmazsa job yesil olur ve summary `Findings: 0` gosterir
- Leak bulunursa job kirmizi olur ve required check ise merge bloklanir

Bu davranis, LearnOps'ta test ve lint kontrollerine benzer sekilde security kontrolunu da birinci sinif CI gereksinimi haline getirir.

---

## Release Safety'ye Katkisi

Bu degisiklik sadece yeni bir job eklemek degildir. Su guvenlik pratiklerini standardize eder:

- Tutarlilik: Her PR ayni sekilde taranir
- Tekrarlanabilirlik: Sonuc kisiye gore degismez
- Gorunurluk: Summary reviewer icin hizli karar destegi saglar
- Zorunluluk: Branch protection ile birlikte merge oncesi kontrol haline gelir

Topluluk odakli bir projede bu, contributor'larin hizli calisirken daha guvenli hareket etmesini saglar.

---

## Ozet

Betterleaks, LearnOps icin pratik bir shift-left security adimidir. Ancak en kritik gercek sunu degistirmez:

- Secret push edildigi anda exposure gerceklesmis olabilir
- Detection sonrasi ilk aksiyon secret rotation olmalidir
- CI taramasi korunmali, ama lokal pre-push tarama ile tamamlanmalidir

Bu nedenle tavsiye edilen model:

- CI icinde Betterleaks'i required check olarak tutmak
- Gelistirici makinelerinde Betterleaks kurulumunu yayginlastirmak
- Mumkunse `pre-push` hook ile lokal taramayi standartlastirmak

</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>
<br>

This document explains why Betterleaks-based secret scanning was added to the LearnOps repository, how it works in CI/CD, and what incident response flow the team should follow when a secret is detected.

---

## Purpose

LearnOps is a community-driven DevOps learning platform built with FastAPI, Next.js, and PostgreSQL. In an open collaboration model, many contributors, pull requests, and fast iteration increase one of the most common and expensive risks in software delivery: accidental secret exposure.

Secrets can leak through normal day-to-day development tasks:

- Copying a line from `.env` while debugging
- Adding a temporary API key for testing
- Pasting a token into a README, script, or example command

The project already had tests and lint checks in place, but secret detection was still manual and inconsistent. We wanted an automated, fast, repeatable, and enforced security gate at the pull request stage.

---

## What Is Betterleaks?

Betterleaks is a secret scanner built for Git repositories. It can scan both the working tree and Git history, uses pattern-based detection, and is lightweight enough to run in pull request pipelines.

It was a good fit for LearnOps because it is:

1. Fast enough for PR workflows
2. Git-aware, including history scanning
3. Easy to integrate into GitHub Actions
4. A practical first security layer without heavy platform setup

---

## Integration in LearnOps

The pipeline already included:

- Backend tests
- Backend linting (`ruff` + `mypy`)
- Frontend lint and type checks

We added a separate `betterleaks` job.

The core requirements were:

- Run on PRs targeting `develop`, `release`, and `main`
- Scan full Git history, not only the current snapshot
- Produce a clear reviewer-facing summary
- Fail the workflow when leaks are found

Instead of using a Docker-based action, the workflow downloads and runs the Betterleaks binary directly on the GitHub runner. This keeps the setup simpler and avoids:

- A Docker CLI dependency in the workflow
- `safe.directory` issues caused by containerized execution

![PR Security Gate: Secrets Scan in CI](images/betterleaks-ci-workflow.png)

---

## CI Flow

Workflow file: `.github/workflows/ci-betterleaks.yaml`

At a high level, the flow is:

1. Check out the repository with full history.
2. Download a pinned Betterleaks binary from GitHub Releases.
3. Run `./betterleaks git . --report-format json --report-path betterleaks.json --redact=100`.
4. Count findings from the JSON report.
5. Write a `## Betterleaks Summary` section to the GitHub Actions summary.
6. Fail the job if the findings count is not `0`.

That last point matters. Betterleaks itself does not block merges. The merge is blocked because the CI job fails, and branch protection can require that check to pass.

![Betterleaks CI Flow (High-Level)](images/betterleaks-ci-flow.png)

---

## Critical Security Note

This is the most important point to make explicit:

Once someone pushes a secret to their branch, the secret should already be treated as exposed.

That means PR-time detection is still valuable, but it does not undo the exposure. Because of that, the first and most urgent action after detection must be rotating or revoking the secret.

Recommended immediate response order:

1. Revoke or rotate the exposed secret immediately
2. Assess any downstream impact on sessions, tokens, or connected services
3. Clean the remaining traces from the branch or repository history if needed
4. Only then continue with the PR fix

In short: CI detection is a guardrail, but secret rotation is the first response step.

---

## Why PR-Only Scanning Is Not Enough

PR-level scanning protects the merge path, but exposure may happen earlier at push time. Running GitHub Actions on every push is possible, but it also:

- Consumes GitHub Actions quota more quickly
- Slows feedback for small iterative pushes
- Adds unnecessary load to centralized CI

Because of that, the more practical model is to keep CI scanning and add local scanning before push.

---

## Recommended Model: Local Betterleaks + Pre-Push Checks

The recommended operating model is:

- Betterleaks stays mandatory in CI
- Each developer installs Betterleaks locally
- Developers run a scan before `git push`
- Ideally this is automated through a `pre-push` hook

Benefits of this approach:

- Secrets are caught before they reach the shared repository
- Feedback comes back within seconds on the developer machine
- GitHub Actions quota is used more efficiently
- CI still remains the final safety net

A simple local command example:

```bash
betterleaks git .
```

If the command reports findings, the push should be stopped, the secret should be removed, and if the secret was ever valid or reachable, it should be rotated before trying again.

As a next step, the team could standardize this with a shared `pre-push` hook or a developer bootstrap script.

---

## Expected PR Behavior

When a PR is opened:

- Betterleaks runs alongside the existing quality checks
- If no leaks are found, the job passes and the summary shows `Findings: 0`
- If leaks are found, the job fails and the PR stays blocked when the check is required

This makes secret scanning a first-class CI requirement, just like tests and linting.

---

## Release Safety Impact

This change is more than just another CI job. It standardizes several security practices:

- Consistency: every PR is scanned
- Repeatability: the result does not depend on reviewer attention
- Visibility: the summary makes results easy to understand
- Enforcement: branch protection turns the scan into a merge gate

For a community-driven project like LearnOps, this helps contributors move quickly without weakening the release process.

---

## Summary

Betterleaks is a practical shift-left security step for LearnOps. But the key truth remains:

- Once a secret is pushed, exposure may already have happened
- The first response after detection must be secret rotation
- CI scanning should stay in place, but it should be complemented with local pre-push scanning

That makes the recommended model:

- Keep Betterleaks as a required CI check
- Encourage local Betterleaks installation on developer machines
- Standardize pre-push scanning where possible

</details>
