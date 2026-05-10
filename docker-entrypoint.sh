#!/bin/sh
# This script substitutes environment variables in index.html for runtime configuration

# Check if we need to do any substitution
if [ -z "$VITE_API_URL" ] && [ -z "$VITE_API_VERSION" ] && [ -z "$VITE_APP_NAME" ]; then
  echo "No environment variables to substitute"
  exit 0
fi

# Note: For a SPA built with Vite, environment variables need to be available at build time
# This script is a placeholder for future runtime configuration needs
# Currently, environment variables are baked into the build at build time

echo "Docker entrypoint completed successfully"
exit 0
