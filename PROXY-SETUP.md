# Nginx + Certbot Proxy Setup

Secures `hris-dev.onepunch.site` with HTTPS using nginx and Let's Encrypt (certbot), both running as Docker containers.

## Architecture

```
Browser
  │
  ├─ :80  → nginx-proxy → ACME challenge (certbot) or redirect to HTTPS
  └─ :443 → nginx-proxy (SSL termination) → localhost:8001 (hris-frontend)
```

Certificates are stored in `docker/certbot/conf/` and shared between the two containers via a bind mount. nginx reloads every 6 hours to pick up renewed certificates; certbot attempts renewal every 12 hours.

## Files

| File                           | Description                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| `docker-compose.proxy.yml`     | nginx and certbot service definitions                           |
| `docker/nginx/conf.d/app.conf` | nginx virtual host config (HTTP redirect + HTTPS reverse proxy) |
| `init-letsencrypt.sh`          | One-time bootstrap script — run this first on a fresh server    |

## Prerequisites

- Docker and Docker Compose installed on the server
- DNS for `hris-dev.onepunch.site` already pointing to the server's public IP
- The app container is running and accessible on `localhost:8001`
- Ports `80` and `443` are free (no host-level nginx, Apache, etc.)

## First-Time Setup

```bash
# 1. Pull the latest files
git pull

# 2. Ensure the app is running on port 8001
docker compose -f docker-compose.deploy.yml up -d

# 3. Make the init script executable
chmod +x init-letsencrypt.sh

# 4. Run the bootstrap (takes ~1 minute)
./init-letsencrypt.sh
```

The script will:

1. Download certbot's recommended TLS parameters
2. Create a temporary self-signed certificate so nginx can start
3. Start nginx to serve the ACME HTTP-01 challenge
4. Request a real Let's Encrypt certificate
5. Reload nginx with the real certificate
6. Start the certbot renewal daemon

When complete, `https://hris-dev.onepunch.site` is live.

## Daily Operations

| Task               | Command                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------- |
| Start proxy        | `docker compose -f docker-compose.proxy.yml up -d`                                          |
| Stop proxy         | `docker compose -f docker-compose.proxy.yml down`                                           |
| Restart proxy      | `docker compose -f docker-compose.proxy.yml restart`                                        |
| nginx logs         | `docker logs hris-nginx-proxy -f`                                                           |
| certbot logs       | `docker logs hris-certbot -f`                                                               |
| Force cert renewal | `docker compose -f docker-compose.proxy.yml run --rm certbot certbot renew --force-renewal` |
| Check cert expiry  | `docker compose -f docker-compose.proxy.yml run --rm certbot certbot certificates`          |

## Testing Against Staging (Recommended Before First Production Run)

Let's Encrypt enforces rate limits (5 failed certificates per domain per hour). To test without hitting them, set `STAGING=1` at the top of `init-letsencrypt.sh` before running it. Staging certificates are not trusted by browsers but are otherwise identical. Once confirmed working, reset `STAGING=0` and re-run the script.

## Certificate Renewal

Renewal is automatic. The certbot container runs `certbot renew` every 12 hours; certbot only acts when the certificate is within 30 days of expiry. nginx picks up the renewed certificate within 6 hours via its scheduled reload.

To verify renewal is working:

```bash
docker logs hris-certbot
```

You should see periodic renewal check entries with no errors.

## Troubleshooting

**nginx fails to start**
Check that ports 80/443 are not already in use on the host:

```bash
sudo ss -tlnp | grep -E ':80|:443'
```

**Certbot says "Connection refused" or challenge fails**

- Confirm the server's firewall allows inbound TCP on port 80
- Confirm DNS is correctly pointed at this server: `dig hris-dev.onepunch.site`

**Certificate exists but nginx shows old cert after renewal**
Force a reload:

```bash
docker compose -f docker-compose.proxy.yml exec nginx-proxy nginx -s reload
```

**Re-running init on an existing certificate**
The script exits early if a certificate already exists. To force a fresh run, remove the existing cert data first:

```bash
sudo rm -rf docker/certbot/conf/live/hris-dev.onepunch.site
sudo rm -rf docker/certbot/conf/archive/hris-dev.onepunch.site
sudo rm -f  docker/certbot/conf/renewal/hris-dev.onepunch.site.conf
./init-letsencrypt.sh
```
