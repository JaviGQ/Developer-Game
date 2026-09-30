## Development

Start everything: `docker compose up`
Rebuild after dependency changes: `docker compose up --build` (add `-V` after npm installs)
Stop: `docker compose down` (never `-v` unless you want to wipe the database)
Database shell: `docker compose exec db psql -U <user> -d <db>`
Migrations: `docker compose exec api alembic upgrade head`
Tests: `cd api && uv run pytest -v`