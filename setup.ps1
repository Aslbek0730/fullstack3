# Create necessary directories
New-Item -ItemType Directory -Force -Path "backend/staticfiles"
New-Item -ItemType Directory -Force -Path "backend/media"
New-Item -ItemType Directory -Force -Path "frontend/node_modules"

# Copy environment files if they don't exist
if (-not (Test-Path "backend/.env")) {
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "Created backend/.env"
}

if (-not (Test-Path "frontend/.env")) {
    Copy-Item "frontend/.env.example" "frontend/.env"
    Write-Host "Created frontend/.env"
}

# Build and start containers
docker-compose -f docker-compose.dev.yml up --build 