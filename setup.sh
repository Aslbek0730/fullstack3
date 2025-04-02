#!/bin/bash

# Create necessary directories
mkdir -p backend/staticfiles
mkdir -p backend/media
mkdir -p frontend/node_modules

# Copy environment files if they don't exist
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "Created backend/.env"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "Created frontend/.env"
fi

# Build and start containers
docker-compose -f docker-compose.dev.yml up --build backend

# Create superuser
docker-compose exec backend python manage.py createsuperuser 

# Stop containers
docker-compose down 