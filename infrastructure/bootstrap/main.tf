# ===========================
# Bootstrap Terraform Configuration
# Purpose: Create GCP project, enable APIs, and set up CI/CD with Workload Identity Federation
# Execution: Run manually on local machine
# ===========================
#
# Prerequisites:
# 1. Create the Terraform state bucket manually:
#  gcloud storage buckets create gs://project-learnops-staging-terraform-statefiles \
#    --location=europe-west3 \
#    --uniform-bucket-level-access
#
# 2. Uncomment the backend configuration below after bucket is created
# ===========================

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }

  # Uncomment this after creating the state bucket manually
  backend "gcs" {
    bucket = "project-learnops-staging-terraform-statefiles"
    prefix = "bootstrap"
  }
}

provider "google" {
  region = var.region
}

locals {
  artifact_registry_repositories = {
    backend = "${var.github_repo}-backend"
    frontend = "${var.github_repo}-frontend"
  }
}

# ===========================
# Create GCP Project
# ===========================

resource "google_project" "staging" {
  name            = var.project_id
  project_id      = var.project_id
  billing_account = var.billing_account
}

# ===========================
# Enable Required APIs
# ===========================

resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "vpcaccess.googleapis.com",
    "artifactregistry.googleapis.com"
  ])

  project            = google_project.staging.project_id
  service            = each.key
  disable_on_destroy = false
}

# ===========================
# Create GitHub Actions Service Account
# ===========================

resource "google_service_account" "github_actions" {
  project      = google_project.staging.project_id
  account_id   = var.github_actions_sa_name
  display_name = "GitHub Actions CI/CD Service Account"
  description  = "Project LearnOps Service account used by GitHub Actions for deploying to staging"

  depends_on = [google_project_service.required_apis]
}

resource "google_service_account" "app_runtime" {
  project      = google_project.staging.project_id
  account_id   = var.app_runtime_sa_name
  display_name = "Application Runtime Service Account"
  description  = "Service account used by runtime services to pull images and access required resources"

  depends_on = [google_project_service.required_apis]
}

# ===========================
# Create Artifact Registry Repositories
# ===========================

resource "google_artifact_registry_repository" "repos" {
  for_each = local.artifact_registry_repositories

  project       = google_project.staging.project_id
  location      = var.region
  repository_id = each.value
  description   = "Docker repository for ${each.key} images"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# ===========================
# Assign IAM Roles to GitHub Actions SA
# ===========================

resource "google_project_iam_member" "github_actions_roles" {
  for_each = toset([
    "roles/run.developer",                # Cloud Run: Deploy and manage services (project-level)
    "roles/cloudsql.client",              # Cloud SQL: Connect to instances (not admin)
    "roles/iam.serviceAccountUser",       # Impersonate service accounts
    "roles/secretmanager.secretAccessor", # Read secrets (not admin)
  ])

  project = google_project.staging.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.github_actions.email}"

  depends_on = [google_service_account.github_actions]
}

resource "google_artifact_registry_repository_iam_member" "github_actions_repo_writer" {
  for_each = google_artifact_registry_repository.repos

  project    = google_project.staging.project_id
  location   = var.region
  repository = each.value.repository_id
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.github_actions.email}"

  depends_on = [google_service_account.github_actions, google_artifact_registry_repository.repos]
}

resource "google_artifact_registry_repository_iam_member" "app_runtime_repo_reader" {
  for_each = google_artifact_registry_repository.repos

  project    = google_project.staging.project_id
  location   = var.region
  repository = each.value.repository_id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.app_runtime.email}"

  depends_on = [google_service_account.app_runtime, google_artifact_registry_repository.repos]
}

resource "google_service_account_iam_member" "github_actions_impersonate_app_runtime" {
  service_account_id = google_service_account.app_runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_actions.email}"

  depends_on = [google_service_account.app_runtime, google_service_account.github_actions]
}

# ===========================
# Setup Workload Identity Federation for GitHub Actions
# ===========================

# Create Workload Identity Pool
resource "google_iam_workload_identity_pool" "learnops_staging_github" {
  project                   = google_project.staging.project_id
  workload_identity_pool_id = "learnops-staging-github-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Project LearnOps Workload Identity Pool for GitHub Actions"

  depends_on = [google_project_service.required_apis]
}

# Create Workload Identity Provider for GitHub
resource "google_iam_workload_identity_pool_provider" "learnops_staging_github" {
  project                            = google_project.staging.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.learnops_staging_github.workload_identity_pool_id
  workload_identity_pool_provider_id = "learnops-staging-github-provider"
  display_name                       = "GitHub Provider"
  description                        = "Project LearnOps GitHub Actions OIDC Provider"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  attribute_condition = "assertion.repository == '${var.github_org}/${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  depends_on = [google_iam_workload_identity_pool.learnops_staging_github]
}

# Allow GitHub Actions to impersonate the service account
resource "google_service_account_iam_member" "github_workload_identity" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.learnops_staging_github.name}/attribute.repository/${var.github_org}/${var.github_repo}"

  depends_on = [google_iam_workload_identity_pool_provider.learnops_staging_github]
}

# ===========================
# Upload Environment Secrets to Secret Manager
# ===========================

resource "google_secret_manager_secret" "env_secrets" {
  for_each = toset(nonsensitive(keys(var.env_secrets)))

  project   = google_project.staging.project_id
  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "env_secrets_version" {
  for_each = toset(nonsensitive(keys(var.env_secrets)))

  secret      = google_secret_manager_secret.env_secrets[each.value].id
  secret_data = var.env_secrets[each.value]
}

# Grant GitHub Actions SA access to read secrets
resource "google_secret_manager_secret_iam_member" "github_actions_secret_access" {
  for_each = toset(nonsensitive(keys(var.env_secrets)))

  project   = google_project.staging.project_id
  secret_id = google_secret_manager_secret.env_secrets[each.value].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions.email}"

  depends_on = [google_secret_manager_secret.env_secrets]
}
