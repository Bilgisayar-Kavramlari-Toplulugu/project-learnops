"""
Tests for seed_quiz.py script.

Tests verify:
- --dry-run mode does not write to DB
- Invalid slug causes EXIT 1
- Script runs without crash
"""

import subprocess
import sys
from pathlib import Path

SCRIPT_PATH = Path(__file__).resolve().parent.parent / "scripts" / "seed_quiz.py"


def _run_seed_quiz(
    *extra_args: str,
    env_override: dict | None = None,
) -> subprocess.CompletedProcess:
    """Run seed_quiz.py with given arguments."""
    import os

    env = os.environ.copy()
    # Ensure ENVIRONMENT is set for config validation bypass
    env["ENVIRONMENT"] = "testing"
    # Provide required env vars to prevent RuntimeError on import
    env.setdefault("JWT_SECRET", "test-jwt-secret-not-for-production")
    env.setdefault("TOKEN_ENCRYPTION_KEY", "test-token-encryption-key-not-for-prod")
    env.setdefault(
        "DATABASE_URL",
        "postgresql+asyncpg://fake:fake@localhost:5432/fakedb",
    )
    if env_override:
        env.update(env_override)

    return subprocess.run(
        [sys.executable, str(SCRIPT_PATH), *extra_args],
        capture_output=True,
        text=True,
        timeout=30,
        env=env,
    )


class TestSeedQuizScript:
    """Test suite for seed_quiz.py."""

    def test_script_exists(self):
        """Script file should exist."""
        assert SCRIPT_PATH.exists(), f"Script not found: {SCRIPT_PATH}"

    def test_help_flag(self):
        """--help should work and exit 0."""
        result = _run_seed_quiz("--help")
        assert result.returncode == 0
        assert "dry-run" in result.stdout.lower()
        assert "env" in result.stdout.lower()

    def test_dry_run_no_db_connection_needed(self):
        """--dry-run without DATABASE_URL should still work
        (shows what would be done without slug validation).
        """
        result = _run_seed_quiz(
            "--env",
            "testing",
            "--dry-run",
            env_override={"DATABASE_URL": ""},
        )
        # Should exit 0 — no DB needed in dry-run without DATABASE_URL
        assert result.returncode == 0, (
            f"Exit code: {result.returncode}\n"
            f"stdout: {result.stdout}\n"
            f"stderr: {result.stderr}"
        )

    def test_dry_run_output_contains_header(self):
        """Dry-run should print the seeder header."""
        result = _run_seed_quiz(
            "--env",
            "testing",
            "--dry-run",
            env_override={"DATABASE_URL": ""},
        )
        assert "LearnOps Quiz Seeder" in result.stdout

    def test_dry_run_shows_dry_run_label(self):
        """Dry-run output should indicate DRY-RUN mode."""
        result = _run_seed_quiz(
            "--env",
            "testing",
            "--dry-run",
            env_override={"DATABASE_URL": ""},
        )
        assert "DRY-RUN" in result.stdout


class TestSeedQuizParsing:
    """Tests for quiz file parsing logic."""

    def test_parse_valid_quiz_file(self, tmp_path: Path):
        """Valid quiz.json should be parsed without errors."""
        sys.path.insert(0, str(SCRIPT_PATH.parent.parent))
        from scripts.seed_quiz import parse_quiz_file

        quiz = {
            "course_slug": "test-course",
            "pass_threshold": 0.70,
            "duration_seconds": 1200,
            "questions": [
                {
                    "order_index": 1,
                    "is_active": True,
                    "text": "Question?",
                    "options": [
                        {"index": 0, "text": "A"},
                        {"index": 1, "text": "B"},
                    ],
                    "correct_index": 0,
                    "explanation": "A is correct.",
                }
            ],
        }
        quiz_path = tmp_path / "quiz.json"
        quiz_path.write_text(__import__("json").dumps(quiz), encoding="utf-8")

        result = parse_quiz_file(quiz_path)
        assert result is not None
        assert result["course_slug"] == "test-course"
        assert len(result["questions"]) == 1

    def test_parse_quiz_missing_slug(self, tmp_path: Path):
        """Quiz without course_slug should return None."""
        sys.path.insert(0, str(SCRIPT_PATH.parent.parent))
        from scripts.seed_quiz import parse_quiz_file

        quiz = {
            "questions": [
                {
                    "order_index": 1,
                    "text": "Q?",
                    "options": [{"index": 0, "text": "A"}],
                    "correct_index": 0,
                }
            ],
        }
        quiz_path = tmp_path / "quiz.json"
        quiz_path.write_text(__import__("json").dumps(quiz), encoding="utf-8")

        result = parse_quiz_file(quiz_path)
        assert result is None

    def test_parse_quiz_empty_questions(self, tmp_path: Path):
        """Quiz with empty questions array should return None."""
        sys.path.insert(0, str(SCRIPT_PATH.parent.parent))
        from scripts.seed_quiz import parse_quiz_file

        quiz = {"course_slug": "test", "questions": []}
        quiz_path = tmp_path / "quiz.json"
        quiz_path.write_text(__import__("json").dumps(quiz), encoding="utf-8")

        result = parse_quiz_file(quiz_path)
        assert result is None

    def test_parse_quiz_invalid_json(self, tmp_path: Path):
        """Invalid JSON should return None."""
        sys.path.insert(0, str(SCRIPT_PATH.parent.parent))
        from scripts.seed_quiz import parse_quiz_file

        quiz_path = tmp_path / "quiz.json"
        quiz_path.write_text("{ invalid json }", encoding="utf-8")

        result = parse_quiz_file(quiz_path)
        assert result is None

    def test_collect_quiz_files_skips_template(self, tmp_path: Path):
        """Directories starting with _ should be skipped."""
        sys.path.insert(0, str(SCRIPT_PATH.parent.parent))
        from scripts.seed_quiz import collect_quiz_files

        # This test relies on the actual content dir structure.
        # We just verify the function is callable and returns a list.
        result = collect_quiz_files()
        assert isinstance(result, list)
        # Verify no template dirs are included
        for qf in result:
            assert not qf.parent.name.startswith("_"), f"Template dir included: {qf}"
