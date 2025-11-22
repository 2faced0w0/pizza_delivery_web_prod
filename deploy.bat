@echo off
REM Pizza Delivery App - Docker Build and Run Script (Windows)

echo.
echo  Pizza Delivery App - Docker Deployment
echo ==========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Check if docker-compose is available
docker-compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: docker-compose is not installed.
    exit /b 1
)

echo ✅ docker-compose is available
echo.

REM Stop any running containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start services
echo.
echo 🔨 Building and starting services...
docker-compose up -d --build

REM Wait for services to be healthy
echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Check service status
echo.
echo 📊 Service Status:
docker-compose ps

echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost
echo    Backend:  http://localhost:4000
echo    Database: localhost:5432
echo.
echo 📝 Useful commands:
echo    View logs:        docker-compose logs -f
echo    Stop services:    docker-compose down
echo    Restart:          docker-compose restart
echo.

pause
