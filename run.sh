#!/bin/bash
set -e

# Build step
cd frontend && docker build -t skribble-frontend -f Dockerfile.frontend .
cd ../backend && docker build -t skribbe-backend -f Dockerfile.backend .
cd ..

# Create network
docker network create my-net 2>/dev/null || true

# Run frontend 
docker run -d -p 5173:80 --rm --name react-skribbl --network my-net skribble-frontend

# Run backend
docker run -d -p 3001:3001 --rm --name node-skribble --network my-net skribbe-backend

echo "Both containers are running!"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"