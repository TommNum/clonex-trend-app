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
FROM node:20-slim

# Install Caddy
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    debian-keyring \
    debian-archive-keyring \
    apt-transport-https && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list && \
    apt-get update && \
    apt-get install -y caddy && \
    rm -rf /var/lib/apt/lists/*

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy built application files
COPY --from=builder /app/dist /usr/share/caddy/dist
COPY --from=builder /app/public /usr/share/caddy/public
COPY --from=builder /app/views /usr/share/caddy/views
COPY --from=builder /app/package*.json /usr/share/caddy/

# Set working directory
WORKDIR /usr/share/caddy

# Install production dependencies
RUN npm install --production --no-audit --no-fund --legacy-peer-deps

# Create necessary directories
RUN mkdir -p /usr/share/caddy/uploads

# Expose port
EXPOSE 3000

# Start both Node.js and Caddy
COPY start.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"] 