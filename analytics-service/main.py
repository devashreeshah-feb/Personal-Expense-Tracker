from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from insights import router as insights_router
from export_report import router as export_router

app = FastAPI(title="Finance Manager Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(insights_router, prefix="/insights")
app.include_router(export_router, prefix="/export")

@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
