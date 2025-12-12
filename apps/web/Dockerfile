# ====================================================================================================
# LactaLink Web - Production Dockerfile
# ====================================================================================================
# Multi-stage Dockerfile for Next.js app in pnpm + Turborepo monorepo
# Uses turbo prune for automatic dependency detection
# Optimized for Northflank deployment with standalone output
# ====================================================================================================
# Build from monorepo root: docker build -f apps/web/Dockerfile -t lactalink-web .
# ====================================================================================================

# ====================================================================================================
# Stage 1: Base - Alpine base with pnpm
# ====================================================================================================
FROM node:22-alpine AS base

# Install pnpm globally with specific version
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Set pnpm home directory
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

# ====================================================================================================
# Stage 2: Prune - Extract only what's needed for the web app
# ====================================================================================================
FROM base AS prune

# Install turbo globally (matches version in package.json)
RUN pnpm add -g turbo@2.5.8

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
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy pruned package.json files and lockfile from prune stage
COPY --from=prune /app/out/json/ .

# Install dependencies using frozen lockfile with build cache
# turbo prune creates a pruned lockfile with only required dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# ====================================================================================================
# Stage 4: Builder - Build the application
# ====================================================================================================
FROM base AS builder

# Copy installed dependencies from previous stage
COPY --from=dependencies /app/ .

# Copy full source code from prune stage
# This includes only web app and its workspace dependencies
COPY --from=prune /app/out/full/ .

# Build arguments for environment variables
# These are required at build time by Next.js and Payload CMS
ARG PAYLOAD_SECRET
ARG DATABASE_URI
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GOOGLE_CLOUD_VISION_API_KEY
ARG GOOGLE_ROUTES_API_KEY
ARG S3_BUCKET_IMAGES
ARG S3_BUCKET_MILK_BAG_IMAGES
ARG S3_BUCKET_ID_IMAGES
ARG S3_BUCKET_MESSAGE_MEDIA
ARG S3_BUCKET_MEDIA
ARG S3_BUCKET_FILES
ARG S3_BUCKET_AVATARS
ARG S3_ACCESS_KEY_ID
ARG S3_SECRET_ACCESS_KEY
ARG S3_REGION
ARG S3_ENDPOINT
ARG PSGC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG RESEND_API_KEY

# Set environment variables for build
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET \
    DATABASE_URI=$DATABASE_URI \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    GOOGLE_CLOUD_VISION_API_KEY=$GOOGLE_CLOUD_VISION_API_KEY \
    GOOGLE_ROUTES_API_KEY=$GOOGLE_ROUTES_API_KEY \
    S3_BUCKET_IMAGES=$S3_BUCKET_IMAGES \
    S3_BUCKET_MILK_BAG_IMAGES=$S3_BUCKET_MILK_BAG_IMAGES \
    S3_BUCKET_ID_IMAGES=$S3_BUCKET_ID_IMAGES \
    S3_BUCKET_MESSAGE_MEDIA=$S3_BUCKET_MESSAGE_MEDIA \
    S3_BUCKET_MEDIA=$S3_BUCKET_MEDIA \
    S3_BUCKET_FILES=$S3_BUCKET_FILES \
    S3_BUCKET_AVATARS=$S3_BUCKET_AVATARS \
    S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID \
    S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY \
    S3_REGION=$S3_REGION \
    S3_ENDPOINT=$S3_ENDPOINT \
    PSGC_API_URL=$PSGC_API_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    RESEND_API_KEY=$RESEND_API_KEY

# Run the build
# turbo prune ensures only web app and its dependencies are built
RUN pnpm build:web

# ====================================================================================================
# Stage 5: Runner - Minimal production runtime
# ====================================================================================================
FROM node:22-alpine AS runner

# Install runtime dependencies for native packages
# Only the runtime libraries are needed (not build tools)
RUN apk add --no-cache \
    dumb-init \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype

WORKDIR /app

# Set to production environment (can be overridden by Northflank)
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only the necessary files from builder
# Next.js standalone output includes all necessary dependencies
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Runtime environment variables (to be set by Northflank)
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
