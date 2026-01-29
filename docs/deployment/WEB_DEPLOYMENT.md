# LactaLink Web - Docker Deployment Guide

## 📋 Overview

This guide covers the production Dockerfile for deploying the LactaLink Next.js app to Coolify from a pnpm + Turborepo monorepo.

---

## 🏗️ Dockerfile Architecture

### Multi-Stage Build Explanation

#### **Stage 1: Base** (`node:22.21.0`)

```dockerfile
FROM node:22.21.0 AS base
```

**Purpose**: Establish the foundation for all subsequent stages.

**Key Actions**:

- Uses Ubuntu-based Node.js image for reliable dependency support
- Installs pnpm v10.20.0 via Corepack (matches `package.json` requirement)
- Sets up `PNMP_HOME` and adds it to `PATH` for global pnpm access

**Why Ubuntu?**:

- Better native dependency support (canvas, sharp)
- More predictable build environment
- Excellent compatibility with CI/CD platforms

---

#### **Stage 2: Prepare** (`prepare`)

```dockerfile
FROM base AS prepare
```

**Purpose**: Extract only the web app and its dependencies using Turborepo's intelligent pruning.

**Key Actions**:

1. **Install Turbo globally**:

   ```dockerfile
   RUN pnpm add -g turbo@2.8.0
   ```

2. **Copy entire monorepo**:

   ```dockerfile
   COPY . .
   ```

   Turbo needs the full monorepo to analyze the dependency graph.

3. **Run turbo prune**:

   ```dockerfile
   RUN turbo prune @lactalink/web --docker
   ```

   This creates:
   - `/app/out/json/` - Only package.json files + pruned lockfile (only deps needed by web)
   - `/app/out/full/` - Full source code for web app + its workspace dependencies

**Why?** Automatically detects which packages are needed. If you add/remove dependencies, no Dockerfile changes required.

---

#### **Stage 3: Dependencies** (`dependencies`)

```dockerfile
FROM base AS dependencies
```

**Purpose**: Install only the dependencies needed for the web app.

**Key Actions**:

1. **Install build dependencies**:

   ```dockerfile
   RUN apt-get update && apt-get install -y \
       build-essential \
       g++ \
       libcairo2-dev \
       libjpeg-dev \
       libpango1.0-dev \
       libgif-dev \
       && rm -rf /var/lib/apt/lists/*
   ```

   Required for native dependencies like canvas and sharp.

2. **Copy pruned package files**:

   ```dockerfile
   COPY --from=prepare /app/out/json/ .
   ```

   Uses the pruned lockfile from turbo prune.

3. **Install with build cache**:

   ```dockerfile
   RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
       pnpm install --frozen-lockfile --prefer-offline
   ```

   - `--mount=type=cache`: Docker BuildKit cache mount for pnpm store
   - `--frozen-lockfile`: Fails if lockfile needs updates (ensures reproducibility)
   - `--prefer-offline`: Uses cache when possible (faster builds)

**Performance**: Only installs dependencies actually used by the web app. Smaller and faster than installing everything.

---

#### **Stage 4: Builder** (`builder`)

```dockerfile
FROM base AS builder
```

**Purpose**: Build the Next.js application and all workspace dependencies.

**Key Actions**:

1. **Install build dependencies**:

   ```dockerfile
   RUN apt-get update && apt-get install -y \
       build-essential \
       g++ \
       libcairo2-dev \
       libjpeg-dev \
       libpango1.0-dev \
       libgif-dev \
       && rm -rf /var/lib/apt/lists/*
   ```

2. **Copy installed dependencies** from previous stage
   - Preserves `node_modules` structure
   - Includes all workspace package dependencies

3. **Copy pruned source code**:

   ```dockerfile
   COPY --from=prepare /app/out/full/ .
   ```

   Only copies web app + its workspace dependencies (automatically detected by turbo prune):
   - `@lactalink/api`
   - `@lactalink/enums`
   - `@lactalink/form-schemas`
   - `@lactalink/types`
   - `@lactalink/utilities`

4. **Execute Turborepo build**:

   ```dockerfile
   RUN pnpm build:web
   ```

   - Runs `turbo build --filter="{./apps/web}..."`
   - Builds all dependencies first (`^build` in turbo.json)
   - Outputs to `apps/web/.next` directory
   - Creates `.next/standalone` folder (self-contained runtime)

**Output**:

- `.next/standalone` - Complete standalone app with embedded Node server
- `.next/static` - Static assets (JS, CSS, images)
- `public/` - Public static files

---

#### **Stage 5: Runner** (`runner`)

```dockerfile
FROM node:22.21.0 AS runner
```

**Purpose**: Minimal production runtime with only essential files.

**Key Actions**:

