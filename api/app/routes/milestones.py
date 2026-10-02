from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import selectinload

from app.auth import CurrentUser
from app.db import DbSession
from app.models import Project
from app.routes.projects import ProjectDetail, get_owned_project

router = APIRouter(prefix="/api/projects/{project_id}/milestones", tags=["milestones"])


class MilestoneUpdate(BaseModel):
    completed: bool


@router.patch("/{milestone_id}", response_model=ProjectDetail)
def update_milestone(
    project_id: int,
    milestone_id: int,
    body: MilestoneUpdate,
    user: CurrentUser,
    db: DbSession,
):
    project = get_owned_project(db, user, project_id, selectinload(Project.milestones))
    if project.status == "completed":
        raise HTTPException(
            status_code=409,
            detail=["This project is completed. Start a new version to keep working on it."],
        )
    milestone = next((m for m in project.milestones if m.id == milestone_id), None)
    if milestone is None:
        raise HTTPException(status_code=404, detail=["Milestone not found"])

    now = datetime.now(timezone.utc)
    if body.completed:
        if milestone.completed_at is None:
            milestone.completed_at = now
    else:
        milestone.completed_at = None

    all_done = all(m.completed_at for m in project.milestones)
    if all_done and project.status != "completed":
        project.status = "completed"
        project.completed_at = now
    elif not all_done and project.status == "completed":
        project.status = "active"
        project.completed_at = None

    db.commit()
    return project