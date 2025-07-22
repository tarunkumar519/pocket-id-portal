# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
RUN mkdir -p /app/data && chown node:node /app/data
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine

# Delete default node user
RUN deluser --remove-home node

RUN apk add --no-cache su-exec curl

WORKDIR /app

# Create data directory
COPY ./scripts/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY --from=builder /app/build ./build
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/static ./static

EXPOSE 5173
LABEL org.opencontainers.image.authors="kmendell"
LABEL org.opencontainers.image.description="Example Pocket ID User Portal"

# Add volume for persistent data
VOLUME ["/app/data"]

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "build"]