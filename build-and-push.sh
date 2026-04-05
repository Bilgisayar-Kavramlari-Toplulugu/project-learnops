#!/bin/bash
# Build and push Docker images for Linux (AMD64) to Google Artifact Registry
# This script builds images compatible with GCloud Linux instances

set -euo pipefail

# Configuration (can be overridden via environment variables)
PROJECT_ID="${PROJECT_ID:-learnops-staging}"
REGION="${REGION:-europe-west3}"
GITHUB_REPO="${GITHUB_REPO:-project-learnops}"

# Repositories created by Terraform bootstrap
BACKEND_REPOSITORY="${BACKEND_REPOSITORY:-${GITHUB_REPO}-backend}"
FRONTEND_REPOSITORY="${FRONTEND_REPOSITORY:-${GITHUB_REPO}-frontend}"

# Image names inside each repository
BACKEND_IMAGE_NAME="${BACKEND_IMAGE_NAME:-backend}"
FRONTEND_IMAGE_NAME="${FRONTEND_IMAGE_NAME:-frontend}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get version from .version files
BACKEND_VERSION=$(cat "${SCRIPT_DIR}/backend/.version" 2>/dev/null || echo "0.1.0")
FRONTEND_VERSION=$(cat "${SCRIPT_DIR}/frontend/.version" 2>/dev/null || echo "0.1.0")

BACKEND_IMAGE_BASE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${BACKEND_REPOSITORY}/${BACKEND_IMAGE_NAME}"
FRONTEND_IMAGE_BASE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${FRONTEND_REPOSITORY}/${FRONTEND_IMAGE_NAME}"

echo "=========================================="
echo "Building LearnOps Docker Images for Linux"
echo "=========================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "GitHub Repo Prefix: $GITHUB_REPO"
echo "Backend Repository: $BACKEND_REPOSITORY"
echo "Frontend Repository: $FRONTEND_REPOSITORY"
echo "Backend Version: $BACKEND_VERSION"
echo "Frontend Version: $FRONTEND_VERSION"
echo "Platform: linux/amd64"
echo "=========================================="
echo ""

# Authenticate with Google Cloud (if not already authenticated)
echo "Checking Google Cloud authentication..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build Backend Image
echo ""
echo "Building Backend Image..."
cd "${SCRIPT_DIR}/backend"
docker buildx build \
  --platform linux/amd64 \
  -t ${BACKEND_IMAGE_BASE}:${BACKEND_VERSION} \
  -t ${BACKEND_IMAGE_BASE}:latest \
  --load \
  .

echo "Backend image built successfully"

# Build Frontend Image
echo ""
echo "Building Frontend Image..."
cd "${SCRIPT_DIR}/frontend"
docker buildx build \
  --platform linux/amd64 \
  -t ${FRONTEND_IMAGE_BASE}:${FRONTEND_VERSION} \
  -t ${FRONTEND_IMAGE_BASE}:latest \
  --load \
  .

echo "Frontend image built successfully"

# Push images
echo ""
echo "Pushing images to Artifact Registry..."
echo ""
echo "Pushing backend..."
docker push ${BACKEND_IMAGE_BASE}:${BACKEND_VERSION}
docker push ${BACKEND_IMAGE_BASE}:latest

echo ""
echo "Pushing frontend..."
docker push ${FRONTEND_IMAGE_BASE}:${FRONTEND_VERSION}
docker push ${FRONTEND_IMAGE_BASE}:latest

echo ""
echo "=========================================="
echo "All images built and pushed successfully!"
echo "=========================================="
echo ""
echo "Backend Image:"
echo "  ${BACKEND_IMAGE_BASE}:${BACKEND_VERSION}"
echo "  ${BACKEND_IMAGE_BASE}:latest"
echo ""
echo "Frontend Image:"
echo "  ${FRONTEND_IMAGE_BASE}:${FRONTEND_VERSION}"
echo "  ${FRONTEND_IMAGE_BASE}:latest"
echo ""
echo "Next steps:"
echo "1. Update infrastructure/docker-compose.yml with the new image tags"
echo "2. Copy infrastructure/.env to your GCloud instance"
echo "3. Update .env with production URLs and credentials"
echo "4. SSH to your instance and run: docker compose up -d"
echo "=========================================="
