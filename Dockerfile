# -------------------------
# 1️⃣ Build stage
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code and build Next.js
COPY . .
RUN npm run build

# -------------------------
# 2️⃣ Runtime stage
# -------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Next.js standalone output copies everything needed (including node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Run the standalone server
CMD ["node", "server.js"]
