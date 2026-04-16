# ===========================
# Staging Infrastructure Configuration
# Purpose: Deploy 3-tier application (Frontend, Backend, Database) on GCP
# Execution: Automated via GitHub Actions
# ===========================

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }

  # Backend configuration for Terraform state in GCS
  # Created manually in bootstrap phase
  backend "gcs" {
    bucket = "project-learnops-staging-terraform-statefiles"
    prefix = "staging"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ===========================
# Data Sources
# ===========================

data "google_project" "project" {
  project_id = var.project_id
}

locals {
  backend_db_iam_user = trimsuffix(
    google_service_account.backend_runtime.email,
    ".gserviceaccount.com"
  )
  backend_artifact_repository_id  = "${var.github_repo}-backend"
  frontend_artifact_repository_id = "${var.github_repo}-frontend"
  cloud_run_service_agent_email   = "service-${data.google_project.project.number}@serverless-robot-prod.iam.gserviceaccount.com"
  # Direct Cloud Run URLs (stable, deterministic — used for internal service-to-service calls)
  backend_run_url  = "https://${var.backend_service_name}-${data.google_project.project.number}.${var.region}.run.app"
  frontend_run_url = "https://${var.frontend_service_name}-${data.google_project.project.number}.${var.region}.run.app"
  # Public-facing URLs: backend uses direct Cloud Run URL, frontend uses static IP load balancer
  backend_public_url  = local.backend_run_url
  frontend_public_url = "https://${var.frontend_domain}"
}

# ===========================
# VPC Network
# ===========================

resource "google_compute_network" "vpc" {
  name                    = var.vpc_name
  auto_create_subnetworks = true
  routing_mode            = "REGIONAL"
}

# ===========================
# Private IP Range for Cloud SQL
# ===========================

resource "google_compute_global_address" "private_ip_range" {
  name          = "cloudsql-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
}

# ===========================
# Serverless VPC Access Connector
# ===========================

resource "google_vpc_access_connector" "connector" {
  name          = "learnops-vpc-connector"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.8.0.0/28"
  min_instances = 2
  max_instances = 3

  depends_on = [google_compute_network.vpc]
}

# ===========================
# Cloud SQL (PostgreSQL) Instance
# ===========================

resource "google_sql_database_instance" "postgres" {
  name             = var.db_instance_name
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-f1-micro" # 1 vCPU, 0.6 GiB Memory
    availability_type = "ZONAL"
    disk_size         = 10
    disk_type         = "PD_HDD"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc.id
      enable_private_path_for_google_cloud_services = true
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = false
    }

    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }
  }

  deletion_protection = false

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "database" {
  name     = var.db_name
  instance = google_sql_database_instance.postgres.name
}

# Create regular password-based user for migrations & initial setup
resource "google_sql_user" "postgres_admin" {
  name     = "postgres"
  instance = google_sql_database_instance.postgres.name
  type     = "BUILT_IN"
  password = random_password.postgres_password.result
}

# Generate random password for postgres user
resource "random_password" "postgres_password" {
  length  = 32
  special = true
}

# Create IAM-based user for Cloud SQL Python Connector (no password needed)
# Note: This is created AFTER database initialization for Cloud Run usage
resource "google_sql_user" "iam_user" {
  name     = local.backend_db_iam_user
  instance = google_sql_database_instance.postgres.name
  type     = "CLOUD_IAM_SERVICE_ACCOUNT"

  depends_on = [google_sql_database.database, google_sql_user.postgres_admin]
}

# ===========================
# Service Account for Backend Cloud Run
# ===========================

resource "google_service_account" "backend_runtime" {
  account_id   = "backend-runtime-sa"
  display_name = "Backend Cloud Run Runtime Service Account"
}

# Grant IAM roles for Cloud SQL access via Workload Identity
resource "google_project_iam_member" "backend_cloudsql_instance_user" {
  project = var.project_id
  role    = "roles/cloudsql.instanceUser"
  member  = "serviceAccount:${google_service_account.backend_runtime.email}"
}

resource "google_project_iam_member" "backend_cloudsql_client_connector" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend_runtime.email}"
}

# Backend still needs Secret Manager access for OAuth and JWT secrets
resource "google_project_iam_member" "backend_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend_runtime.email}"
}

# ===========================
# Backend Cloud Run Service
# ===========================

# Fetch additional secrets for backend
data "google_secret_manager_secret_version" "jwt_secret" {
  secret  = var.secret_jwt_secret
  project = var.project_id
}

