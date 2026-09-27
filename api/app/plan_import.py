from typing import Literal
from pydantic import BaseModel, Field
import json


class PlanMilestone(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str
    acceptance_criteria: list[str] = Field(min_length=1)
    completed: bool = False


class PlanContext(BaseModel):
    stack: list[str] = []
    decisions: list[str] = []
    current_status: str = ""
    open_questions: list[str] = []


class PlanImport(BaseModel):
    schema_version: Literal["1"]
    title: str = Field(min_length=1, max_length=200)
    summary: str
    context: PlanContext = Field(default_factory=PlanContext)
    milestones: list[PlanMilestone] = Field(min_length=1)

class PlanParseError(ValueError):
    pass


def parse_plan(text: str) -> PlanImport:
    start = text.find("{")
    if start == -1:
        raise PlanParseError("No JSON object found in the input.")
    try:
        data, _ = json.JSONDecoder().raw_decode(text, start)
    except json.JSONDecodeError as e:
        raise PlanParseError(
            f"Invalid JSON at line {e.lineno}, column {e.colno}: {e.msg}"
        ) from e
    return PlanImport.model_validate(data)