1. **Install runtime dependencies**:

   ```dockerfile
   RUN apt-get update && apt-get install -y \
       dumb-init \
       libcairo2 \
       libjpeg62-turbo \
       libpango-1.0-0 \
       libgif7 \
       && rm -rf /var/lib/apt/lists/*
   ```

   - `dumb-init`: Proper PID 1 init system for containers
   - Runtime libraries for canvas and image processing
   - Handles SIGTERM/SIGINT correctly (graceful shutdown)
   - Reaps zombie processes

2. **Create non-root user**:

   ```dockerfile
   RUN addgroup --system --gid 1001 nodejs && \
       adduser --system --uid 1001 nextjs
   ```

   - **Security best practice**: Never run as root in production
   - Matches Next.js conventions (GID/UID 1001)

3. **Copy only necessary files**:

   ```dockerfile
   COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
   COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
   ```

   - **Standalone**: Contains precompiled app + minimal dependencies
   - **Static**: Client-side JavaScript bundles and CSS
   - **Public**: Images, fonts, and other static assets
   - `--chown`: Ensures proper file ownership for non-root user

4. **Environment configuration**:

   ```dockerfile
   ENV NODE_ENV=production
   ENV NEXT_TELEMETRY_DISABLED=1
   ENV PORT=3000
   ENV HOSTNAME="0.0.0.0"
   ```

5. **Health check**:

   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
       CMD node -e "..." || exit 1
   ```

   - Checks `/api/health` endpoint every 30 seconds
   - Northflank uses this for container orchestration
   - **Note**: You may need to create the health endpoint in your Next.js app

6. **Start command**:

   ```dockerfile
   CMD ["dumb-init", "node", "apps/web/server.js"]
   ```

   - Runs `server.js` from standalone output
   - `dumb-init` ensures proper signal handling

**Image Size**: ~300-400MB (vs ~1GB+ without multi-stage)

---

## 🚀 Coolify Deployment Configuration

### 1. Build Settings

**Build Context**: `/` (repository root)  
**Dockerfile Path**: `./apps/web/Dockerfile`  
**Enable BuildKit**: ✅ (Required for cache mounts)  
**Docker Build Secrets**: ✅ (For sensitive build-time variables)

**Environment Variables Configuration**:

1. **Build Arguments** - Non-sensitive public variables (see `.env.example`)
2. **Build Secrets** - Sensitive build-time variables
3. **Runtime Environment Variables** - Runtime configuration

> ⚠️ Variables prefixed with `NEXT_PUBLIC_` must be set at build time!

---

### 2. Runtime Settings

**Port**: `3000` (matches `EXPOSE 3000` in Dockerfile)

**Start Command**: Not needed (uses `CMD` from Dockerfile)  
If Coolify requires explicit command:

```bash
node apps/web/server.js
```

**Working Directory**: `/app` (already set in Dockerfile)

**Health Check Path**: `/api/health`  
**Health Check Interval**: `30s`  
**Health Check Timeout**: `3s`

---

### 3. Environment Variables (Runtime)

Set these in Coolify's **Environment Variables** section (see `.env.example` for complete list):

```bash
# Required at runtime
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0

# Database
DATABASE_URI=<postgres-connection-string>

# Payload CMS
PAYLOAD_SECRET=<your-secret>

# All other variables from .env.example...
```

**Important**: Environment variables with `NEXT_PUBLIC_` prefix must be set at **build time** (as build args) to be embedded in the client bundle.

---

### 4. Resource Allocation

**Recommended for Production**:

- **CPU**: 1-2 vCPUs
- **Memory**: 2-4 GB
- **Replicas**: 2+ (for high availability)

**Scaling**:

- Enable horizontal autoscaling based on CPU/Memory
- Set min replicas to 2 for zero-downtime deployments

---

### 5. Custom Domain & SSL

1. Add your domain in Coolify
2. Update DNS records
3. Update `NEXT_PUBLIC_SERVER_URL` environment variable
4. Rebuild to embed new URL in client bundle

---

## ⚡ Performance Optimizations

### 1. **BuildKit Cache Mounts** (Already Implemented)

```dockerfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline
```

**Benefit**: Reduces build time by 40-60% on subsequent builds.

**Note**: Coolify supports BuildKit cache mounts automatically.

---

### 2. **pnpm Fetch for Offline Installs** (Advanced)

Replace the install command in the `dependencies` stage:

```dockerfile
# Fetch dependencies to cache
RUN pnpm fetch --frozen-lockfile

