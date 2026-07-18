@echo off
setlocal
cd /d "%~dp0"
python dashboard_server.py
if errorlevel 1 pause
