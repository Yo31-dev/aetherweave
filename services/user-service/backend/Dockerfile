# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Installer pnpm globalement
RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install

COPY . .
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
