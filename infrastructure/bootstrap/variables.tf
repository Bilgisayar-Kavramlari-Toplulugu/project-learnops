# ===========================
# Bootstrap Variables
# ===========================

variable "billing_account" {
  description = "GCP Billing Account ID"
  type        = string
}

variable "project_id" {
  description = "GCP Project ID for Staging"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "github_actions_sa_name" {
  description = "Service Account name for GitHub Actions"
  type        = string
  default     = "learnops-stg-gha-sa"
}

variable "app_runtime_sa_name" {
  description = "Service Account name used by app runtime (Cloud Run)"
  type        = string
  default     = "learnops-stg-app-sa"
}

variable "github_org" {
  description = "GitHub organization or username"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name (without org)"
  type        = string
}

variable "terraform_state_bucket_name" {
  description = "Name of the GCS bucket for Terraform state (must be globally unique)"
  type        = string
}

variable "env_secrets" {
  description = "Map of environment secrets to upload to Secret Manager"
  type        = map(string)
  sensitive   = true
  default     = {}
}

# ===========================
# OAuth2 Configuration (for manual setup in Google Cloud Console)
# ===========================

variable "frontend_domain" {
  description = "Frontend custom domain for OAuth redirect URIs"
  type        = string
  default     = ""
}

variable "backend_domain" {
  description = "Backend custom domain or Cloud Run URL for OAuth redirect URIs"
  type        = string
  default     = ""
}

variable "oauth_redirect_uri_paths" {
  description = "Paths to append to domains for OAuth redirects"
  type        = list(string)
  default     = ["/auth/callback", "/callback"]
}
