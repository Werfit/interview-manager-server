# Interview Manager

A robust backend service for managing interviews, built with NestJS. This service provides features for interview scheduling, management, and processing, with support for AI-powered interview analysis and real-time communication.

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Docker and Docker Compose
- PostgreSQL 16
- Redis 7
- ChromaDB

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development environment:

```bash
docker-compose -f docker-compose.development.yaml up -d
```

5. Run database migrations:

```bash
pnpm prisma migrate dev
```

## Development

Start the development server:

```bash
pnpm start:dev
```

The server will be available at `http://localhost:3000`.

## Available Scripts

- `pnpm start` - Start the server
- `pnpm start:dev` - Start the server in development mode with hot-reload
- `pnpm start:debug` - Start the server in debug mode
- `pnpm start:prod` - Start the server in production mode
- `pnpm build` - Build the application
- `pnpm test` - Run tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm lint` - Run linting
- `pnpm format` - Format code

## Docker Deployment

For production deployment:

```bash
docker-compose -f docker-compose.production.yaml up -d
```

## TODO

- [ ] Add health checks (https://docs.nestjs.com/recipes/terminus)
