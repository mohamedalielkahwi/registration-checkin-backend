# ================================
# Stage 1: Builder
# ================================
FROM node:18-slim AS builder

WORKDIR /app

# OpenSSL is required by Prisma's native query/migration engine binaries
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

# Install ALL deps (including devDependencies like tsx, ts-node, etc.)
RUN npm ci

# Generate Prisma client for the target platform
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build


# ================================
# Stage 2: Production
# ================================
FROM node:18-slim AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./
COPY public ./public

# Install ALL deps so `npm run seed` (tsx) works inside the container
# tsx and prisma CLI are needed at runtime for seeding
RUN npm ci && npx prisma generate

# Copy built app from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Sync schema with db push then start the app
CMD ["sh", "-c", "npx prisma db push && node dist/src/main"]