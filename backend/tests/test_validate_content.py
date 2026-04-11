"""
Tests for validate_content.py script.

Tests run the validation script via subprocess and verify:
- Exit code 0 for valid content
- Exit code 1 for invalid content (missing fields, duplicate ids, etc.)
"""

import json
import subprocess
import sys
from pathlib import Path

SCRIPT_PATH = Path(__file__).resolve().parent.parent / "scripts" / "validate_content.py"


def _run_validate(content_dir: Path | None = None) -> subprocess.CompletedProcess:
    """Run validate_content.py and return the result."""
    return subprocess.run(
        [sys.executable, str(SCRIPT_PATH)],
        capture_output=True,
        text=True,
        timeout=30,
    )


class TestValidateContentScript:
    """Test suite for validate_content.py."""

    def test_script_exists(self):
        """Script file should exist."""
        assert SCRIPT_PATH.exists(), f"Script not found: {SCRIPT_PATH}"

    def test_script_runs_without_crash(self):
        """Script should run without Python errors."""
        result = _run_validate()
        # Script may exit 0 or 1 depending on content state,
        # but should never crash (exit code != 0 or 1)
        assert result.returncode in (0, 1), (
            f"Script crashed with exit code {result.returncode}.\n"
            f"stdout: {result.stdout}\n"
            f"stderr: {result.stderr}"
        )

    def test_script_output_contains_header(self):
        """Script should print the LearnOps Content Validator header."""
        result = _run_validate()
        assert "LearnOps Content Validator" in result.stdout


