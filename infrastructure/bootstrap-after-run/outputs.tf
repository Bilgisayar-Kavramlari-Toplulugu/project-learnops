output "db_instance_name" {
  description = "Cloud SQL instance where grants were applied"
  value       = local.db_instance_name
}

output "db_name" {
  description = "Database where grants were applied"
  value       = local.db_name
}

output "backend_db_iam_user" {
  description = "Backend IAM DB user that received permissions"
  value       = local.backend_db_user
}

output "grant_applied" {
  description = "Whether backend DB grants were applied"
  value       = true
}

output "create_revoked" {
  description = "Whether CREATE privilege on public schema was revoked"
  value       = var.revoke_create_after_bootstrap
}
