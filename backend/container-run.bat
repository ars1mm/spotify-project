@echo off
echo Stopping and removing existing container...
docker stop spotify-backend 2>nul
docker rm spotify-backend 2>nul

echo Building new image...
docker build -t spotify-backend .

if %ERRORLEVEL% EQU 0 (
    echo Starting new container...
    docker run --name spotify-backend -p 127.0.0.1:8000:8000 -d spotify-backend
    echo Backend container rebuilt and started successfully!
) else (
    echo Build failed!
    exit /b 1
)