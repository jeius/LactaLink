# ====================================================================================================
# LactaLink Web - Production Dockerfile
# ====================================================================================================
# Multi-stage Dockerfile for Next.js app in pnpm + Turborepo monorepo
# Uses turbo prune for automatic dependency detection
# Optimized for Coolify deployment with standalone output
# ====================================================================================================
# Build from monorepo root: docker build -f apps/web/Dockerfile -t lactalink-web .
# ====================================================================================================

# ====================================================================================================
# Stage 1: Base - Ubuntu base with pnpm
# ====================================================================================================
FROM node:24.13.1 AS base

# Install pnpm globally with specific version
RUN corepack enable && corepack prepare pnpm@10.29.2 --activate

# Set pnpm home directory
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

# ====================================================================================================
# Stage 2: Prepare - Extract only what's needed for the web app
# ====================================================================================================
FROM base AS prepare

# Install turbo globally (matches version in package.json)
RUN pnpm add -g turbo@2.8.0

# Copy entire monorepo for turbo to analyze
COPY . .

# Prune the monorepo to only include web app and its dependencies
# Creates /app/out/json/ with package.json files and pruned lockfile
# Creates /app/out/full/ with full source code for web app + dependencies
RUN turbo prune @lactalink/web --docker

# ====================================================================================================
# Stage 3: Dependencies - Install dependencies for pruned workspace
# ====================================================================================================
FROM base AS dependencies

# Install build dependencies for native packages (canvas, sharp, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    && rm -rf /var/lib/apt/lists/* 

# Copy pruned package.json files and lockfile from prune stage
COPY --from=prepare /app/out/json/ .

# Install dependencies using frozen lockfile with build cache
# turbo prune creates a pruned lockfile with only required dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile --prefer-offline

# ====================================================================================================
# Stage 4: Builder - Build the application
# ====================================================================================================
FROM base AS builder

# Install build dependencies for canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    && rm -rf /var/lib/apt/lists/* 

# Copy installed dependencies from previous stage
# This uses the pruned lockfile to ensure only necessary packages are included
COPY --from=dependencies /app/ .

# Copy full source code from prepare stage
# This includes only web app and its workspace dependencies
COPY --from=prepare /app/out/full/ .

# Build the application
RUN pnpm build:web

# ====================================================================================================
# Stage 5: Runner - Minimal production runtime
# ====================================================================================================
FROM node:24.13.1 AS runner

# Install dumb-init to handle signal forwarding and process reaping
RUN apt-get update && apt-get install -y \
    dumb-init \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libgif7 \
    && rm -rf /var/lib/apt/lists/* 

WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only the necessary files from builder
# Next.js standalone output includes all necessary dependencies
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Runtime environment variables (to be set by Coolify)
# Build-time secrets are handled above via Docker Build Secrets
ENV PORT=3000 \
    HOSTNAME="0.0.0.0"

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use dumb-init to handle signals properly
# Start the Next.js standalone server
CMD ["dumb-init", "node", "apps/web/server.js"]
