@echo off
setlocal

REM One-click Windows entrypoint for the verified DVPE web application.
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0START_DVPE.ps1" %*
set "DVPE_EXIT_CODE=%ERRORLEVEL%"

if not "%DVPE_EXIT_CODE%"=="0" (
    echo.
    echo DVPE did not start. Review the error above.
    pause
)

exit /b %DVPE_EXIT_CODE%
