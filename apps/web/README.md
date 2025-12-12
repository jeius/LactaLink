# LactaLink Web

Backend and admin panel for the LactaLink mobile app, built with **Next.js** and **Payload CMS**.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org)
- **CMS**: [Payload CMS](https://payloadcms.com)
- **Database**: [Supabase (PostgreSQL)](https://supabase.com)
- **Storage**: [Supabase Storage](https://supabase.com) (via S3 adapter)
- **Authentication**: [Supabase Auth](https://supabase.com) + Google OAuth
- **Email**: [Resend API](https://resend.com)

## Development

### Prerequisites

- Node.js 22.x
- pnpm 10.x
- PostgreSQL database (Supabase)

### Setup

1. **Install dependencies** (from monorepo root):

   ```bash
   pnpm install
   ```

2. **Configure environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Build workspace dependencies**:

   ```bash
   pnpm build:packages
   ```

4. **Start development server**:
   ```bash
   pnpm dev:web
   ```

Access the app at http://localhost:3000

## Production Deployment

### Docker Deployment 🐳

This project includes production-ready Docker configuration for deployment to Northflank or any container platform.

**Documentation:**

- 📖 **[DOCKER_README.md](./DOCKER_README.md)** - Complete Docker setup guide
- 🚀 **[DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md)** - Quick command reference

**Files in this directory:**

- `Dockerfile` - Multi-stage production build
- `docker-compose.yml` - Local testing setup
- `.env.example` - Environment variables template

**Quick start:**

```bash
# From monorepo root
docker build -f apps/web/Dockerfile -t lactalink-web:latest .

# Or using docker-compose (from this directory)
docker-compose up --build
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm generate:types` - Generate Payload types
- `pnpm generate:schema` - Generate database schema

## Project Structure

```
apps/web/
├── src/
│   ├── app/              # Next.js app directory
│   ├── collections/      # Payload CMS collections
│   ├── components/       # React components
│   ├── endpoints/        # API endpoints
│   └── payload.config.ts # Payload CMS configuration
├── public/               # Static files
├── Dockerfile           # Production Docker image
└── docker-compose.yml   # Local Docker setup
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:

- `DATABASE_URI` - PostgreSQL connection string
- `PAYLOAD_SECRET` - Secret key for Payload CMS
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

## Contributing

See the main [README](../../README.md) for contribution guidelines.

## License

[MIT License](../../LICENSE.md)
