@echo off
title LINUXPULSE - Automated VM Creation
echo ==========================================================
echo   LINUXPULSE: Creating VirtualBox VMs (server1 & server2)
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create_vms.ps1"
pause
