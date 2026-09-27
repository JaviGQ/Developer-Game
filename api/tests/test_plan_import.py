import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.plan_import import PlanParseError, parse_plan

FIXTURE = Path(__file__).parent / "fixtures" / "progression-app.plan.json"


def minimal_plan() -> dict:
    return {
        "schema_version": "1",
        "title": "Test",
        "summary": "A test plan",
        "milestones": [
            {"title": "First", "description": "Do it", "acceptance_criteria": ["It works"]}
        ],
    }


def test_parses_real_plan_file():
    plan = parse_plan(FIXTURE.read_text(encoding="utf-8"))
    assert plan.title
    assert len(plan.milestones) > 0


def test_parses_json_in_code_fence():
    text = "```json\n" + json.dumps(minimal_plan()) + "\n```"
    assert parse_plan(text).title == "Test"


def test_parses_json_with_surrounding_prose():
    text = "Here's your plan:\n" + json.dumps(minimal_plan()) + "\nLet me know!"
    assert parse_plan(text).title == "Test"


def test_ignores_trailing_text_containing_braces():
    text = json.dumps(minimal_plan()) + "\nWant me to add {more} milestones?"
    assert parse_plan(text).title == "Test"


def test_rejects_text_without_json():
    with pytest.raises(PlanParseError):
        parse_plan("Sorry, I can't help with that.")


def test_reports_invalid_json():
    with pytest.raises(PlanParseError):
        parse_plan('{"title": "Broken", ')


def test_missing_field_reports_location():
    data = minimal_plan()
    del data["milestones"][0]["acceptance_criteria"]
    with pytest.raises(ValidationError) as exc_info:
        parse_plan(json.dumps(data))
    assert exc_info.value.errors()[0]["loc"] == ("milestones", 0, "acceptance_criteria")