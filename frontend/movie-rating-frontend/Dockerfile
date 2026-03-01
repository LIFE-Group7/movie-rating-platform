# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first (cached when package files don't change)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build with the production API URL baked in
COPY . .
ARG VITE_API_BASE_URL=http://68.210.96.73
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────
FROM nginx:alpine AS runtime

# Remove default nginx config and add our own
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
