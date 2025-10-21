# ============================================
# Stage 1: Build the app
# ============================================
FROM node:lts-alpine AS builder

WORKDIR /app

# Build-time args for environment injection
ARG VITE_API_URL
ARG VITE_WS_API_URL
ARG AUTH_SESSION_SECRET

# Make them available to the build process
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_API_URL=$VITE_WS_API_URL
ENV AUTH_SESSION_SECRET=$AUTH_SESSION_SECRET

ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build TanStack + Vinxi app
RUN npm run build


# ============================================
# Stage 2: Production runtime
# ============================================
FROM node:lts-alpine AS runner

WORKDIR /app

# Copy only essential files for runtime
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts from builder
COPY --from=builder /app/.vinxi ./.vinxi
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

# Optionally copy runtime entry point if you have one
# (e.g., `server.js` or `index.js`)
# COPY --from=builder /app/server.js ./server.js

# Expose default Vinxi/TanStack port (change if needed)
EXPOSE ${PORT}

# Use non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

# Start the app
CMD ["npm", "start"]
