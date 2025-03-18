# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
RUN mkdir -p /app/data && chown node:node /app/data
COPY package*.json ./
RUN npm ci
COPY . .

# Create dummy env vars for build time
# Include all required environment variables from .env.example
RUN cp .env.example .env && \
    echo "PUBLIC_OIDC_ISSUER=https://example.com" >> .env && \
    echo "PUBLIC_OIDC_AUTH_ENDPOINT=https://example.com/authorize" >> .env && \
    echo "PUBLIC_OIDC_TOKEN_ENDPOINT=https://example.com/api/oidc/token" >> .env && \
    echo "PUBLIC_OIDC_USERINFO_ENDPOINT=https://example.com/api/oidc/userinfo" >> .env && \
    echo "PUBLIC_OIDC_JWKS_URI=https://example.com/.well-known/jwks.json" >> .env && \
    echo "PUBLIC_OIDC_CLIENT_ID=dummy-client-id" >> .env && \
    echo "OIDC_CLIENT_SECRET=dummy-client-secret" >> .env && \
    echo "PUBLIC_OIDC_SCOPES=openid profile email" >> .env && \
    echo "POCKET_ID_API_KEY=dummy-api-key" >> .env && \ 
    echo "PUBLIC_APP_URL=https://example.com" >> .env

RUN npm run build

# Remove the dummy .env file after build is complete
RUN rm .env

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

EXPOSE 3000
LABEL org.opencontainers.image.authors="kmendell"
LABEL org.opencontainers.image.description="Example Pocket ID User Portal"

# Add volume for persistent data
VOLUME ["/app/data"]

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "build"]