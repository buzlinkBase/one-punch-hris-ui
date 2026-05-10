# Deployment Guide - HRIS React Application

This guide covers deploying the HRIS React application to DigitalOcean, VPS, or any Docker-compatible environment.

## Prerequisites

- Docker installed and running
- Docker Compose installed
- A VPS or DigitalOcean Droplet with Docker support (or install Docker)
- Git for cloning the repository

## Quick Start

### 1. Prepare Environment Variables

Create a `.env` file in the project root:

```bash
VITE_API_URL=https://api.yourdomain.com/
VITE_API_VERSION=v1
VITE_APP_NAME=One Punch HRIS
```

**Note:** These variables are baked into the build at container build time. Ensure they are set correctly before building.

### 2. Build and Run Locally

```bash
# Build the Docker image
docker build -t hris-react:latest .

# Run the container
docker run -p 80:80 \
  -e VITE_API_URL=http://localhost:1442/ \
  -e VITE_API_VERSION=v1 \
  -e VITE_APP_NAME="One Punch HRIS" \
  hris-react:latest
```

### 3. Using Docker Compose

```bash
# Build and start the service
docker-compose up -d

# View logs
docker-compose logs -f hris-frontend

# Stop the service
docker-compose down
```

## Deployment to DigitalOcean/VPS

### Option A: Direct Docker Deployment

1. **SSH into your VPS:**

   ```bash
   ssh root@your_vps_ip
   ```

2. **Clone the repository:**

   ```bash
   cd /opt
   git clone https://github.com/yourusername/hris-react.git
   cd hris-react
   ```

3. **Create environment file:**

   ```bash
   cat > .env << EOF
   VITE_API_URL=https://api.yourdomain.com/
   VITE_API_VERSION=v1
   VITE_APP_NAME=One Punch HRIS
   EOF
   ```

4. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Option B: Using DigitalOcean App Platform

1. **Connect your GitHub repository** to DigitalOcean App Platform
2. **Configure the app:**
   - Set the Dockerfile as the build source
   - Set environment variables in the dashboard
   - Configure port 80 for HTTP traffic
3. **Deploy** - DigitalOcean handles the rest

### Option C: Using DigitalOcean Kubernetes

1. **Create a cluster** in DigitalOcean
2. **Build and push image** to Docker Hub or DigitalOcean Registry:
   ```bash
   docker build -t yourusername/hris-react:latest .
   docker push yourusername/hris-react:latest
   ```
3. **Create Kubernetes manifests** (deployment.yaml, service.yaml, etc.)
4. **Deploy** using kubectl

## Production Recommendations

### 1. SSL/TLS with Let's Encrypt

Use Nginx as a reverse proxy with Certbot:

```bash
# Install Certbot with Nginx plugin
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update docker-compose to include reverse proxy (see commented section)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Environment Variables

**Important:** For a Vite SPA, environment variables are embedded during the build. To use different environments:

**Option 1:** Build separate images for each environment

```bash
docker build --build-arg VITE_API_URL=https://prod-api.com/ -t hris-react:prod .
```

**Option 2:** Use a .env file and rebuild in target environment

### 3. Database Connection (if needed)

Add database service to docker-compose.yml:

```yaml
  postgres:
    image: postgres:16-alpine
    container_name: hris-db
    environment:
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - hris-network

volumes:
  postgres_data:
```

### 4. Monitoring and Logging

Configure centralized logging:

```yaml
# In docker-compose.yml
logging:
  driver: "splunk" # or "awslogs", "syslog", etc.
  options:
    splunk-token: "your-token"
    splunk-url: "https://your-splunk-instance:8088"
```

### 5. Reverse Proxy with HTTPS

Update docker-compose to expose through reverse proxy:

```bash
docker-compose -f docker-compose.yml up -d
# Then configure external Nginx/Caddy for SSL termination
```

## Common Issues

### Issue: "VITE_API_URL is undefined"

**Cause:** Environment variables set at runtime don't work in Vite SPAs (they're baked in at build time)

**Solution:** Rebuild the container with correct `.env` variables or use runtime config injection.

### Issue: CORS errors when calling API

**Solution:** Ensure VITE_API_URL is correctly set and your backend API allows requests from your domain.

### Issue: Static assets not loading

**Solution:** Check nginx.conf cache headers and ensure the build output is in `/usr/share/nginx/html`

## Scaling

For high traffic:

1. **Use a load balancer** (DigitalOcean Load Balancer or HAProxy)
2. **Run multiple container replicas:**
   ```bash
   docker-compose up -d --scale hris-frontend=3
   ```
3. **Use Docker Swarm or Kubernetes** for orchestration

## Security Checklist

- [ ] Set environment variables for production API endpoint
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules (only ports 80/443 open)
- [ ] Use strong database passwords
- [ ] Enable Docker security scanning for vulnerabilities
- [ ] Keep Docker and base images updated
- [ ] Configure automated backups
- [ ] Set resource limits in docker-compose

## Rollback Procedure

```bash
# View available image tags
docker image ls hris-react

# Stop current version
docker-compose down

# Update docker-compose.yml to use previous version tag
# Then restart
docker-compose up -d
```

## Cleanup

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup (careful!)
docker system prune -a --volumes
```

## Support & Updates

For updates:

```bash
cd /opt/hris-react
git pull
docker-compose down
docker-compose up -d --build
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Let's Encrypt](https://letsencrypt.org/)
