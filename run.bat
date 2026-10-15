@echo off
setlocal enabledelayedexpansion
title AI Humanizer & Natural Language Refinement Engine
cd /d "%~dp0"

echo ======================================================================
echo  Starting AI Humanizer & Natural Language Refinement Layer...
echo ======================================================================
echo.

set PYTHONUTF8=1
set "PATH=%PATH%;C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312;C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\Scripts;C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311;C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\Scripts"

:: [1/4] Find Python executable
echo [1/4] Locating Python environment...
set "PYTHON_EXE="

python --version >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_EXE=python"
) else (
    if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe" (
        set "PYTHON_EXE=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe"
    ) else if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe" (
        set "PYTHON_EXE=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe"
    ) else (
        py -3 --version >nul 2>&1
        if not errorlevel 1 (
            set "PYTHON_EXE=py -3"
        )
    )
)

if "%PYTHON_EXE%"=="" (
    echo [ERROR] Python was not found on your system!
    echo Please install Python 3.11+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo        Found: %PYTHON_EXE%

:: [2/4] Clear any stuck processes holding Port 8000
echo [2/4] Ensuring Port 8000 is clean and available...
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo        Freeing port 8000 from lingering process (PID: %%p)...
    taskkill /F /PID %%p >nul 2>&1
)

:: [3/4] Verify frontend production bundle
echo [3/4] Checking dashboard web bundle...
if not exist "frontend\dist\index.html" (
    echo        Frontend bundle not found. Building dashboard now...
    cd frontend
    call npm.cmd run build
    cd ..
) else (
    echo        Frontend bundle verified.
)

:: [4/4] Launching FastAPI Backend & Dashboard
echo [4/4] Launching application on http://127.0.0.1:8000 ...
echo [INFO] Background browser watcher waiting for API readiness...
echo [INFO] DO NOT CLOSE THIS WINDOW - closing this window will stop the web server!
echo.

:: Automatically open browser once the backend health check passes
start "" cmd /c "for /l %%i in (1,1,45) do ( curl.exe -s http://127.0.0.1:8000/api/health >nul 2>&1 && ( start http://127.0.0.1:8000 & exit ) || ( ping 127.0.0.1 -n 2 >nul ) ) & start http://127.0.0.1:8000"

:server_loop
"%PYTHON_EXE%" -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
echo.
echo [FOREVER WATCHDOG] Process stopped or interrupted.
echo [FOREVER WATCHDOG] Auto-restarting server in 2 seconds to stay running forever...
timeout /t 2 /nobreak >nul
goto server_loop
