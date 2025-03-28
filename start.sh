#!/bin/sh

# Start Node.js application in the background
node dist/app.js &

# Start Caddy in the foreground
caddy run --config /etc/caddy/Caddyfile 