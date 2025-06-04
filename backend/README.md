# CHIDI App Backend

This is the FastAPI backend for the CHIDI App, providing API endpoints for business context management, conversations, and AI-powered assistance.

## Features

- RESTful API with FastAPI
- Supabase Auth integration
- PostgreSQL database with Prisma ORM
- WebSocket support for real-time messaging
- Celery with Redis for background tasks
- Docker support for local development

## Setup

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- Supabase account
- PostgreSQL with Vector extension

### Environment Variables

Copy the `.env.example` file to `.env` and fill in the required variables:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service role key
- `OPENAI_API_KEY`: OpenAI API key for AI features

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Generate Prisma client:

```bash
prisma generate
```

3. Start the development server:

```bash
uvicorn main:app --reload
```

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker

To run the backend with Docker:

```bash
docker-compose up backend
```

This will start the backend service and its dependencies (Redis).

## Testing

Run tests with pytest:

```bash
pytest
```

## Project Structure

- `app/`: Main application package
  - `api/`: API endpoints
    - `v1/`: API version 1
      - `endpoints/`: Individual endpoint modules
  - `core/`: Core functionality (config, auth)
  - `db/`: Database related code
  - `models/`: Data models
  - `schemas/`: Pydantic schemas for request/response validation
  - `services/`: Business logic services
- `prisma/`: Prisma schema and migrations
- `tests/`: Test cases
