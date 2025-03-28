# Build stage
FROM node:20-slim AS builder

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install -g npm@10.8.2 && \
    npm cache clean --force && \
    npm install --no-audit --no-fund --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript and CSS
RUN npm run build:css && \
    npm run build && \
    rm -rf node_modules

# Production stage
FROM caddy:2-alpine

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy built application files
COPY --from=builder /app/dist /usr/share/caddy/dist
COPY --from=builder /app/public /usr/share/caddy/public
COPY --from=builder /app/views /usr/share/caddy/views

# Create necessary directories
RUN mkdir -p /usr/share/caddy/uploads

# Expose port
EXPOSE 3000

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"] 