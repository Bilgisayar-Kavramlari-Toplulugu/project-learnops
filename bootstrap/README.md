# Bootstrap Infrastructure

This directory contains Terraform configuration for bootstrapping the GCP staging environment. This is **Tier 1** and should be executed **manually on your local machine**.

## Purpose

The bootstrap phase:
1. Creates a new GCP project for staging
2. Enables required APIs (Cloud Run, Cloud SQL, Secret Manager, etc.)
3. Creates two Artifact Registry Docker repositories (`<github_repo>-backend` and `<github_repo>-fronted`)
4. Creates service accounts for GitHub Actions CI/CD and app runtime
5. Sets up Workload Identity Federation (secure, keyless authentication)
6. Uploads environment secrets to Google Secret Manager
7. Assigns necessary IAM roles

## Prerequisites

- Terraform >= 1.0 installed
- GCP account with billing enabled
- `gcloud` CLI authenticated with project creation permissions
- Organization admin access (or ability to create standalone projects)
- Your `.env` file with application secrets

## Setup Steps

### 1. Create Terraform State Bucket Manually

**Why manual?** To avoid chicken-and-egg problem: Terraform needs a state backend before it can create resources, but the bucket itself must exist first.

```bash
# Replace YOUR-UNIQUE-BUCKET-NAME with your chosen bucket name
# Must be globally unique across all of GCP
gcloud storage buckets create gs://YOUR-UNIQUE-BUCKET-NAME \
  --location=US \
  --uniform-bucket-level-access

# Enable versioning for state file protection
gcloud storage buckets update gs://YOUR-UNIQUE-BUCKET-NAME \
  --versioning
```

### 2. Configure Variables

Copy the example file and fill in your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and provide:
- `billing_account`: Your GCP billing account ID
- `project_id`: Unique project ID for staging
- `region`: GCP region (default: `us-central1`)
- `github_org`: Your GitHub username or organization
- `github_repo`: Your repository name
- `terraform_state_bucket_name`: The bucket name you created in step 1
- `env_secrets`: Map of secrets from your .env file

**Loading secrets from .env file:**

You can load secrets from your .env file using a helper script or manually. For example:

```bash
# Option 1: Edit terraform.tfvars directly with values from .env
# Option 2: Use Terraform variables via environment variables
# Option 3: Create a script to convert .env to Terraform format
```

### 3. Update Backend Configuration

After creating the bucket, uncomment the backend configuration in `main.tf`:

```hcl
backend "gcs" {
  bucket = "YOUR-TERRAFORM-STATE-BUCKET-NAME"
  prefix = "bootstrap"
}
```

### 4. Authenticate with GCP

```bash
gcloud auth application-default login
```

### 5. Initialize Terraform

```bash
terraform init
```

If you already ran `terraform init` before configuring the backend, run:

```bash
terraform init -migrate-state
```

### 6. Review the Plan

```bash
terraform plan
```

### 7. Apply the Configuration

```bash
terraform apply
```

### 8. Get GitHub Actions Secrets

After successful apply, Terraform will output the necessary values:

```bash
terraform output github_actions_setup_instructions
```

### 9. Add Secrets to GitHub Repository

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these repository secrets:

1. **GCP_PROJECT_ID**: From `terraform output project_id`
2. **GCP_PROJECT_NUMBER**: From `terraform output project_number`  
3. **GCP_WORKLOAD_IDENTITY_PROVIDER**: From `terraform output workload_identity_provider`
4. **GCP_SERVICE_ACCOUNT**: From `terraform output github_actions_sa_email`
5. **APP_RUNTIME_SERVICE_ACCOUNT**: From `terraform output app_runtime_sa_email`
6. **BACKEND_IMAGE_BASE**: From `terraform output artifact_registry_backend_image_base`
7. **FRONTED_IMAGE_BASE**: From `terraform output artifact_registry_fronted_image_base`

**For Terraform variables in staging**, you'll also need:
- **TF_VAR_project_id**: Same as GCP_PROJECT_ID
- **TF_VAR_backend_image**: Your backend image path
- **TF_VAR_frontend_image**: Your frontend image path

### 10. Verify Secrets in Secret Manager

All environment secrets should now be in Google Secret Manager:

```bash
gcloud secrets list --project=$(terraform output -raw project_id)
```

## How Workload Identity Federation Works

Instead of using service account keys (which can be leaked), Workload Identity Federation allows GitHub Actions to authenticate directly using OIDC tokens:

1. GitHub Actions generates an OIDC token for your workflow
2. Google Cloud validates the token against your Workload Identity Pool
3. If valid, GitHub Actions can impersonate the service account
4. No keys to manage or rotate!

## Outputs

- `project_id`: The created GCP project ID
- `project_number`: The GCP project number (needed for Workload Identity)
- `region`: The GCP region
- `github_actions_sa_email`: Email of the GitHub Actions service account
- `app_runtime_sa_email`: Email of the runtime service account
- `artifact_registry_backend_repository`: Backend Artifact Registry repository ID
- `artifact_registry_fronted_repository`: Fronted Artifact Registry repository ID
- `artifact_registry_backend_image_base`: Base image URL for backend builds
- `artifact_registry_fronted_image_base`: Base image URL for fronted builds
- `workload_identity_provider`: Workload Identity Provider resource name
- `terraform_state_bucket`: GCS bucket name for Terraform state
- `github_actions_setup_instructions`: Complete setup guide
- `secrets_uploaded`: List of secrets uploaded to Secret Manager

## Next Steps

After bootstrap is complete:

1. Configure the staging infrastructure in `../staging/`
2. Update GitHub Actions workflows to use Workload Identity
3. Deploy your application using the CI/CD pipeline

## Cleanup (if needed)

To destroy the bootstrap infrastructure:

```bash
terraform destroy
```

**Note**: This will not delete the state bucket. Delete it manually if needed:

```bash
gcloud storage buckets delete gs://YOUR-BUCKET-NAME
```

## Security Best Practices

✅ **DO:**
- Use Workload Identity Federation (no keys!)
- Store secrets in Secret Manager
- Use uniform bucket-level access
- Enable versioning on state bucket
- Restrict GitHub Actions by repository

❌ **DON'T:**
- Commit `terraform.tfvars` with secrets
- Use service account keys in production
- Store secrets in code or environment variables
- Disable Secret Manager encryption

terraform destroy
```

**Warning**: This will delete the project and all associated resources!

## Next Steps

After completing bootstrap:
1. Add the service account key to GitHub Secrets
2. Configure the `staging/` directory for application infrastructure
3. Set up the GitHub Actions workflow for automated deployments
