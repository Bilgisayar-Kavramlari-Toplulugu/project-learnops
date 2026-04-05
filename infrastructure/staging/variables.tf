# ===========================
# Staging Infrastructure Variables
# ===========================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
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
  default     = "learnops-db-staging"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "learnops"
}

variable "backend_service_name" {
  description = "Backend Cloud Run service name"
  type        = string
  default     = "learnops-backend-staging"
}

variable "frontend_service_name" {
  description = "Frontend Cloud Run service name"
  type        = string
  default     = "learnops-frontend-staging"
}

variable "frontend_domain" {
  description = "Custom domain for frontend HTTPS endpoint (must point A record to frontend static IP)"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name used as Artifact Registry repository prefix"
  type        = string
}

variable "backend_image" {
  description = "Backend Docker image in Artifact Registry"
  type        = string
}

variable "frontend_image" {
  description = "Frontend Docker image in Artifact Registry"
  type        = string
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
