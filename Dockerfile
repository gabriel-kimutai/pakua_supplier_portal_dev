# Stage 1: Build the app
FROM node:lts-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_WS_API_URL
ENV VITE_WS_API_URL=$VITE_WS_API_URL

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Run the app using vinxi
FROM node:lts-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy the built output from builder (likely .vinxi or .output)
COPY --from=builder /app/.vinxi ./.vinxi
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src

# Optionally, copy any runtime files your framework needs
COPY --from=builder /app/*.js ./
COPY --from=builder /app/*.ts ./

CMD ["npm", "start"]

