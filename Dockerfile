# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# First copy both package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and other necessary files
COPY . .

# Create necessary directories
RUN mkdir -p public/css

# Build TypeScript and CSS
RUN npm run build:css
RUN npm run build

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