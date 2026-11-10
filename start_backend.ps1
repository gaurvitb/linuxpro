# LINUXPULSE - Start FastAPI Backend Server
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  LINUXPULSE - Starting FastAPI Telemetry Engine" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\backend"
if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Host "[ERROR] Virtual environment not found in backend\venv." -ForegroundColor Red
    exit 1
}

Write-Host "Starting FastAPI server on http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Swagger UI: http://127.0.0.1:8000/docs" -ForegroundColor Green
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