data "google_secret_manager_secret_version" "session_secret" {
  secret  = var.secret_session_secret
  project = var.project_id
}

data "google_secret_manager_secret_version" "google_client_id" {
  secret  = var.secret_google_client_id
  project = var.project_id
}

data "google_secret_manager_secret_version" "google_client_secret" {
  secret  = var.secret_google_client_secret
  project = var.project_id
}

data "google_secret_manager_secret_version" "github_client_id" {
  secret  = var.secret_github_client_id
  project = var.project_id
}

data "google_secret_manager_secret_version" "github_client_secret" {
  secret  = var.secret_github_client_secret
  project = var.project_id
}

data "google_secret_manager_secret_version" "linkedin_client_id" {
  secret  = var.secret_linkedin_client_id
  project = var.project_id
}

data "google_secret_manager_secret_version" "linkedin_client_secret" {
  secret  = var.secret_linkedin_client_secret
  project = var.project_id
}

data "google_secret_manager_secret_version" "token_encryption_key" {
  secret  = var.secret_token_encryption_key
  project = var.project_id
}

resource "google_cloud_run_v2_service" "backend" {
  name     = var.backend_service_name
  location = var.region

  template {
    service_account = google_service_account.backend_runtime.email

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = var.backend_image

      ports {
        container_port = 8080
      }

      # Cloud SQL Python Connector configuration (uses Workload Identity, no password)
      env {
        name  = "INSTANCE_CONNECTION_NAME"
        value = google_sql_database_instance.postgres.connection_name
      }

      env {
        name  = "DB_USER"
        value = local.backend_db_iam_user
      }

      env {
        name  = "DB_NAME"
        value = google_sql_database.database.name
      }

      # JWT Configuration
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.secret_jwt_secret
            version = "latest"
          }
        }
      }

      env {
        name  = "JWT_ALGORITHM"
        value = "HS256"
      }

      env {
        name  = "ACCESS_TOKEN_EXPIRE_MINUTES"
        value = "15"
      }

      env {
        name  = "REFRESH_TOKEN_EXPIRE_DAYS"
        value = "7"
      }

      # Session Secret
      env {
        name = "SESSION_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.secret_session_secret
            version = "latest"
          }
        }
      }

      # Google OAuth
      env {
        name = "GOOGLE_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = var.secret_google_client_id
            version = "latest"
          }
        }
      }

      env {
        name = "GOOGLE_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.secret_google_client_secret
            version = "latest"
          }
        }
      }

      env {
        name  = "GOOGLE_PROJECT_ID"
        value = data.google_project.project.project_id
      }

      env {
        name  = "GOOGLE_AUTH_URI"
        value = "https://accounts.google.com/o/oauth2/auth"
      }

      env {
        name  = "GOOGLE_TOKEN_URI"
        value = "https://oauth2.googleapis.com/token"
      }

      env {
        name  = "GOOGLE_AUTH_PROVIDER_X509_CERT_URL"
        value = "https://www.googleapis.com/oauth2/v1/certs"
      }

      # GitHub OAuth
      env {
        name = "GITHUB_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = var.secret_github_client_id
            version = "latest"
          }
        }
      }

      env {
        name = "GITHUB_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.secret_github_client_secret
            version = "latest"
          }
        }
      }

      # LinkedIn OAuth
      env {
        name = "LINKEDIN_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = var.secret_linkedin_client_id
            version = "latest"
          }
        }
      }

      env {
        name = "LINKEDIN_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.secret_linkedin_client_secret
            version = "latest"
          }
        }
      }

      # Token Encryption
      env {
        name = "TOKEN_ENCRYPTION_KEY"
        value_source {
          secret_key_ref {
            secret  = var.secret_token_encryption_key
            version = "latest"
          }
        }
      }

      # Environment
      env {
        name  = "ENVIRONMENT"
        value = "staging"
      }

      env {
        name  = "BACKEND_INTERNAL_URL"
        value = local.backend_run_url
      }

      env {
        name  = "BACKEND_PUBLIC_URL"
        value = local.backend_public_url
      }

      env {
        name  = "FRONTEND_PUBLIC_URL"
        value = local.frontend_public_url
      }

      env {
        name  = "ALLOWED_ORIGINS"
        value = local.frontend_public_url
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_sql_database_instance.postgres,
    google_sql_database.database,
    google_sql_user.iam_user,
    google_vpc_access_connector.connector
  ]
}

