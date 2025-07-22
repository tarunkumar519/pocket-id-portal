#!/bin/bash

# Stop and remove existing container
docker stop pocket-id-portal 2>/dev/null || true
docker rm pocket-id-portal 2>/dev/null || true

# Run with host networking and port 5173
docker run -d \
  --name pocket-id-portal \
  --network host \
  --env-file .env \
  -e PORT=5173 \
  -e HOST=192.168.0.111 \
  -e PUID=$(id -u) \
  -e PGID=$(id -g) \
  -v pocket-id-data:/app/data \
  --restart unless-stopped \
  pocket-id-portal:latest

echo "Container started with host networking"
echo "App should be available at http://192.168.0.111:5173"
echo "Check logs with: docker logs pocket-id-portal"
