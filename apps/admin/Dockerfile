# Build stage
FROM node:22-alpine AS base

# 1. Install dependencies
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG NEXT_PUBLIC_ADMIN_API_URL
ENV NEXT_PUBLIC_ADMIN_API_URL=$NEXT_PUBLIC_ADMIN_API_URL
ARG NEXT_PUBLIC_API_URL={{NEXT_PUBLIC_API_URL}}
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace configuration and package files for dependency caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/admin/package.json ./apps/admin/
COPY apps/storefront/package.json ./apps/storefront/
COPY services/ecp_api/package.json ./services/ecp_api/

# Install dependencies (tận dụng Docker layer cache)
RUN pnpm install --frozen-lockfile

# Copy mã nguồn dự án admin
COPY apps/admin ./apps/admin

# Build dự án admin
RUN pnpm --filter admin build

# 2. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy tệp thực thi từ stage builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public

# Chế độ standalone tối ưu
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs

EXPOSE 80

CMD ["sh", "-c", "ADMIN_URL=\"${NEXT_PUBLIC_ADMIN_API_URL:-$NEXT_PUBLIC_API_URL}\"; find /app -type f \\( -name \"*.js\" -o -name \"*.html\" -o -name \"*.json\" \\) -exec sed -i \"s|{{NEXT_PUBLIC_API_URL}}|$ADMIN_URL|g\" {} + && node apps/admin/server.js"]
