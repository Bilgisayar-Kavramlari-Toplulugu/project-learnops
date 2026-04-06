# ===========================
# Bootstrap-After-Run Variables
# Purpose: post-staging DB privilege alterations
# ===========================

variable "project_id" {
  description = "GCP project ID where Cloud SQL instance exists"
  type        = string
}

variable "region" {
  description = "GCP region of Cloud SQL instance"
  type        = string
  default     = "europe-west3"
}

# Compatibility inputs to match staging-style terraform.tfvars.
# These are optional in this stack and mostly ignored, but declared so the
# same tfvars file can be reused without undeclared-variable errors.
variable "artifact_registry_region" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "vpc_name" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "db_instance_name" {
  description = "Cloud SQL instance name override (preferred explicit input)"
  type        = string
  default     = ""
}

variable "db_name" {
  description = "Database name override (preferred explicit input)"
  type        = string
  default     = ""
}

variable "backend_service_name" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "frontend_service_name" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "frontend_domain" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "backend_image" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "frontend_image" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "secret_jwt_secret" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "secret_session_secret" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "secret_google_client_id" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "secret_google_client_secret" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "secret_github_client_id" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "secret_github_client_secret" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "secret_linkedin_client_id" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "secret_linkedin_client_secret" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "secret_token_encryption_key" {
  description = "Compatibility input (unused in bootstrap-after-run)"
  type        = string
  default     = ""
}

variable "staging_state_bucket" {
  description = "GCS bucket containing staging Terraform state"
  type        = string
  default     = "project-learnops-staging-terraform-statefiles"
}

variable "staging_state_prefix" {
  description = "State prefix used by infrastructure/staging"
  type        = string
  default     = "staging"
}

variable "postgres_admin_password_override" {
  description = "Optional postgres admin password override. Leave empty to read from staging remote state output postgres_password."
  type        = string
  sensitive   = true
  default     = ""
}

variable "db_name_override" {
  description = "Optional DB name override. Leave empty to read from staging remote state output deployment_info.database_name."
  type        = string
  default     = ""
}

variable "db_instance_name_override" {
  description = "Optional Cloud SQL instance name override. Leave empty to derive from staging remote state output database_connection_name."
  type        = string
  default     = ""
}

variable "backend_db_iam_user_override" {
  description = "Optional backend IAM DB username override. Leave empty to read from staging remote state output backend_database_iam_user."
  type        = string
  default     = ""
}

variable "revoke_create_after_bootstrap" {
  description = "If true, revokes CREATE on public schema after grants are applied and bootstrap is complete. Keep false for first successful startup."
  type        = bool
  default     = false
}
