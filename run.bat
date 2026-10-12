@echo off
cd /d "%~dp0"
echo ======================================================================
echo Starting AI Humanizer & Natural Language Refinement Layer...
echo ======================================================================

set PYTHONUTF8=1
set PATH=%PATH%;C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312;C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\Scripts

echo [1/2] Verifying Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo Python not found on standard path. Using direct path...
    set PYTHON_EXE=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe
) else (
    set PYTHON_EXE=python
)

echo [2/2] Launching FastAPI Backend & Dashboard at http://127.0.0.1:8000 ...
echo [INFO] Waiting for NLP models to load into memory...
echo [INFO] DO NOT CLOSE THIS WINDOW - closing this window will stop the web server!
echo.

:: Automatically open browser once the backend health check passes
start "" cmd /c "for /l %%i in (1,1,30) do ( curl.exe -s http://127.0.0.1:8000/api/health >nul 2>&1 && ( start http://127.0.0.1:8000 & exit ) || ( ping 127.0.0.1 -n 2 >nul ) ) & start http://127.0.0.1:8000"

"%PYTHON_EXE%" -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
pause

