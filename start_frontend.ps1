# LINUXPULSE - Start React Frontend Dashboard
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  LINUXPULSE - Starting React UI Dashboard" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"
Write-Host "Starting Vite development server on http://localhost:5173" -ForegroundColor Green
npm run dev

