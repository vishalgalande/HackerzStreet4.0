@echo off
echo ============================================
echo   HackerzStreet — Backend Server Launcher
echo ============================================
echo.

cd /d "%~dp0src\backend"

:: Delete old broken venv if deps missing
if exist ".venv\Scripts\activate.bat" (
    .venv\Scripts\python.exe -c "import fastapi" 2>nul
    if errorlevel 1 (
        echo [!] Broken venv detected, recreating...
        rmdir /s /q .venv
    )
)

:: Create venv if it doesn't exist
if not exist ".venv" (
    echo [1/3] Creating virtual environment...
    python -m venv .venv
    echo      Done.
) else (
    echo [1/3] Virtual environment already exists.
)

:: Activate venv and install
echo [2/3] Activating venv and installing dependencies...
call .venv\Scripts\activate.bat
pip install fastapi uvicorn pydantic numpy httpx python-dotenv --quiet

:: Start server
echo.
echo [3/3] Starting FastAPI server on http://localhost:8000
echo.
echo      API docs: http://localhost:8000/docs
echo      Press Ctrl+C to stop.
echo ============================================
echo.
uvicorn main:app --reload --port 8000
