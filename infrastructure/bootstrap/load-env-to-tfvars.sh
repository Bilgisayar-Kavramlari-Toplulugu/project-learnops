#!/bin/bash

# ===========================
# Load .env Secrets to Terraform Format
# Purpose: Convert .env file to Terraform tfvars format for bootstrap
# Usage: ./load-env-to-tfvars.sh [path-to-env-file]
# ===========================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Load .env Secrets to Terraform"
echo "========================================="
echo ""

# Determine .env file path
ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at: $ENV_FILE${NC}"
    echo ""
    echo "Usage: $0 [path-to-env-file]"
    echo "Example: $0 backend/.env"
    exit 1
fi

echo -e "${GREEN}✓ Found .env file: $ENV_FILE${NC}"
echo ""

# Function to safely read env variable
get_env_value() {
    local key=$1
    local value=$(grep "^${key}=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
    echo "$value"
}

# Read values from .env
echo "Reading secrets from $ENV_FILE..."

JWT_SECRET=$(get_env_value "JWT_SECRET")
SESSION_SECRET=$(get_env_value "SESSION_SECRET")
GOOGLE_CLIENT_ID=$(get_env_value "GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET=$(get_env_value "GOOGLE_CLIENT_SECRET")
GITHUB_CLIENT_ID=$(get_env_value "GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET=$(get_env_value "GITHUB_CLIENT_SECRET")
LINKEDIN_CLIENT_ID=$(get_env_value "LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET=$(get_env_value "LINKEDIN_CLIENT_SECRET")
TOKEN_ENCRYPTION_KEY=$(get_env_value "TOKEN_ENCRYPTION_KEY")

echo -e "${GREEN}✓ Successfully read secrets from .env${NC}"
echo ""

# Generate Terraform tfvars snippet
OUTPUT_FILE="./env_secrets.auto.tfvars"

echo "Generating Terraform variables file: $OUTPUT_FILE"
echo ""

cat > "$OUTPUT_FILE" <<EOF
# ===========================
# Environment Secrets (Auto-generated from .env)
# WARNING: This file contains sensitive data!
# DO NOT commit to version control!
# Generated on: $(date)
# ===========================

env_secrets = {
  # JWT
  JWT_SECRET = "$JWT_SECRET"

  # Session
  SESSION_SECRET = "$SESSION_SECRET"

  # OAuth - Google
  GOOGLE_CLIENT_ID     = "$GOOGLE_CLIENT_ID"
  GOOGLE_CLIENT_SECRET = "$GOOGLE_CLIENT_SECRET"

  # OAuth - GitHub
  GITHUB_CLIENT_ID     = "$GITHUB_CLIENT_ID"
  GITHUB_CLIENT_SECRET = "$GITHUB_CLIENT_SECRET"

  # OAuth - LinkedIn
  LINKEDIN_CLIENT_ID     = "$LINKEDIN_CLIENT_ID"
  LINKEDIN_CLIENT_SECRET = "$LINKEDIN_CLIENT_SECRET"

  # Token Encryption
  TOKEN_ENCRYPTION_KEY = "$TOKEN_ENCRYPTION_KEY"
}
EOF

echo -e "${GREEN}✓ Generated: $OUTPUT_FILE${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY NOTES:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. This file contains sensitive secrets!"
echo "2. It is listed in .gitignore (*.auto.tfvars)"
echo "3. DO NOT commit this file to version control"
echo "4. After running terraform apply, delete this file"
echo "5. All secrets will be stored in Google Secret Manager"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Review the generated file: $OUTPUT_FILE"
echo "2. Complete your terraform.tfvars with other required values"
echo "3. Run: cd infrastructure/bootstrap && terraform apply"
echo "4. After successful apply, delete: rm $OUTPUT_FILE"
echo ""
echo "========================================="
echo "✓ Done!"
echo "========================================="
