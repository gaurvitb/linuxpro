@echo off
title LINUXPULSE - FastAPI Backend Server
echo ===================================================
echo   LINUXPULSE - Starting FastAPI Telemetry Engine
echo ===================================================
cd /d "%~dp0backend"
if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in backend\venv.
    echo Please run: python -m venv venv and pip install -r requirements.txt
    pause
    exit /b 1
)
echo Starting FastAPI server on http://127.0.0.1:8000
echo Swagger UI: http://127.0.0.1:8000/docs
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
