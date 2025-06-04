# CHIDI App Deployment Guide

This document outlines the deployment process for the CHIDI application, including CI/CD pipeline configuration, environment setup, and database migration procedures.

## CI/CD Pipeline

The CHIDI app uses GitHub Actions for continuous integration and continuous deployment to Render.

### Pipeline Structure

1. **Backend Pipeline** (`.github/workflows/backend-ci-cd.yml`)
   - Triggered on pushes/PRs affecting backend code
   - Runs tests with Redis service container
   - Generates Prisma client
   - Deploys to Render on successful merge to main
   - Runs database migrations automatically

2. **Frontend Pipeline** (`.github/workflows/frontend-ci-cd.yml`)
   - Triggered on pushes/PRs affecting frontend code
   - Runs linting, type checking, and tests
   - Builds the Next.js application
   - Deploys to Render on successful merge to main

### Required Secrets

The following secrets must be configured in GitHub repository settings:

- `TEST_DATABASE_URL`: PostgreSQL connection string for testing
- `PROD_DATABASE_URL`: Production PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL for frontend
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key for frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL for frontend
- `RENDER_API_KEY`: API key for Render deployments
- `OPENAI_API_KEY`: OpenAI API key for AI features

## Render Deployment

The application is deployed to Render using the configuration in `render.yaml` files.

### Services

1. **Backend Web Service**
   - FastAPI application
   - Automatic deployments from main branch
   - Health check endpoint at `/api/v1/health`

2. **Redis Service**
   - Used for caching and Celery tasks
   - Free tier with IP allowlist

3. **Worker Service**
   - Celery worker for background tasks
   - Connected to the same Redis instance

4. **Frontend Web Service**
   - Next.js application
   - Automatic deployments from main branch
   - Configured with proper caching headers

### Environment Variables

Environment variables are managed in Render's dashboard and through the `render.yaml` configuration. Sensitive variables are not stored in the repository and must be manually configured in Render.

## Database Migrations

Database migrations are handled automatically through Prisma and the CI/CD pipeline:

1. **Development Workflow**
   - Create migration: `npx prisma migrate dev --name <migration-name>`
   - Apply migration: `npx prisma migrate dev`

2. **Production Deployment**
   - Migrations run automatically after deployment via GitHub Actions
   - Uses `prisma migrate deploy` command
   - Requires `PROD_DATABASE_URL` secret

## Manual Deployment

If needed, you can deploy manually using the Render CLI:

```bash
# Install Render CLI
npm install -g @render/cli

# Set API key
export RENDER_API_KEY=your_api_key

# Deploy backend
render deploy --service chidi-backend

# Deploy frontend
render deploy --service chidi-frontend
```

## Monitoring and Logs

- Application logs are available in the Render dashboard
- Health checks monitor the backend service
- Set up alerts in Render for service outages

## Rollback Procedure

If a deployment causes issues:

1. Identify the problematic commit
2. Revert the commit in GitHub
3. Push the revert to trigger a new deployment
4. If urgent, use Render dashboard to roll back to a previous build

## Security Considerations

- All sensitive keys and credentials are stored as secrets
- Database access is restricted by IP in Supabase
- Redis instance is protected by password
- CORS is configured to allow only the frontend domain
