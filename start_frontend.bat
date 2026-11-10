@echo off
title LINUXPULSE - React Frontend Dashboard
echo ===================================================
echo   LINUXPULSE - Starting React UI Dashboard
echo ===================================================
cd /d "%~dp0frontend"
echo Starting Vite development server on http://localhost:5173
npm run dev
pause

