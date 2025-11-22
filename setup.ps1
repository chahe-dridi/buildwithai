# Tetris Django - Quick Setup Script for Windows PowerShell
# Run this script to set up and start the Tetris game

Write-Host "🎮 Tetris Django - Quick Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green

# Create virtual environment
Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Check MongoDB
Write-Host ""
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB is not running" -ForegroundColor Yellow
    Write-Host "Please start MongoDB manually or the app will fail" -ForegroundColor Yellow
}

# Check Redis
Write-Host ""
Write-Host "Checking Redis..." -ForegroundColor Yellow
$redisProcess = Get-Process redis-server -ErrorAction SilentlyContinue
if ($redisProcess) {
    Write-Host "✅ Redis is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis is not running" -ForegroundColor Yellow
    Write-Host "WebSockets (multiplayer) will not work without Redis" -ForegroundColor Yellow
}

# Run migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate
Write-Host "✅ Migrations complete" -ForegroundColor Green

# Ask to create superuser
Write-Host ""
$createAdmin = Read-Host "Do you want to create an admin user? (y/n)"
if ($createAdmin -eq "y" -or $createAdmin -eq "Y") {
    python manage.py createsuperuser
}

# Start server
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Tetris server..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the game at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Admin panel at: http://localhost:8000/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

daphne -p 8000 tetris_project.asgi:application
