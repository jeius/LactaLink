# 🐳 Docker Deployment for LactaLink Web

Production-ready Docker configuration for deploying the LactaLink Next.js application from a Turborepo monorepo to Northflank or any container platform.

## 📋 What's Included

This Docker setup provides:

- ✅ **Multi-stage Dockerfile** - Optimized for size and build speed
- ✅ **pnpm + Turborepo support** - Full monorepo compatibility
- ✅ **Next.js standalone output** - Self-contained production build
- ✅ **Non-root user** - Security best practices
- ✅ **Health checks** - Container orchestration ready
- ✅ **BuildKit caching** - 40-60% faster builds
- ✅ **Alpine-based** - Minimal attack surface (~150-250MB final image)

## 🚀 Quick Start

### 1. Create environment file

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 2. Build the Docker image

**From monorepo root:**

```bash
cd ../.. # if you're in apps/web/
docker build -f apps/web/Dockerfile -t lactalink-web:latest .
```

### 3. Run locally

**From apps/web directory:**

```bash
docker-compose up
```

Access at: http://localhost:3000

## 📁 Files Overview

| File                           | Purpose                                       |
| ------------------------------ | --------------------------------------------- |
| `Dockerfile`                   | Multi-stage production build configuration    |
| `docker-compose.yml`           | Local testing setup                           |
| `../../.dockerignore`          | Excludes unnecessary files from build context |
| `.env.example`                 | Template for environment variables            |
| `DOCKER_README.md` (this file) | Quick start guide                             |
| `DOCKER_COMMANDS.md`           | Quick reference for common commands           |
| `src/app/api/health/route.ts`  | Health check endpoint                         |

## 🏗️ Architecture

### Build Stages

1. **Base** - Alpine Linux + pnpm setup
2. **Prune** - Extract web app + dependencies using `turbo prune`
3. **Dependencies** - Install only required dependencies with caching
4. **Builder** - Build Next.js app via Turborepo
5. **Runner** - Minimal runtime with standalone output

### Image Sizes

- Final production image: **150-250 MB**
- Without multi-stage: 1-2 GB ❌

### Build Performance

- First build: 5-8 minutes
- Cached builds: 30-90 seconds ⚡

## 🔧 Northflank Configuration

### Build Settings

- **Build Context**: `/` (monorepo root)
- **Dockerfile Path**: `./apps/web/Dockerfile`
- **Enable BuildKit**: ✅

> 💡 The build context must be the monorepo root, not `apps/web/`

### Runtime Settings

- **Port**: `3000`
- **Start Command**: Auto (uses Dockerfile CMD)
- **Health Check Path**: `/api/health`

### Environment Variables

Set ALL variables from `.env.example` in both:

1. **Build Arguments** (for build-time)
2. **Environment Variables** (for runtime)

> ⚠️ Variables prefixed with `NEXT_PUBLIC_` must be set at build time!

## 📖 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide with:
  - Detailed stage explanations
  - Northflank configuration
  - Performance optimizations
  - Troubleshooting tips

- **[DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md)** - Quick command reference

## 🧪 Local Testing

### Using Docker Compose

```bash
# Start the application
docker-compose up --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker directly

**From monorepo root:**

```bash
# Build
cd ../.. # if you're in apps/web/
docker build -f apps/web/Dockerfile -t lactalink-web:latest .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URI=postgresql://... \
  -e PAYLOAD_SECRET=your-secret \
  lactalink-web:latest

# Check health
curl http://localhost:3000/api/health
```

## 🐛 Troubleshooting

### Build fails with "Cannot find module"

**Solution**: Ensure all workspace dependencies are installed.

```bash
# Clean build (from monorepo root)
cd ../.. # if you're in apps/web/
docker build -f apps/web/Dockerfile --no-cache -t lactalink-web:latest .
```

### "canvas" or "sharp" errors

**Solution**: Add build dependencies to Dockerfile:

```dockerfile
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev
```

### Large image size

**Solution**: Verify standalone output:

```bash
docker run --rm -it lactalink-web:latest sh
ls -lah apps/web/.next/standalone
```

## 🔐 Security

- ✅ Non-root user (`nextjs:nodejs`)
- ✅ Minimal Alpine base image
- ✅ No secrets in Dockerfile
- ✅ `.dockerignore` excludes sensitive files
- ✅ Health checks for monitoring

## 📊 Performance Tips

1. **Use BuildKit** (enabled by default in Docker 23.0+)
2. **Enable layer caching** in CI/CD
3. **Use `--prefer-offline`** for pnpm installs (already configured)
4. **Multi-architecture builds** for ARM support

## 🚢 Deployment Checklist

- [ ] Environment variables configured in Northflank
- [ ] Build arguments set correctly
- [ ] Health check endpoint accessible
- [ ] Database connection tested
- [ ] S3/Supabase storage configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

## 🆘 Support

**Issues?** Check the troubleshooting section in [DEPLOYMENT.md](./DEPLOYMENT.md)

**Need help?** Review:

- Container logs in Northflank
- Docker build output
- Health check endpoint response

## 📚 Additional Resources

- [Turborepo Docker Guide](https://turbo.build/repo/docs/handbook/deploying-with-docker)
- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Northflank Documentation](https://northflank.com/docs)
- [pnpm Docker Guide](https://pnpm.io/docker)

---

**Ready to deploy?** Follow the complete guide in [DEPLOYMENT.md](./DEPLOYMENT.md) 🚀
