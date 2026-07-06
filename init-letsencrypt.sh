#!/bin/bash
# Bootstrap Let's Encrypt certificates for hris-dev.onepunch.site.
# Run this ONCE on the server before starting docker-compose.proxy.yml.
#
# What it does:
#   1. Downloads recommended TLS params from certbot's repo
#   2. Creates a temporary self-signed cert so nginx can start (the HTTPS
#      server block references the cert path, so nginx won't start without it)
#   3. Starts nginx-proxy so it can serve the ACME HTTP-01 challenge
#   4. Requests a real Let's Encrypt certificate via certbot
#   5. Reloads nginx with the real certificate in place

set -e

DOMAIN="hris-dev.onepunch.site"
EMAIL="torreonjordan143@gmail.com"
STAGING=0  # Set to 1 to test against Let's Encrypt staging (avoids rate limits)

CERTBOT_CONF="./docker/certbot/conf"
CERTBOT_WWW="./docker/certbot/www"
COMPOSE_FILE="docker-compose.proxy.yml"

# ─── Helpers ──────────────────────────────────────────────────────────────────

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
step() { echo; bold "### $*"; }

# ─── Pre-flight ───────────────────────────────────────────────────────────────

step "Creating required directories ..."
mkdir -p "$CERTBOT_CONF/live/$DOMAIN"
mkdir -p "$CERTBOT_WWW"

if [ -f "$CERTBOT_CONF/live/$DOMAIN/fullchain.pem" ]; then
  echo "Certificate already exists for $DOMAIN."
  echo "To renew, run:  docker compose -f $COMPOSE_FILE exec certbot certbot renew"
  echo "To just start the proxy:  docker compose -f $COMPOSE_FILE up -d"
  exit 0
fi

# ─── Download recommended TLS parameters ──────────────────────────────────────

if [ ! -f "$CERTBOT_CONF/options-ssl-nginx.conf" ] || [ ! -f "$CERTBOT_CONF/ssl-dhparams.pem" ]; then
  step "Downloading recommended TLS parameters ..."
  curl -fsSL \
    "https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf" \
    -o "$CERTBOT_CONF/options-ssl-nginx.conf"
  curl -fsSL \
    "https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem" \
    -o "$CERTBOT_CONF/ssl-dhparams.pem"
fi

# ─── Temporary self-signed certificate ────────────────────────────────────────

step "Creating temporary self-signed certificate for $DOMAIN ..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint \
  "openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
     -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
     -out    '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
     -subj   '/CN=localhost'" \
  certbot

# ─── Start nginx ──────────────────────────────────────────────────────────────

step "Starting nginx-proxy ..."
docker compose -f "$COMPOSE_FILE" up --force-recreate -d nginx-proxy
echo "Waiting for nginx to be ready ..."
sleep 5

# ─── Issue real certificate ───────────────────────────────────────────────────

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

# ─── Reload nginx with real cert ──────────────────────────────────────────────

step "Reloading nginx ..."
docker compose -f "$COMPOSE_FILE" exec nginx-proxy nginx -s reload

# ─── Start certbot renewal daemon ─────────────────────────────────────────────

step "Starting certbot renewal daemon ..."
docker compose -f "$COMPOSE_FILE" up -d certbot

echo
bold "Done!  https://$DOMAIN is live and secured."
echo
echo "Useful commands:"
echo "  Start proxy:    docker compose -f $COMPOSE_FILE up -d"
echo "  Stop proxy:     docker compose -f $COMPOSE_FILE down"
echo "  Force renewal:  docker compose -f $COMPOSE_FILE run --rm certbot certbot renew --force-renewal"
echo "  nginx logs:     docker logs hris-nginx-proxy -f"
echo "  certbot logs:   docker logs hris-certbot -f"
