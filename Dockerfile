# Multi-stage build for Node.js Backend with Angular Frontend
FROM node:18-alpine AS frontend-build

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Set working directory for frontend
WORKDIR /app/my-app

# Copy frontend package files
COPY my-app/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY my-app/ .

# Build Angular app
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ .

# Copy built frontend files
COPY --from=frontend-build /app/my-app/dist/my-app ./my-app/dist/my-app

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/server.js"]
