# 🐳 Docker Deployment for LactaLink Web

Production-ready Docker configuration for deploying the LactaLink Next.js application from a Turborepo monorepo to Coolify or any container platform.

## 📋 What's Included

This Docker setup provides:

- ✅ **Multi-stage Dockerfile** - Optimized for size and build speed
- ✅ **pnpm + Turborepo support** - Full monorepo compatibility
- ✅ **Next.js standalone output** - Self-contained production build
- ✅ **Non-root user** - Security best practices
- ✅ **Health checks** - Container orchestration ready
- ✅ **BuildKit caching** - 40-60% faster builds
- ✅ **Ubuntu-based** - Reliable dependency support (~300-400MB final image)

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

## 📁 Files Overview

| File                           | Purpose                                       |
| ------------------------------ | --------------------------------------------- |
| `Dockerfile`                   | Multi-stage production build configuration    |
| `../../.dockerignore`          | Excludes unnecessary files from build context |
| `.env.example`                 | Template for environment variables            |
| `DOCKER_README.md` (this file) | Quick start guide                             |
| `src/app/api/health/route.ts`  | Health check endpoint                         |

## 🏗️ Architecture

### Build Stages

1. **Base** - Ubuntu + Node.js + pnpm setup
2. **Prepare** - Extract web app + dependencies using `turbo prune`
3. **Dependencies** - Install only required dependencies with caching
4. **Builder** - Build Next.js app via Turborepo
5. **Runner** - Minimal runtime with standalone output

### Image Sizes

- Final production image: **300-400 MB**
- Without multi-stage: 1-2 GB ❌

### Build Performance

- First build: 5-8 minutes
- Cached builds: 30-90 seconds ⚡

## 🔧 Coolify Configuration

### Build Settings

- **Build Context**: `/` (monorepo root)
- **Dockerfile Path**: `./apps/web/Dockerfile`
- **Enable BuildKit**: ✅
- **Docker Build Secrets**: Enabled for sensitive variables

> 💡 The build context must be the monorepo root, not `apps/web/`

### Runtime Settings

- **Port**: `3000`
- **Start Command**: Auto (uses Dockerfile CMD)
- **Health Check Path**: `/api/health`

### Environment Variables

Configure in Coolify:

1. **Build Arguments** - Non-sensitive public variables
2. **Build Secrets** - Sensitive build-time variables
3. **Environment Variables** - Runtime variables

> ⚠️ Variables prefixed with `NEXT_PUBLIC_` must be set at build time!

## 📖 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide with:
  - Detailed stage explanations
  - Northflank configuration
  - Performance optimizations
  - Troubleshooting tips

- **[DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md)** - Quick command reference

## 🧪 Local Testing

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

**Solution**: Build dependencies are already included in the Dockerfile:

```dockerfile
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev
```

### Large image size

**Solution**: Verify standalone output:

```bash
docker run --rm -it lactalink-web:latest sh
ls -lah apps/web/.next/standalone
```

## 🔐 Security

- ✅ Non-root user (`nextjs:nodejs`)
- ✅ Ubuntu base with security updates
- ✅ Docker Build Secrets for sensitive data
- ✅ `.dockerignore` excludes sensitive files
- ✅ Health checks for monitoring

## 📊 Performance Tips

1. **Use BuildKit** (enabled by default in Docker 23.0+)
2. **Enable layer caching** in CI/CD
3. **Use `--prefer-offline`** for pnpm installs (already configured)
4. **Multi-architecture builds** for ARM support

## 🚢 Deployment Checklist

- [ ] Environment variables configured in Coolify
- [ ] Build arguments and secrets set correctly
- [ ] Health check endpoint accessible
- [ ] Database connection tested
- [ ] S3/Supabase storage configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

## 🆘 Support

**Issues?** Check the troubleshooting section in [DEPLOYMENT.md](../../docs/deployment/WEB_DEPLOYMENT.md)

**Need help?** Review:

- Container logs in Coolify
- Docker build output
- Health check endpoint response

## 📚 Additional Resources

- [Turborepo Docker Guide](https://turbo.build/repo/docs/handbook/deploying-with-docker)
- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Coolify Documentation](https://coolify.io/docs)
- [pnpm Docker Guide](https://pnpm.io/docker)
- [Docker Build Secrets](https://docs.docker.com/build/building/secrets/)

---

**Ready to deploy?** Follow the complete guide in [DEPLOYMENT.md](./DEPLOYMENT.md) 🚀
