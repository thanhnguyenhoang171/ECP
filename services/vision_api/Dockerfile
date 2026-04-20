# Build stage
FROM node:20-slim AS build
WORKDIR /app

# Khai báo pnpm (hoặc có thể dùng trực tiếp npm)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Trong trường hợp build độc lập thư mục này khỏi Monorepo, ta dùng pnpm install bình thường
COPY package.json ./
RUN pnpm install

COPY tsconfig.json ./
COPY src ./src
COPY models ./models

RUN pnpm run build

# Run stage
FROM node:20-slim
WORKDIR /app

# Copy các file cần thiết từ Build stage
COPY --from=build /app/package.json ./
# Thay vì build lại node_modules, ta copy luôn node_modules đã install ở build stage 
# (Vì onnxruntime-node tải binary sẵn nên dùng chung kiến trúc node-slim là an toàn nhất)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/models ./models

EXPOSE 3005
CMD ["node", "dist/index.js"]
