# Build stage
FROM node:26-alpine AS builder

WORKDIR /app

# Build-time env vars baked into the Vite bundle
ARG VITE_API_URL=http://localhost:1442/
ARG VITE_API_VERSION=v1
ARG VITE_APP_NAME="One Punch HRIS"
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_PREFIX_AUTH=auth
ARG VITE_PREFIX_HRMS=hrms
ARG VITE_PREFIX_ADMS=adms
ARG VITE_PREFIX_TENANTS=tenants
ARG VITE_PREFIX_NOTIFICATIONS=notifications
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_VERSION=$VITE_API_VERSION
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_PREFIX_AUTH=$VITE_PREFIX_AUTH
ENV VITE_PREFIX_HRMS=$VITE_PREFIX_HRMS
ENV VITE_PREFIX_ADMS=$VITE_PREFIX_ADMS
ENV VITE_PREFIX_TENANTS=$VITE_PREFIX_TENANTS
ENV VITE_PREFIX_NOTIFICATIONS=$VITE_PREFIX_NOTIFICATIONS

# Install pnpm
RUN npm install -g pnpm@11.12.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Use dumb-init to handle signals
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
