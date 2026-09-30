from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, ConfigDict, ValidationError
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.auth import CurrentUser
from app.db import DbSession
from app.models import Milestone, Project
from app.plan_import import PlanImport, PlanParseError, format_validation_errors, parse_plan

router = APIRouter(prefix="/api/projects", tags=["projects"])


class ImportRequest(BaseModel):
    text: str


class ImportResponse(BaseModel):
    id: int
    title: str
    milestone_count: int

class ProjectSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: str
    version: int


class MilestoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    position: int
    title: str
    description: str
    acceptance_criteria: list[str]
    completed_at: datetime | None


class ProjectDetail(ProjectSummary):
    summary: str | None
    context: dict | None
    created_at: datetime
    completed_at: datetime | None
    milestones: list[MilestoneOut]


@router.post("/import", status_code=status.HTTP_201_CREATED, response_model=ImportResponse)
def import_plan(body: ImportRequest, user: CurrentUser, db: DbSession):
    plan = parse_or_http_error(body.text)

    now = datetime.now(timezone.utc)
    all_done = all(m.completed for m in plan.milestones)

    project = Project(
        user_id=user.id,
        title=plan.title,
        summary=plan.summary,
        context=plan.context.model_dump(),
        status="completed" if all_done else "active",
        completed_at=now if all_done else None,
    )
    db.add(project)
    db.flush()

    for position, m in enumerate(plan.milestones, start=1):
        db.add(
            Milestone(
                project_id=project.id,
                position=position,
                title=m.title,
                description=m.description,
                acceptance_criteria=m.acceptance_criteria,
                completed_at=now if m.completed else None,
            )
        )

    db.commit()
    return ImportResponse(id=project.id, title=project.title, milestone_count=len(plan.milestones))

@router.get("", response_model=list[ProjectSummary])
def list_projects(user: CurrentUser, db: DbSession):
    return db.scalars(
        select(Project)
        .where(Project.user_id == user.id)
        .order_by(Project.created_at.desc())
    ).all()


@router.get("/{project_id}", response_model=ProjectDetail)
def get_project(project_id: int, user: CurrentUser, db: DbSession):
    project = db.scalar(
        select(Project)
        .where(Project.id == project_id, Project.user_id == user.id)
        .options(selectinload(Project.milestones))
    )
    if project is None:
        raise HTTPException(status_code=404, detail=["Project not found"])
    return project

def parse_or_http_error(text: str) -> PlanImport:
    try:
        return parse_plan(text)
    except PlanParseError as e:
        raise HTTPException(status_code=400, detail=[str(e)])
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=format_validation_errors(e))

@router.post("/import/preview", response_model=PlanImport)
def preview_import(body: ImportRequest, user: CurrentUser):
    return parse_or_http_error(body.text)