#!/bin/sh

# Set environment variables
export NODE_PORT=3001

# Start Node.js application in the background
node dist/app.js &

# Start Caddy in the foreground
caddy run --config /etc/caddy/Caddyfile 