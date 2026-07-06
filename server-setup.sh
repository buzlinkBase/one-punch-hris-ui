#!/bin/bash
# Run this script on the server to create all necessary proxy files.
# Usage:
#   chmod +x server-setup.sh && ./server-setup.sh
#
# Or pipe directly via SSH:
#   ssh -i ~/.ssh/your-key.pem root@<ip> 'bash -s' < server-setup.sh

set -e

DEPLOY_DIR="/opt/hris-react"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
step() { echo; bold "### $*"; }

step "Creating directory structure ..."
mkdir -p "$DEPLOY_DIR/docker/nginx/conf.d"
mkdir -p "$DEPLOY_DIR/docker/certbot/conf"
mkdir -p "$DEPLOY_DIR/docker/certbot/www"

# ─── docker-compose.deploy.yml ────────────────────────────────────────────────

step "Writing docker-compose.deploy.yml ..."
cat > "$DEPLOY_DIR/docker-compose.deploy.yml" << 'EOF'
services:
  hris-frontend:
    image: ${DOCKER_IMAGE}
    ports:
      - "${HOST_PORT}:80"
    restart: unless-stopped
    networks:
      - hris-network
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--quiet",
          "--tries=1",
          "--spider",
          "http://localhost/health",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  hris-network:
    driver: bridge
EOF

# ─── docker-compose.proxy.yml ─────────────────────────────────────────────────

step "Writing docker-compose.proxy.yml ..."
cat > "$DEPLOY_DIR/docker-compose.proxy.yml" << 'EOF'
services:
  nginx-proxy:
    image: nginx:alpine
    container_name: hris-nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./docker/certbot/conf:/etc/letsencrypt:ro
      - ./docker/certbot/www:/var/www/certbot:ro
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
    command: >
      /bin/sh -c "while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g 'daemon off;'"

  certbot:
    image: certbot/certbot
    container_name: hris-certbot
    volumes:
      - ./docker/certbot/conf:/etc/letsencrypt
      - ./docker/certbot/www:/var/www/certbot
    entrypoint: >
      /bin/sh -c "trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;"
EOF

# ─── docker/nginx/conf.d/app.conf ─────────────────────────────────────────────

step "Writing docker/nginx/conf.d/app.conf ..."
cat > "$DEPLOY_DIR/docker/nginx/conf.d/app.conf" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name hris-dev.onepunch.site;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name hris-dev.onepunch.site;

    ssl_certificate     /etc/letsencrypt/live/hris-dev.onepunch.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hris-dev.onepunch.site/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 50M;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options           "SAMEORIGIN"                          always;
    add_header X-Content-Type-Options    "nosniff"                             always;
    add_header X-XSS-Protection          "1; mode=block"                       always;
    add_header Referrer-Policy           "no-referrer-when-downgrade"          always;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    location / {
        proxy_pass         http://host.docker.internal:8001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# ─── init-letsencrypt.sh ──────────────────────────────────────────────────────

step "Writing init-letsencrypt.sh ..."
cat > "$DEPLOY_DIR/init-letsencrypt.sh" << 'EOF'
#!/bin/bash
set -e

DOMAIN="hris-dev.onepunch.site"
EMAIL="torreonjordan143@gmail.com"
STAGING=0

CERTBOT_CONF="./docker/certbot/conf"
CERTBOT_WWW="./docker/certbot/www"
COMPOSE_FILE="docker-compose.proxy.yml"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
step() { echo; bold "### $*"; }

step "Creating required directories ..."
mkdir -p "$CERTBOT_CONF/live/$DOMAIN"
mkdir -p "$CERTBOT_WWW"

if [ -f "$CERTBOT_CONF/live/$DOMAIN/fullchain.pem" ]; then
  echo "Certificate already exists for $DOMAIN."
  echo "To renew:       docker compose -f $COMPOSE_FILE run --rm certbot certbot renew --force-renewal"
  echo "To start proxy: docker compose -f $COMPOSE_FILE up -d"
  exit 0
fi

if [ ! -f "$CERTBOT_CONF/options-ssl-nginx.conf" ] || [ ! -f "$CERTBOT_CONF/ssl-dhparams.pem" ]; then
  step "Downloading recommended TLS parameters ..."
  curl -fsSL \
    "https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf" \
    -o "$CERTBOT_CONF/options-ssl-nginx.conf"
  curl -fsSL \
    "https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem" \
    -o "$CERTBOT_CONF/ssl-dhparams.pem"
fi

step "Creating temporary self-signed certificate for $DOMAIN ..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint \
  "openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
     -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
     -out    '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
     -subj   '/CN=localhost'" \
  certbot

step "Starting nginx-proxy ..."
docker compose -f "$COMPOSE_FILE" up --force-recreate -d nginx-proxy
echo "Waiting for nginx to be ready ..."
sleep 5

step "Removing temporary certificate ..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint \
  "rm -rf \
     /etc/letsencrypt/live/$DOMAIN \
     /etc/letsencrypt/archive/$DOMAIN \
     /etc/letsencrypt/renewal/$DOMAIN.conf" \
  certbot

STAGING_FLAG=""
[ "$STAGING" = "1" ] && STAGING_FLAG="--staging"

step "Requesting Let's Encrypt certificate for $DOMAIN ..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint \
  "certbot certonly --webroot -w /var/www/certbot \
     $STAGING_FLAG \
     --email $EMAIL \
     --agree-tos \
     --no-eff-email \
     --rsa-key-size 4096 \
     --force-renewal \
     -d $DOMAIN" \
  certbot

step "Reloading nginx ..."
docker compose -f "$COMPOSE_FILE" exec nginx-proxy nginx -s reload

step "Starting certbot renewal daemon ..."
docker compose -f "$COMPOSE_FILE" up -d certbot

echo
bold "Done!  https://$DOMAIN is live and secured."
echo
echo "  Start proxy:    docker compose -f $COMPOSE_FILE up -d"
echo "  Stop proxy:     docker compose -f $COMPOSE_FILE down"
echo "  Force renewal:  docker compose -f $COMPOSE_FILE run --rm certbot certbot renew --force-renewal"
echo "  nginx logs:     docker logs hris-nginx-proxy -f"
echo "  certbot logs:   docker logs hris-certbot -f"
EOF

# ─── .env ─────────────────────────────────────────────────────────────────────

if [ ! -f "$DEPLOY_DIR/.env" ]; then
  step "Writing .env template ..."
  cat > "$DEPLOY_DIR/.env" << 'EOF'
DOCKER_IMAGE=
HOST_PORT=8001
EOF
  echo "  .env created — fill in DOCKER_IMAGE before starting the app."
else
  echo
  bold "### Skipping .env (already exists)"
fi

# ─── Permissions ──────────────────────────────────────────────────────────────

chmod +x "$DEPLOY_DIR/init-letsencrypt.sh"

# ─── Done ─────────────────────────────────────────────────────────────────────

echo
bold "### All files written to $DEPLOY_DIR"
echo
echo "Next steps:"
echo "  1. cd $DEPLOY_DIR"
echo "  2. Edit .env — set DOCKER_IMAGE"
echo "  3. docker compose -f docker-compose.deploy.yml up -d"
echo "  4. ./init-letsencrypt.sh"
