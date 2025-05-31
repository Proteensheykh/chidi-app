# CHIDI Application

CHIDI is an AI-powered business assistant designed to help small businesses manage customer communications, inventory, and business context more efficiently.

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Prisma, Supabase (PostgreSQL)
- **State Management**: React Context
- **Authentication**: Supabase Auth
- **Caching**: Redis
- **Deployment**: Docker containerization

## Project Structure

```
chidi-app/
├── frontend/                # Next.js frontend application
│   ├── src/                 # Source code
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React components
│   │   │   ├── ui/          # UI components from shadcn/ui
│   │   │   └── layout/      # Layout components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utility functions and API clients
│   ├── prisma/              # Prisma schema and migrations
│   └── public/              # Static assets
├── backend/                 # FastAPI backend application (to be implemented)
└── docker-compose.yml       # Docker Compose configuration
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose (for containerized deployment)
- Supabase account and project

### Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chidi-app
   ```

2. Set up environment variables:
   - Copy `.env.local.example` to `.env.local` in the frontend directory
   - Fill in your Supabase URL and anon key
   - Set up Redis URL for local development

3. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Initialize Prisma:
   ```bash
   npx prisma generate
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Testing

Run tests with:

```bash
npm run test
```

For watch mode:

```bash
npm run test:watch
```

### Building for Production

Build the application:

```bash
npm run build
```

### Docker Deployment

To deploy the entire stack using Docker:

```bash
docker-compose up -d
```

## Features

- **User Authentication**: Secure login, signup, and password reset via Supabase
- **Dashboard**: Overview of business metrics and quick actions
- **Product Management**: Inventory tracking and management
- **Conversation Management**: Social media conversation tracking and AI-assisted responses
- **Business Context**: Capture and maintain business information

## Code Standards

- TypeScript with strict type checking
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture with shadcn/ui
- Responsive design with Tailwind CSS

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## License

[MIT License](LICENSE)
