# Build stage
FROM node:22-alpine AS base

# 1. Install dependencies
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Khai báo ARG để nhận biến từ GitHub Actions truyền vào
ARG NEXT_PUBLIC_API_URL
# Đặt ENV để Next.js nhìn thấy và nhúng vào mã nguồn lúc chạy lệnh build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy all files to build
COPY . .

# Install dependencies (pnpm sẽ tự tối ưu hóa trong monorepo)
RUN pnpm install --frozen-lockfile

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
COPY --from=builder /app/apps/admin/public ./apps/admin/public

# Chế độ standalone tối ưu
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs

EXPOSE 80

CMD ["node", "apps/admin/server.js"]
