import os
from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db import DbSession
from app.models import User

DEV_GOOGLE_SUB = "dev-user"


def get_current_user(db: DbSession) -> User:
    if os.environ.get("APP_ENV") != "development":
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.scalar(select(User).where(User.google_sub == DEV_GOOGLE_SUB))
    if user is None:
        user = User(google_sub=DEV_GOOGLE_SUB, email="dev@localhost", name="Dev User")
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            user = db.scalar(select(User).where(User.google_sub == DEV_GOOGLE_SUB))
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]