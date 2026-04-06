# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Corepack enable to use pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
# Copy all apps' package.json to satisfy the monorepo workspace lockfile
COPY apps/admin/package.json ./apps/admin/
COPY apps/storefront/package.json ./apps/storefront/
COPY services/ecp_api/package.json ./services/ecp_api/

# Install dependencies using workspace context
RUN pnpm install --frozen-lockfile

# Copy application source
COPY apps/admin ./apps/admin
RUN pnpm --filter admin build

# Production stage
FROM nginx:alpine
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
# If there's a custom nginx config, copy it here
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
