@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server-8000.ps1"
if errorlevel 1 (
  echo.
  echo Failed to start the local server on port 8000.
  pause
  exit /b 1
)
