FROM ubuntu:latest
LABEL authors="rvkri"
# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
# If you use pnpm/yarn, swap the install command accordingly
RUN npm ci

# Copy source and build
COPY . .
# If you need an API base URL, pass it as build arg: --build-arg VITE_API_URL=https://api.example.com
# ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.25-alpine
# Remove default config and add our SPA-friendly config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html
# Health and port
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://localhost/ || exit 1

# Optional: run as non-root (nginx image defaults to root)
# USER 101
#ENTRYPOINT ["top", "-b"]