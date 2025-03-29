# Build stage
FROM node:20-slim AS builder

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create necessary directories and files
RUN mkdir -p public/css && \
    echo "@tailwind base;\n@tailwind components;\n@tailwind utilities;" > public/css/style.css

# Install dependencies
COPY package*.json ./
RUN npm install -g npm@10.8.2 && \
    npm cache clean --force && \
    npm install --no-audit --no-fund

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
COPY --from=builder /app/package*.json /usr/share/caddy/

# Set working directory
WORKDIR /usr/share/caddy

# Install Node.js and npm in production stage
RUN apk add --no-cache nodejs npm python3 make g++

# Install production dependencies
RUN npm install --production --no-audit --no-fund

# Create necessary directories
RUN mkdir -p /usr/share/caddy/uploads

# Expose port
EXPOSE 3000

# Copy and set up start script
COPY start.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"] 