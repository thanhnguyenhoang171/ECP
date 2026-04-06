FROM node:22-alpine AS base
# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS builder
# Set working directory
WORKDIR /app
# We need to copy workspace files to resolve dependencies properly
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
# Copy all apps' package.json to satisfy the monorepo workspace lockfile
COPY apps/storefront/package.json ./apps/storefront/
COPY apps/admin/package.json ./apps/admin/
COPY services/ecp_api/package.json ./services/ecp_api/
# Install dependencies using workspace context
RUN pnpm install --frozen-lockfile

# Copy the rest of the app's source code
COPY apps/storefront ./apps/storefront

# Build the storefront application
RUN pnpm --filter storefront build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone outputs
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public
# automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/apps/storefront/.next/standalone ./
COPY --from=builder /app/apps/storefront/.next/static ./apps/storefront/.next/static

# Expose Next.js port
EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# Note: The standalone build outputs to apps/storefront/server.js relative to project root in monorepo
CMD ["node", "apps/storefront/server.js"]
