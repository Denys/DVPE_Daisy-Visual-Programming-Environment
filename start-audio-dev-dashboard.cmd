@echo off
setlocal
cd /d "%~dp0audio-dev-dashboard"
python dashboard_server.py
if errorlevel 1 pause
