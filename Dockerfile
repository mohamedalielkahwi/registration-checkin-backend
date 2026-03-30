# ================================
# Stage 1: Builder
# ================================
FROM node:18-slim AS builder

WORKDIR /app

# OpenSSL is required by Prisma's native query/migration engine binaries
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

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

# Install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && npx prisma generate

# Copy built app from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]