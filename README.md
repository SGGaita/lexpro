# LexPro - Law Firm Management System

A full-stack application for managing law firm operations with Docker containerization.

## Architecture

- **Frontend**: Next.js 16 with React 19 and Material-UI
- **Backend**: FastAPI with Python 3.12
- **Database**: PostgreSQL 16
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd lexpro
```

### 2. Environment Setup

Secrets are never committed. Create a root `.env` for Docker Compose from the template and fill in real values:

```bash
cp .env.example .env
# Generate values:
python -c "import secrets; print(secrets.token_urlsafe(24))"   # POSTGRES_PASSWORD
python -c "import secrets; print(secrets.token_urlsafe(48))"   # SECRET_KEY
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"  # ENCRYPTION_KEY
```

For running the backend outside Docker, copy `backend/.env.example` to `backend/.env` the same way.

Security defaults:

- `DEBUG` defaults to `false`.
- With `ENVIRONMENT=staging` or `production` the API refuses to start unless `SECRET_KEY` (32+ chars) and a valid `ENCRYPTION_KEY` are set and `DEBUG=false`. API docs (`/docs`, `/redoc`, `/openapi.json`) are disabled in production.
- The destructive `/api/v1/admin/*` endpoints are mounted only when `ENVIRONMENT=development` **and** `ENABLE_ADMIN_ROUTES=true`.

#### Rotating `ENCRYPTION_KEY`

Stored storage credentials are encrypted with `ENCRYPTION_KEY`. To rotate:

1. Set `ENCRYPTION_KEYS_OLD=<current key>` and `ENCRYPTION_KEY=<new key>`.
2. Run `docker compose exec api python -m app.scripts.rotate_encryption_key`.
3. Remove the old key from `ENCRYPTION_KEYS_OLD` and restart.

### 3. Run with Docker Compose

From the root directory:

```bash
docker-compose up --build
```

This will start all services:
- **PostgreSQL**: Database server
- **Backend API**: FastAPI application (internal port 8000)
- **Frontend**: Next.js application (internal port 3000)
- **Nginx**: Reverse proxy on port 80

### 4. Access the Application

- **Application**: http://localhost
- **API Documentation**: http://localhost/docs
- **API Endpoints**: http://localhost/api

## Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Docker Services

### Services Overview

- **db**: PostgreSQL database
- **api**: FastAPI backend
- **frontend**: Next.js frontend
- **nginx**: Reverse proxy

### Useful Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f api

# Execute commands in containers
docker-compose exec api bash
docker-compose exec frontend sh
```

## Project Structure

```
lexpro/
├── docker-compose.yml
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── public/
│   ├── styles/
│   ├── Dockerfile
│   ├── package.json
│   └── next.config.mjs
└── nginx/
    ├── Dockerfile
    └── nginx.conf
```

## Production Deployment

For production deployment:

1. Update environment variables in `.env`
2. Change `SECRET_KEY` in docker-compose.yml
3. Set `DEBUG: "false"` for the API service
4. Configure SSL/TLS certificates in Nginx
5. Use production-ready database credentials

## License

[Your License Here]
