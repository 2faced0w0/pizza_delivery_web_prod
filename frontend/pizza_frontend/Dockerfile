# Frontend Dockerfile (Vite + React)
# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY . .

# Accept API base URL at build time for Vite
ARG VITE_API_URL=/
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Runtime stage
FROM nginx:alpine AS runtime

# Copy SPA nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Healthcheck for basic availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
