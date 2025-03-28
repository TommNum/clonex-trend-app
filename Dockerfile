# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install npm dependencies
COPY package*.json ./
RUN npm install -g npm@10.8.2 && \
    npm cache clean --force && \
    npm install --no-audit --no-fund --legacy-peer-deps

# Create necessary directories and copy source files
COPY . .
RUN mkdir -p public/css

# Ensure style.css exists with content
RUN echo '@tailwind base;\n@tailwind components;\n@tailwind utilities;' > public/css/style.css

# Build TypeScript and CSS
RUN npm run build:css && \
    npm run build

# Production stage
FROM caddy:2-alpine

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy built application
COPY --from=builder /app/dist /usr/share/caddy
COPY --from=builder /app/public/css/tailwind.css /usr/share/caddy/css/tailwind.css
COPY --from=builder /app/public/css/style.css /usr/share/caddy/css/style.css
COPY --from=builder /app/views /usr/share/caddy/views

# Create necessary directories
RUN mkdir -p /usr/share/caddy/public/uploads

# Expose port
EXPOSE 3000

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"] 