# Allow unauthenticated access to backend (for demo purposes)
resource "google_cloud_run_v2_service_iam_member" "backend_noauth" {
  name     = google_cloud_run_v2_service.backend.name
  location = google_cloud_run_v2_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ===========================
# Service Account for Frontend Cloud Run
# ===========================

resource "google_service_account" "frontend_runtime" {
  account_id   = "frontend-runtime-sa"
  display_name = "Frontend Cloud Run Runtime Service Account"
}

resource "google_project_iam_member" "frontend_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.frontend_runtime.email}"
}

# Allow runtime identities and Cloud Run service agent to pull images from Artifact Registry repos.
resource "google_artifact_registry_repository_iam_member" "backend_runtime_repo_reader" {
  project    = var.project_id
  location   = var.artifact_registry_region
  repository = local.backend_artifact_repository_id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.backend_runtime.email}"
}

resource "google_artifact_registry_repository_iam_member" "frontend_runtime_repo_reader" {
  project    = var.project_id
  location   = var.artifact_registry_region
  repository = local.frontend_artifact_repository_id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.frontend_runtime.email}"
}

resource "google_artifact_registry_repository_iam_member" "cloud_run_service_agent_backend_repo_reader" {
  project    = var.project_id
  location   = var.artifact_registry_region
  repository = local.backend_artifact_repository_id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${local.cloud_run_service_agent_email}"
}

resource "google_artifact_registry_repository_iam_member" "cloud_run_service_agent_frontend_repo_reader" {
  project    = var.project_id
  location   = var.artifact_registry_region
  repository = local.frontend_artifact_repository_id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${local.cloud_run_service_agent_email}"
}

# ===========================
# Frontend Cloud Run Service
# ===========================

resource "google_cloud_run_v2_service" "frontend" {
  name     = var.frontend_service_name
  location = var.region

  template {
    service_account = google_service_account.frontend_runtime.email

    containers {
      image = var.frontend_image

      ports {
        container_port = 3000
      }

      env {
        name  = "BACKEND_URL"
        value = google_cloud_run_v2_service.backend.uri
      }

      env {
        name  = "BACKEND_INTERNAL_URL"
        value = google_cloud_run_v2_service.backend.uri
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [google_cloud_run_v2_service.backend]
}

# Allow unauthenticated access to frontend (publicly accessible)
resource "google_cloud_run_v2_service_iam_member" "frontend_noauth" {
  name     = google_cloud_run_v2_service.frontend.name
  location = google_cloud_run_v2_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ===========================
# Static External IP Addresses
# ===========================

resource "google_compute_global_address" "frontend_ip" {
  name         = "frontend-static-ip"
  address_type = "EXTERNAL"
}

resource "google_compute_managed_ssl_certificate" "frontend_managed_cert" {
  name = "frontend-managed-cert"

  managed {
    domains = [var.frontend_domain]
  }
}

# ===========================
# Load Balancers (Static IP → Cloud Run via Serverless NEG)
# ===========================

# --- Frontend Load Balancer ---

resource "google_compute_region_network_endpoint_group" "frontend_neg" {
  name                  = "frontend-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_v2_service.frontend.name
  }
}

resource "google_compute_backend_service" "frontend_bs" {
  name                  = "frontend-backend-service"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  backend {
    group = google_compute_region_network_endpoint_group.frontend_neg.id
  }
}

resource "google_compute_url_map" "frontend_url_map" {
  name            = "frontend-url-map"
  default_service = google_compute_backend_service.frontend_bs.id
}

resource "google_compute_url_map" "frontend_http_redirect_url_map" {
  name = "frontend-http-redirect-url-map"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "frontend_http_proxy" {
  name    = "frontend-http-proxy"
  url_map = google_compute_url_map.frontend_http_redirect_url_map.id
}

resource "google_compute_target_https_proxy" "frontend_https_proxy" {
  name             = "frontend-https-proxy"
  url_map          = google_compute_url_map.frontend_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.frontend_managed_cert.id]
}

resource "google_compute_global_forwarding_rule" "frontend_http_fr" {
  name                  = "frontend-http-forwarding-rule"
  target                = google_compute_target_http_proxy.frontend_http_proxy.id
  port_range            = "80"
  ip_address            = google_compute_global_address.frontend_ip.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

resource "google_compute_global_forwarding_rule" "frontend_https_fr" {
  name                  = "frontend-https-forwarding-rule"
  target                = google_compute_target_https_proxy.frontend_https_proxy.id
  port_range            = "443"
  ip_address            = google_compute_global_address.frontend_ip.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
