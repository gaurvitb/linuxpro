"""
LINUXPULSE - Enterprise Linux Infrastructure Management Platform
FastAPI Application Entrypoint
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router

app = FastAPI(
    title=settings.app_name,
    description="Enterprise Linux Server Administration & Infrastructure Monitoring Platform for RHEL 9 / 10 Two-Server Architectures.",
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.api_prefix)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.app_name} API",
        "tagline": settings.tagline,
        "docs": "/docs",
        "health": f"{settings.api_prefix}/health",
        "mode": settings.mode
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
