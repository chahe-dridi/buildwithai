@echo off
echo 🎮 Tetris Django - Quick Start
echo ==============================
echo.

echo Starting virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting Tetris server...
echo Access at: http://localhost:8000
echo Press Ctrl+C to stop
echo.

daphne -p 8000 tetris_project.asgi:application
