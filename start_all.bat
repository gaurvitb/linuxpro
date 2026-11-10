@echo off
title LINUXPULSE - Enterprise Platform Launcher
echo =========================================================
echo   LINUXPULSE: Enterprise Linux Management Platform
echo =========================================================
echo Starting Backend (FastAPI) and Frontend (Vite + React)...

start "LINUXPULSE - Backend (Port 8000)" "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "LINUXPULSE - Frontend (Port 5173)" "%~dp0start_frontend.bat"

echo.
echo =========================================================
echo Both services launched!
echo - Web Dashboard: http://localhost:5173
echo - Backend API & Docs: http://localhost:8000/docs
echo =========================================================
pause
