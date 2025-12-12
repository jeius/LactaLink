# Docker Quick Reference - LactaLink Web

> 💡 **All commands below should be run from the monorepo root** (not from `apps/web/`)

## 🚀 Quick Start

### Build the image

```bash
docker build -f apps/web/Dockerfile -t lactalink-web:latest .
```

### Build with environment variables

```bash
docker build -f apps/web/Dockerfile \
  --build-arg PAYLOAD_SECRET=your-secret \
  --build-arg DATABASE_URI=postgresql://... \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -t lactalink-web:latest \
  .
```

### Run the container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URI=postgresql://... \
  -e PAYLOAD_SECRET=your-secret \
  lactalink-web:latest
```

### Using Docker Compose

```bash
# From apps/web/ directory
cd apps/web
docker-compose up --build

# Or from monorepo root
docker-compose -f apps/web/docker-compose.yml up --build
```

---

## 🔍 Useful Commands

### View running containers

```bash
docker ps
```

### View container logs

```bash
docker logs <container-id>
docker logs -f <container-id>  # Follow logs
```

### Execute commands in running container

```bash
docker exec -it <container-id> sh
```

### Stop container

```bash
docker stop <container-id>
```

### Remove container

```bash
docker rm <container-id>
```

### Remove image

```bash
docker rmi lactalink-web:latest
```

### View image size

```bash
docker images lactalink-web
```

### Inspect container

```bash
docker inspect <container-id>
```

---

## 🧹 Cleanup

### Remove all stopped containers

```bash
docker container prune
```

### Remove unused images

```bash
docker image prune
```

### Remove all unused data (containers, images, volumes, networks)

```bash
docker system prune -a
```

### Remove build cache

```bash
docker builder prune
```

---

## 🐛 Debugging

### Build with no cache

```bash
docker build -f apps/web/Dockerfile --no-cache -t lactalink-web:latest .
```

### Check build stages

```bash
docker build -f apps/web/Dockerfile --target builder -t lactalink-web:builder .
docker run --rm -it lactalink-web:builder sh
```

### View build history

```bash
docker history lactalink-web:latest
```

### Check health status

```bash
docker inspect --format='{{.State.Health.Status}}' <container-id>
```

---

## 📦 Multi-Architecture Builds

### Build for multiple platforms

```bash
docker buildx build -f apps/web/Dockerfile \
  --platform linux/amd64,linux/arm64 \
  -t lactalink-web:latest \
  --push \
  .
```

---

## 🏷️ Tagging & Pushing

### Tag image

```bash
docker tag lactalink-web:latest your-registry.com/lactalink-web:v1.0.0
docker tag lactalink-web:latest your-registry.com/lactalink-web:latest
```

### Push to registry

```bash
docker push your-registry.com/lactalink-web:v1.0.0
docker push your-registry.com/lactalink-web:latest
```

---

## ⚡ Performance Testing

### Check resource usage

```bash
docker stats <container-id>
```

### Time the build

```bash
time docker build -f apps/web/Dockerfile -t lactalink-web:latest .
```

---

## 🔐 Security Scanning

### Scan image for vulnerabilities

```bash
docker scan lactalink-web:latest
```

---

## 💡 Tips

- Always use `.dockerignore` to exclude unnecessary files
- Use BuildKit for faster builds: `DOCKER_BUILDKIT=1 docker build ...`
- Layer caching: Order Dockerfile commands from least to most frequently changing
- Keep images small: Use Alpine base images and multi-stage builds
