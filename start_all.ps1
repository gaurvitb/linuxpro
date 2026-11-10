# LINUXPULSE - Enterprise Platform Dual Launcher
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  LINUXPULSE: Enterprise Linux Management Platform" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Launching Backend (FastAPI) and Frontend (Vite React)..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start_backend.ps1"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start_frontend.ps1"

Write-Host ""
Write-Host "Both processes initiated in separate windows:" -ForegroundColor Green
Write-Host "  - Frontend UI Dashboard: http://localhost:5173" -ForegroundColor Green
Write-Host "  - Backend API & Docs:    http://localhost:8000/docs" -ForegroundColor Green

