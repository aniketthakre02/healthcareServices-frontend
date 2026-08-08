# Frontend Dockerfile - multi-stage: build with Node, serve with Nginx
FROM node:20-alpine AS build
WORKDIR /app

# Cache deps
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# VITE_API_BASE_URL is set at build time for production; empty means relative proxy via nginx
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine AS production
# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
