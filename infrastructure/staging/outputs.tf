# ===========================
# Staging Infrastructure Outputs
# ===========================

output "frontend_url" {
  description = "Public-facing frontend URL (custom domain via load balancer)"
  value       = "https://${var.frontend_domain}"
}

output "frontend_static_ip" {
  description = "Reserved static IP address for frontend"
  value       = google_compute_global_address.frontend_ip.address
}

output "frontend_domain" {
  description = "Configured frontend custom domain"
  value       = var.frontend_domain
}

output "frontend_cloud_run_url" {
  description = "Frontend Cloud Run direct URL (internal use)"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "backend_cloud_run_url" {
  description = "Backend Cloud Run direct URL (internal use)"
  value       = google_cloud_run_v2_service.backend.uri
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_private_ip" {
  description = "Cloud SQL private IP address"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "vpc_network_name" {
  description = "VPC network name"
  value       = google_compute_network.vpc.name
}

output "vpc_connector_name" {
  description = "VPC Access Connector name"
  value       = google_vpc_access_connector.connector.name
}

output "backend_service_account" {
  description = "Backend runtime service account email"
  value       = google_service_account.backend_runtime.email
}

output "backend_database_iam_user" {
  description = "Cloud SQL IAM database username for the backend service account"
  value       = trimsuffix(google_service_account.backend_runtime.email, ".gserviceaccount.com")
}

output "postgres_password" {
  description = "PostgreSQL admin password for running initial migrations"
  value       = random_password.postgres_password.result
  sensitive   = true
}

output "frontend_service_account" {
  description = "Frontend runtime service account email"
  value       = google_service_account.frontend_runtime.email
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    frontend_domain    = var.frontend_domain
    frontend_static_ip = google_compute_global_address.frontend_ip.address
    frontend_run_url   = google_cloud_run_v2_service.frontend.uri
    backend_run_url    = google_cloud_run_v2_service.backend.uri
    database_name      = var.db_name
    region             = var.region
    vpc_network        = google_compute_network.vpc.name
  }
}
