# ===========================
# Staging Infrastructure Variables
# ===========================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "learnops-staging"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "europe-west3"
}

variable "vpc_name" {
  description = "VPC Network name"
  type        = string
  default     = "learnops-vpc"
}

variable "db_instance_name" {
  description = "Cloud SQL instance name"
  type        = string
  default     = "learnops-staging-db"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "learnops-staging-db"
}

variable "backend_service_name" {
  description = "Backend Cloud Run service name"
  type        = string
  default     = "backend"
}

variable "frontend_service_name" {
  description = "Frontend Cloud Run service name"
  type        = string
  default     = "frontend"
}

variable "frontend_domain" {
  description = "Custom domain for frontend HTTPS endpoint (must point A record to frontend static IP)"
  type        = string
  default     = "learnops-staging.findmywayapp.com"
}

variable "github_repo" {
  description = "GitHub repository name used as Artifact Registry repository prefix"
  type        = string
  default     = "project-learnops"
}

variable "backend_image" {
  description = "Backend Docker image in Artifact Registry"
  type        = string
  default     = "europe-west3-docker.pkg.dev/learnops-staging/project-learnops-backend/backend:latest"
}

variable "frontend_image" {
  description = "Frontend Docker image in Artifact Registry"
  type        = string
  default     = "europe-west3-docker.pkg.dev/learnops-staging/project-learnops-frontend/frontend:latest"
}

variable "artifact_registry_region" {
  description = "Artifact Registry region"
  type        = string
  default     = "europe-west3"
}

variable "secret_jwt_secret" {
  description = "Secret Manager secret ID for JWT secret"
  type        = string
  default     = "JWT_SECRET"
}

variable "secret_session_secret" {
  description = "Secret Manager secret ID for session secret"
  type        = string
  default     = "SESSION_SECRET"
}

variable "secret_google_client_id" {
  description = "Secret Manager secret ID for Google OAuth client ID"
  type        = string
  default     = "GOOGLE_CLIENT_ID"
}

variable "secret_google_client_secret" {
  description = "Secret Manager secret ID for Google OAuth client secret"
  type        = string
  default     = "GOOGLE_CLIENT_SECRET"
}

variable "secret_github_client_id" {
  description = "Secret Manager secret ID for GitHub OAuth client ID"
  type        = string
  default     = "GITHUB_CLIENT_ID"
}

variable "secret_github_client_secret" {
  description = "Secret Manager secret ID for GitHub OAuth client secret"
  type        = string
  default     = "GITHUB_CLIENT_SECRET"
}

variable "secret_linkedin_client_id" {
  description = "Secret Manager secret ID for LinkedIn OAuth client ID"
  type        = string
  default     = "LINKEDIN_CLIENT_ID"
}

variable "secret_linkedin_client_secret" {
  description = "Secret Manager secret ID for LinkedIn OAuth client secret"
  type        = string
  default     = "LINKEDIN_CLIENT_SECRET"
}

variable "secret_token_encryption_key" {
  description = "Secret Manager secret ID for token encryption key"
  type        = string
  default     = "TOKEN_ENCRYPTION_KEY"
}

variable "secret_backend_public_url" {
  description = "Secret Manager secret ID for backend public URL (used in OAuth callback URLs)"
  type        = string
  default     = "BACKEND_PUBLIC_URL"
}

variable "secret_frontend_public_url" {
  description = "Secret Manager secret ID for frontend public URL (used in OAuth callback URLs)"
  type        = string
  default     = "FRONTEND_PUBLIC_URL"
}

variable "content_job_image" {
  description = "Content update Cloud Run Job Docker image (managed by content-deploy workflow after initial creation)"
  type        = string
  default     = "europe-west3-docker.pkg.dev/learnops-staging/project-learnops-backend/content-job:latest"
}
