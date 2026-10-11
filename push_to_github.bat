@echo off
setlocal
echo ============================================================
echo   Pushing AI Humanizer to GitHub (@bhanusrikarsai)
echo ============================================================
echo.
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;%PATH%"

git status
echo.
echo Pushing to https://github.com/bhanusrikarsai/ai-humanizer.git ...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ============================================================
    echo   SUCCESS! Pushed to https://github.com/bhanusrikarsai/ai-humanizer
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo   Note: If the repository doesn't exist yet, create it at:
    echo   https://github.com/new (Name: ai-humanizer)
    echo   Then run this script again!
    echo ============================================================
)

echo.
pause