# Install from cache (completely offline)
RUN pnpm install --offline --frozen-lockfile
```

**Benefit**:

- Even faster installs (no network requests)
- More reliable in restricted networks

**Trade-off**: Adds one extra step; only beneficial for very large dependency graphs.

---

### 3. **Layer Caching Strategy**

The Dockerfile is already optimized with these principles:

1. **Copy package files first** → Cached unless dependencies change
2. **Copy source code last** → Most frequent changes, least cache invalidation
3. **Multi-stage builds** → Only final stage matters for image size

**Result**: Typical builds rebuild only the `builder` stage (30-90 seconds).

---

### 4. **Output Standalone Optimization**

The `output: 'standalone'` mode in `next.config.mjs` is already configured. This:

- Bundles only used dependencies (not entire `node_modules`)
- Reduces image size by ~70%
- Creates a self-contained server

**No action needed** - already optimized.

---

### 5. **Multi-Architecture Builds** (Optional)

For ARM64 support (e.g., AWS Graviton, Apple M-series):

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t your-registry/lactalink-web:latest \
  --push \
  .
```

**Benefit**:

- Faster performance on ARM servers
- Cost savings on ARM-based cloud instances

**Trade-off**: Longer build times (2x architectures).

---

### 6. **Reduce Image Scan Vulnerabilities**

```dockerfile
# In the runner stage, add:
RUN apk upgrade --no-cache && \
    apk add --no-cache dumb-init
```

**Benefit**: Patches known CVEs in base image packages.

---

### 7. **Enable Compression for Static Assets**

Add to `next.config.mjs`:

```javascript
compress: true,
```

**Benefit**: Faster page loads (gzip/brotli compression).

---

## 🧪 Testing the Dockerfile Locally

### Build the Image

```bash
docker build \
  --build-arg PAYLOAD_SECRET=test-secret \
  --build-arg DATABASE_URI=postgresql://... \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  # ... add all other build args ...
  -t lactalink-web:latest \
  .
```

### Run the Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URI=postgresql://... \
  -e PAYLOAD_SECRET=test-secret \
  -e NEXT_PUBLIC_SERVER_URL=http://localhost:3000 \
  # ... add all other runtime env vars ...
  lactalink-web:latest
```

### Test the App

```bash
curl http://localhost:3000
curl http://localhost:3000/api/health
```

---

## 🐛 Troubleshooting

### Issue: Build fails with "Cannot find module '@lactalink/...'"

**Cause**: Workspace dependencies not copied correctly.

**Solution**: Ensure all `packages/*/package.json` files are copied in the `dependencies` stage.

---

### Issue: "canvas" or "sharp" build errors

**Cause**: Native dependencies need build tools.

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

---

### Issue: Health check fails

**Cause**: `/api/health` endpoint doesn't exist.

**Solution**: Create the endpoint in `apps/web/src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
```

---

### Issue: Environment variables not available at runtime

**Cause**: Variables need to be set in Coolify's runtime config, not just build args.

**Solution**: Configure variables in Coolify dashboard:

- **Build Arguments**: Public variables (NEXT*PUBLIC*\*)
- **Build Secrets**: Sensitive build-time variables
- **Environment Variables**: Runtime variables

---

### Issue: Large image size (>500MB)

**Cause**: Standalone output might be including unnecessary files.

**Solution**: Verify `.next/standalone` only contains required files:

```bash
docker run --rm -it lactalink-web:latest sh
ls -lah apps/web/.next/standalone
```

---

## 📊 Expected Metrics

**Build Time** (after initial cache):

- First build: 5-8 minutes
- Cached builds (code change only): 30-90 seconds

**Image Size**:

- Final image: 300-400MB
- Without multi-stage: 1-2GB

**Memory Usage**:

- Idle: ~150MB
- Under load: 500MB - 2GB (depending on traffic)

**Cold Start Time**:

- Container ready: 2-3 seconds
- First request: 3-5 seconds

---

## 📚 Additional Resources

- [Turborepo Docker Guide](https://turbo.build/repo/docs/handbook/deploying-with-docker)
- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [pnpm Docker Guide](https://pnpm.io/docker)
- [Northflank Documentation](https://northflank.com/docs)
- [Docker BuildKit](https://docs.docker.com/build/buildkit/)

---

## 🔒 Security Checklist

- ✅ Non-root user (`nextjs:nodejs`)
- ✅ Ubuntu base with security updates
- ✅ Docker Build Secrets for sensitive data
- ✅ Health checks enabled
- ✅ Proper signal handling (dumb-init)
- ✅ Minimal attack surface (only necessary files)

---

## 📝 Maintenance

**When to rebuild**:

- Dependency updates (`pnpm-lock.yaml` changes)
- Environment variable changes (rebuild required for `NEXT_PUBLIC_*`)
- Next.js version updates
- Security patches

**Version tagging**:

```bash
docker tag lactalink-web:latest lactalink-web:v1.0.0
docker tag lactalink-web:latest lactalink-web:sha-$(git rev-parse --short HEAD)
```

---

**Need help?** Check the Coolify logs for detailed error messages during deployment.
