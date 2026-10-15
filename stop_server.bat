@echo off
title Stop AI Humanizer
cd /d "%~dp0"
echo Freeing Port 8000 and stopping AI Humanizer...
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating process PID %%p...
    taskkill /F /PID %%p >nul 2>&1
)
echo AI Humanizer stopped cleanly.
pause
