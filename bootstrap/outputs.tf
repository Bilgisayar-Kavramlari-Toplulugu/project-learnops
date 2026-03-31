# ===========================
# Bootstrap Outputs
# ===========================

output "project_id" {
  description = "The GCP Project ID"
  value       = google_project.staging.project_id
}

output "project_number" {
  description = "The GCP Project Number"
  value       = google_project.staging.number
}

output "region" {
  description = "The GCP Region"
  value       = var.region
}

output "github_actions_sa_email" {
  description = "GitHub Actions Service Account Email"
  value       = google_service_account.github_actions.email
}

output "app_runtime_sa_email" {
  description = "Application runtime Service Account Email"
  value       = google_service_account.app_runtime.email
}

output "artifact_registry_backend_repository" {
  description = "Artifact Registry backend repository ID"
  value       = google_artifact_registry_repository.repos["backend"].repository_id
}

output "artifact_registry_fronted_repository" {
  description = "Artifact Registry fronted repository ID"
  value       = google_artifact_registry_repository.repos["fronted"].repository_id
}

output "artifact_registry_backend_image_base" {
  description = "Base image path for backend images"
  value       = "${var.region}-docker.pkg.dev/${google_project.staging.project_id}/${google_artifact_registry_repository.repos["backend"].repository_id}"
}

output "artifact_registry_fronted_image_base" {
  description = "Base image path for fronted images"
  value       = "${var.region}-docker.pkg.dev/${google_project.staging.project_id}/${google_artifact_registry_repository.repos["fronted"].repository_id}"
}

output "workload_identity_provider" {
  description = "Workload Identity Provider resource name"
  value       = google_iam_workload_identity_pool_provider.learnops_staging_github.name
}

output "workload_identity_provider_full" {
  description = "Full Workload Identity Provider name for GitHub Actions auth"
  value       = "projects/${google_project.staging.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.learnops_staging_github.workload_identity_pool_id}/providers/${google_iam_workload_identity_pool_provider.learnops_staging_github.workload_identity_pool_provider_id}"
}

output "terraform_state_bucket" {
  description = "GCS bucket name for Terraform state"
  value       = var.terraform_state_bucket_name
}

output "github_actions_setup_instructions" {
  description = "Instructions for setting up GitHub Actions"
  value       = <<-EOT
    Workload Identity Federation Setup Complete!
    
    Add these secrets to your GitHub Repository:
    
    1. GCP_PROJECT_ID: ${google_project.staging.project_id}
    2. GCP_PROJECT_NUMBER: ${google_project.staging.number}
    3. GCP_WORKLOAD_IDENTITY_PROVIDER: ${google_iam_workload_identity_pool_provider.learnops_staging_github.name}
    4. GCP_SERVICE_ACCOUNT: ${google_service_account.github_actions.email}
    5. APP_RUNTIME_SERVICE_ACCOUNT: ${google_service_account.app_runtime.email}
    6. BACKEND_IMAGE_BASE: ${var.region}-docker.pkg.dev/${google_project.staging.project_id}/${google_artifact_registry_repository.repos["backend"].repository_id}
    7. FRONTED_IMAGE_BASE: ${var.region}-docker.pkg.dev/${google_project.staging.project_id}/${google_artifact_registry_repository.repos["fronted"].repository_id}
    
    Your GitHub Actions workflow will authenticate using Workload Identity Federation
    without requiring service account keys!
    
    Terraform State Bucket: ${var.terraform_state_bucket_name}
    Use this bucket for your staging infrastructure state.
  EOT
}

output "secrets_uploaded" {
  description = "List of secrets uploaded to Secret Manager"
  value       = keys(var.env_secrets)
}

# ===========================
# OAuth2 Configuration Outputs
# Note: OAuth Client ID must be created manually in Google Cloud Console
# Use these outputs to configure authorized redirect URIs
# ===========================

output "oauth_authorized_javascript_origins" {
  description = "Authorized JavaScript origins for OAuth Client ID (add to Console)"
  value = compact([
    var.frontend_domain != "" ? "https://${var.frontend_domain}" : null,
    var.backend_domain != "" ? "https://${var.backend_domain}" : null,
  ])
}

output "oauth_authorized_redirect_uris" {
  description = "Authorized redirect URIs for OAuth Client ID (add to Console)"
  value = concat(
    var.frontend_domain != "" ? [
      for path in var.oauth_redirect_uri_paths :
      "https://${var.frontend_domain}${path}"
    ] : [],
    var.backend_domain != "" ? [
      for path in var.oauth_redirect_uri_paths :
      "https://${var.backend_domain}${path}"
    ] : []
  )
}

output "oauth_setup_instructions" {
  description = "Instructions for setting up OAuth Client ID in Google Cloud Console"
  value = <<-EOT
    OAuth2 Client ID Setup Instructions:
    
    1. Go to Google Cloud Console → APIs & Services → Credentials
    2. Click on your OAuth 2.0 Client ID (Web application)
    3. Add these to "Authorized JavaScript origins":
    ${join("\n    ", compact([
  var.frontend_domain != "" ? "https://${var.frontend_domain}" : null,
  var.backend_domain != "" ? "https://${var.backend_domain}" : null,
]))}
    
    4. Add these to "Authorized redirect URIs":
    ${join("\n    ", concat(
var.frontend_domain != "" ? [
  for path in var.oauth_redirect_uri_paths :
  "https://${var.frontend_domain}${path}"
] : [],
var.backend_domain != "" ? [
  for path in var.oauth_redirect_uri_paths :
  "https://${var.backend_domain}${path}"
] : []
))}
    
    5. Click Save
    
    NOTE: OAuth Client ID must be created manually first. This bootstrap only manages
    infrastructure secrets. OAuth application credentials are managed separately in GCP Console.
  EOT
}
