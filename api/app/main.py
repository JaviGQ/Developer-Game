from fastapi import FastAPI

app = FastAPI(title="Development App")


@app.get("/api/health")
def health():
    return {"status": "ok"}