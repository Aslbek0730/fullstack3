# Shams Academy Platform

An AI-powered learning platform with integrated payment systems and personalized learning experiences.

## Features

- AI-powered course recommendations
- Interactive tests and exercises
- Multiple payment options (Click, Payme, Uzum Bank)
- AI chatbot assistant
- Personal development tracking
- Secure authentication
- Responsive design

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

## Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd shams-academy
```

2. Make the setup script executable:
```bash
chmod +x setup.sh
```

3. Run the setup script:
```bash
./setup.sh
```

4. Update environment variables:
   - Edit `backend/.env` with your backend configuration
   - Edit `frontend/.env` with your frontend configuration

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin interface: http://localhost:8000/admin

## Production Deployment

1. Build and start production containers:
```bash
docker-compose up --build
```

2. Access the application:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8000

## Development Commands

- Start development environment:
```bash
docker-compose -f docker-compose.dev.yml up
```

- Run migrations:
```bash
docker-compose exec backend python manage.py migrate
```

- Create superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

- View logs:
```bash
docker-compose logs -f
```

- Stop containers:
```bash
docker-compose down
```

## Project Structure

```
shams-academy/
├── backend/                 # Django backend
│   ├── apps/               # Django applications
│   ├── config/             # Django settings
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/               # Source code
│   └── package.json       # Node.js dependencies
├── docker-compose.yml     # Production configuration
├── docker-compose.dev.yml # Development configuration
└── setup.sh              # Setup script
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.