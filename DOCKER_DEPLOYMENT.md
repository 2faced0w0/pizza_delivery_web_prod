# Docker Deployment Guide

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Build and Run All Services

```bash
docker-compose up -d --build
```

This will start:
- **PostgreSQL** on port 5432
- **Backend API** on port 4000
- **Frontend** on port 80

### 2. Access the Application

- Frontend: http://localhost
- Backend API: http://localhost:4000
- Database: localhost:5432

### 3. Check Service Health

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Individual Service Builds

### Frontend Only

```bash
cd frontend
docker build -t pizza-frontend .
docker run -p 80:80 pizza-frontend
```

### Backend Only

```bash
cd backend
docker build -t pizza-backend .
docker run -p 4000:4000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=postgres123 \
  -e JWT_SECRET=your-secret \
  pizza-backend
```

## Production Deployment

### Security Checklist

1. **Change JWT Secret**: Update `JWT_SECRET` in docker-compose.yml
2. **Database Password**: Change `POSTGRES_PASSWORD` and `DB_PASSWORD`
3. **HTTPS**: Use a reverse proxy (nginx/traefik) with SSL certificates
4. **Network**: Use Docker networks to isolate services
5. **Volumes**: Back up the `postgres_data` volume regularly

### Environment Variables

For production, create a `.env` file:

```env
JWT_SECRET=your-super-secure-random-string
POSTGRES_PASSWORD=secure-db-password
DB_PASSWORD=secure-db-password
VITE_API_URL=https://api.yourdomain.com
```

Then run:

```bash
docker-compose --env-file .env up -d
```

## Useful Commands

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes all data)

```bash
docker-compose down -v
```

### Rebuild After Code Changes

```bash
docker-compose up -d --build
```

### Scale Services

```bash
docker-compose up -d --scale backend=3
```

### Execute Commands in Container

```bash
# Access backend shell
docker-compose exec backend sh

# Access database
docker-compose exec postgres psql -U postgres -d pizzastore

# Run migrations
docker-compose exec backend node scripts/migrate.js
```

### View Resource Usage

```bash
docker stats
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :80
netstat -ano | findstr :4000

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if database is ready
docker-compose exec postgres pg_isready -U postgres

# View database logs
docker-compose logs postgres
```

### Frontend Not Connecting to Backend

- Ensure `VITE_API_URL` points to the correct backend URL
- Check CORS settings in backend
- Verify backend is running: `curl http://localhost:4000/health`

### Clear Everything and Start Fresh

```bash
docker-compose down -v --remove-orphans
docker system prune -a
docker-compose up -d --build
```

## Multi-Stage Build Benefits

- **Smaller Images**: Production images only contain necessary files
- **Security**: No development dependencies in production
- **Speed**: Cached layers speed up rebuilds

## Health Checks

All services include health checks:

```bash
# Check health status
docker inspect pizza-backend | grep -A 10 Health
docker inspect pizza-frontend | grep -A 10 Health
docker inspect pizza-db | grep -A 10 Health
```

## Performance Optimization

### Production Build Optimizations

- Frontend: Gzip compression, static asset caching
- Backend: Production-only dependencies, non-root user
- Database: Persistent volumes, connection pooling

### Resource Limits

Add to docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build and Push Images
  run: |
    docker-compose build
    docker-compose push
```

### GitLab CI Example

```yaml
build:
  script:
    - docker-compose build
    - docker-compose push
```

## Monitoring

### Container Logs

```bash
# Follow all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f backend
```

### Health Endpoints

- Backend: http://localhost:4000/health
- Frontend: http://localhost/health

## Backup and Restore

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres pizzastore > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres pizzastore
```

## Support

For issues, check:
1. Container logs: `docker-compose logs`
2. Health checks: `docker-compose ps`
3. Network connectivity: `docker network inspect pizza-network`
