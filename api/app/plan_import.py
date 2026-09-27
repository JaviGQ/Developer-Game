from typing import Literal

from pydantic import BaseModel, Field


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