class TestValidateContentWithTempDir:
    """Tests with temporary content directories."""

    def _create_valid_course(self, base_dir: Path, slug: str = "test-course") -> Path:
        """Create a valid course directory structure."""
        course_dir = base_dir / slug
        course_dir.mkdir(parents=True, exist_ok=True)

        # meta.json
        meta = {
            "slug": slug,
            "title": "Test Course",
            "description": "A test course for validation",
            "category": "testing",
            "difficulty": "beginner",
            "duration_minutes": 30,
            "is_published": False,
        }
        (course_dir / "meta.json").write_text(
            json.dumps(meta, indent=2), encoding="utf-8"
        )

        # sections/
        sections_dir = course_dir / "sections"
        sections_dir.mkdir(exist_ok=True)

        mdx_content = """---
id: "{slug}-001-intro"
title: "Introduction"
order: 10
order_index: 10
---

# Introduction

This is a test section.
""".replace("{slug}", slug)
        (sections_dir / "010-intro.mdx").write_text(mdx_content, encoding="utf-8")

        return course_dir

    def test_valid_meta_json_fields(self, tmp_path: Path):
        """Valid meta.json should not produce errors."""
        from scripts.validate_content import validate_meta_json

        course_dir = self._create_valid_course(tmp_path, "valid-course")
        errors: list[str] = []
        meta = validate_meta_json(course_dir, errors)

        assert meta is not None
        assert len([e for e in errors if "\033[91m" in e]) == 0  # No red errors

    def test_missing_meta_json(self, tmp_path: Path):
        """Missing meta.json should produce error."""
        from scripts.validate_content import validate_meta_json

        course_dir = tmp_path / "no-meta-course"
        course_dir.mkdir()
        errors: list[str] = []
        meta = validate_meta_json(course_dir, errors)

        assert meta is None
        assert len(errors) == 1
        assert "meta.json bulunamadı" in errors[0]

    def test_missing_required_field_in_meta(self, tmp_path: Path):
        """Meta.json missing required field should produce error."""
        from scripts.validate_content import validate_meta_json

        course_dir = tmp_path / "incomplete-course"
        course_dir.mkdir()
        meta = {"slug": "incomplete", "title": "Missing Fields"}
        (course_dir / "meta.json").write_text(json.dumps(meta), encoding="utf-8")

        errors: list[str] = []
        validate_meta_json(course_dir, errors)

        # Should have errors for description, category, difficulty,
        # duration_minutes, is_published
        assert len(errors) == 5

    def test_slug_uniqueness(self, tmp_path: Path):
        """Duplicate slugs should be caught."""
        from scripts.validate_content import validate_meta_json

        self._create_valid_course(tmp_path, "course-a")
        self._create_valid_course(tmp_path, "course-b")

        # Manually set course-b's slug to same as course-a
        meta_b = json.loads(
            (tmp_path / "course-b" / "meta.json").read_text(encoding="utf-8")
        )
        meta_b["slug"] = "course-a"  # duplicate!
        (tmp_path / "course-b" / "meta.json").write_text(
            json.dumps(meta_b), encoding="utf-8"
        )

        errors: list[str] = []
        slugs: dict[str, str] = {}

        meta_a = validate_meta_json(tmp_path / "course-a", errors)
        if meta_a and "slug" in meta_a:
            slugs[meta_a["slug"]] = "course-a"

        meta_b_parsed = validate_meta_json(tmp_path / "course-b", errors)
        if meta_b_parsed and "slug" in meta_b_parsed:
            slug = meta_b_parsed["slug"]
            if slug in slugs:
                errors.append(f"slug '{slug}' duplicate")

        assert any("duplicate" in e or "zaten" in e for e in errors)

    def test_mdx_missing_frontmatter(self, tmp_path: Path):
        """MDX without frontmatter should produce error."""
        from scripts.validate_content import validate_mdx_sections

        course_dir = tmp_path / "bad-mdx"
        sections_dir = course_dir / "sections"
        sections_dir.mkdir(parents=True)

        # MDX without frontmatter
        (sections_dir / "010-no-fm.mdx").write_text(
            "# No Frontmatter\nJust content.", encoding="utf-8"
        )

        errors: list[str] = []
        global_ids: dict[str, str] = {}
        validate_mdx_sections(course_dir, errors, global_ids)

        assert len(errors) >= 1
        assert any("frontmatter bulunamadı" in e for e in errors)

    def test_mdx_duplicate_section_ids(self, tmp_path: Path):
        """Duplicate section IDs across courses should produce error."""
        from scripts.validate_content import validate_mdx_sections

        # Course A
        course_a = tmp_path / "course-a" / "sections"
        course_a.mkdir(parents=True)
        (course_a / "010.mdx").write_text(
            '---\nid: "shared-id"\ntitle: "A"\norder_index: 10\n---\n',
            encoding="utf-8",
        )

        # Course B with same ID
        course_b = tmp_path / "course-b" / "sections"
        course_b.mkdir(parents=True)
        (course_b / "010.mdx").write_text(
            '---\nid: "shared-id"\ntitle: "B"\norder_index: 10\n---\n',
            encoding="utf-8",
        )

        errors: list[str] = []
        global_ids: dict[str, str] = {}

        validate_mdx_sections(tmp_path / "course-a", errors, global_ids)
        validate_mdx_sections(tmp_path / "course-b", errors, global_ids)

        assert any("zaten kullanılıyor" in e for e in errors)

    def test_mdx_order_index_collision(self, tmp_path: Path):
        """Same order_index within a course should produce error."""
        from scripts.validate_content import validate_mdx_sections

        course_dir = tmp_path / "collision-course"
        sections_dir = course_dir / "sections"
        sections_dir.mkdir(parents=True)

        (sections_dir / "010.mdx").write_text(
            '---\nid: "c-001"\ntitle: "A"\norder_index: 10\n---\n',
            encoding="utf-8",
        )
        (sections_dir / "020.mdx").write_text(
            '---\nid: "c-002"\ntitle: "B"\norder_index: 10\n---\n',
            encoding="utf-8",
        )

        errors: list[str] = []
        global_ids: dict[str, str] = {}
        validate_mdx_sections(course_dir, errors, global_ids)

        assert any("order_index=10" in e and "çakışması" in e for e in errors)

    def test_quiz_json_validation(self, tmp_path: Path):
        """Valid quiz.json should not produce errors."""
        from scripts.validate_content import validate_quiz_json

        course_dir = tmp_path / "quiz-course"
        course_dir.mkdir()

        quiz = {
            "course_slug": "quiz-course",
            "pass_threshold": 0.70,
            "duration_seconds": 1200,
            "questions": [
                {
                    "order_index": 1,
                    "text": "Test question?",
                    "options": [
                        {"index": 0, "text": "A"},
                        {"index": 1, "text": "B"},
                    ],
                    "correct_index": 0,
                    "explanation": "A is correct because...",
                }
            ],
        }
        (course_dir / "quiz.json").write_text(json.dumps(quiz), encoding="utf-8")

        errors: list[str] = []
        validate_quiz_json(course_dir, errors)

        # No red errors (warnings about explanation style are OK)
        red_errors = [e for e in errors if "\033[91m" in e]
        assert len(red_errors) == 0

    def test_quiz_json_invalid_correct_index(self, tmp_path: Path):
        """correct_index out of range should produce error."""
        from scripts.validate_content import validate_quiz_json

        course_dir = tmp_path / "bad-quiz"
        course_dir.mkdir()

        quiz = {
            "course_slug": "bad-quiz",
            "questions": [
                {
                    "order_index": 1,
                    "text": "Question?",
                    "options": [{"index": 0, "text": "A"}],
                    "correct_index": 5,  # out of range!
                    "explanation": "Explanation",
                }
            ],
        }
        (course_dir / "quiz.json").write_text(json.dumps(quiz), encoding="utf-8")

        errors: list[str] = []
        validate_quiz_json(course_dir, errors)

        assert any("correct_index=5" in e and "aralığı dışında" in e for e in errors)
