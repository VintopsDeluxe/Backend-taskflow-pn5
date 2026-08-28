# Step 1: Build & Dependency Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (ci ensures exact versions from package-lock.json)
RUN npm ci --only=production

# Step 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -S taskflow && adduser -S taskflow -G taskflow

# Copy installed node_modules and application code
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Change ownership to non-root user
USER taskflow

# Expose server port
EXPOSE 5000

# Start application server
CMD ["node", "server.js"]