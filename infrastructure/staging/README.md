# Staging Infrastructure

This directory contains Terraform configuration for deploying the LearnOps 3-tier application to GCP staging environment. This is **Tier 2** and is designed to be executed **automatically by GitHub Actions**.

## Architecture

The staging environment includes:

### 1. Networking
- **VPC Network**: Private network for resource communication
- **Serverless VPC Connector**: Enables Cloud Run to access private Cloud SQL instance
- **Private IP Range**: Allocated for Cloud SQL with VPC peering

### 2. Database (Cloud SQL PostgreSQL)
- **Instance Type**: db-f1-micro (cost-optimized for staging)
- **Network**: Private IP only (no public access)
- **Features**: Automated backups, encrypted storage
- **Credentials**: Retrieved from Secret Manager (created in bootstrap)

### 3. Backend (Cloud Run)
- **Runtime**: Python with FastAPI/Uvicorn
- **Port**: 8080
- **Database Connection**: Via private IP through VPC connector
- **Environment Variables**: All secrets from Secret Manager
- **Service Account**: Custom SA with Secret Manager and Cloud SQL permissions

### 4. Frontend (Cloud Run)
- **Runtime**: Node.js with Next.js
- **Port**: 3000
- **Backend Integration**: Environment variable with backend URL
- **Access**: Publicly accessible (allow-unauthenticated)

## Prerequisites

- Bootstrap phase completed:
  - ✅ Project created with APIs enabled
  - ✅ Artifact Registry repositories created (`<github_repo>-backend` and `<github_repo>-frontend`)
  - ✅ Workload Identity Federation configured
  - ✅ Secrets uploaded to Secret Manager
  - ✅ Terraform state bucket created
- Docker images built and pushed to Artifact Registry
- GitHub repository secrets configured:
  - `GCP_PROJECT_ID`: Project ID from bootstrap
  - `GCP_PROJECT_NUMBER`: Project number from bootstrap
  - `GCP_WORKLOAD_IDENTITY_PROVIDER`: Workload Identity Provider name
  - `GCP_SERVICE_ACCOUNT`: Service account email
  - `TF_VAR_backend_image`: Backend image path (set by CI/CD)
  - `TF_VAR_frontend_image`: Frontend image path (set by CI/CD)

## Configuration

### Backend State

This configuration uses **remote state** stored in Google Cloud Storage:

```hcl
backend "gcs" {
  bucket = "your-terraform-state-bucket"  # Created in bootstrap
  prefix = "staging"
}
```

Update the bucket name in `main.tf` to match your state bucket.

### Variables

All configuration is managed through `terraform.tfvars`. The example file shows generic names that reference Secret Manager:

- **Infrastructure settings**: Project ID, region, service names
- **Artifact Registry prefix**: `github_repo` (used to resolve repository IDs)
- **Secret references**: Names of secrets in Secret Manager (not the values)

Staging grants `roles/artifactregistry.reader` on:
- `<github_repo>-backend`
- `<github_repo>-frontend`

for these identities:
- Backend runtime service account
- Frontend runtime service account
- Cloud Run service agent (`service-<PROJECT_NUMBER>@serverless-robot-prod.iam.gserviceaccount.com`)

## Secrets from Secret Manager

Only application secrets are retrieved from Secret Manager at runtime. Cloud SQL
credentials are not stored in Secret Manager for Cloud Run.

| Variable | Secret Manager ID | Description |
|----------|------------------|-------------|
| `JWT_SECRET` | `JWT_SECRET` | JWT signing key |
| `SESSION_SECRET` | `SESSION_SECRET` | Session encryption key |
| `GOOGLE_CLIENT_ID` | `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `LINKEDIN_CLIENT_ID` | `LINKEDIN_CLIENT_ID` | LinkedIn OAuth client ID |
| `LINKEDIN_CLIENT_SECRET` | `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth client secret |
| `TOKEN_ENCRYPTION_KEY` | `TOKEN_ENCRYPTION_KEY` | Token encryption key |

Cloud Run database runtime values are injected directly by Terraform:

| Variable | Source |
|----------|--------|
| `INSTANCE_CONNECTION_NAME` | `google_sql_database_instance.postgres.connection_name` |
| `DB_NAME` | `google_sql_database.database.name` |
| `DB_USER` | backend runtime service account email without `.gserviceaccount.com` |
| `GOOGLE_PROJECT_ID` | resolved from Terraform project ID |

## Local Testing (Optional)

You can test the infrastructure locally before relying on CI/CD:

### 1. Authenticate with GCP

```bash
# Use your own credentials (requires appropriate permissions)
gcloud auth application-default login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

### 2. Configure Variables

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
# Note: Secret names should match what was created in bootstrap
```

### 3. Initialize Terraform

Terraform will use the GCS backend automatically:

```bash
terraform init
```

### 4. Plan and Apply

```bash
terraform plan
terraform apply
```

## GitHub Actions Deployment

The infrastructure is automatically deployed via GitHub Actions when:
- Changes are merged to the `release` branch
- Workflow is manually triggered

### Workflows

1. **deploy-staging.yml**: Deploy infrastructure only (images must exist)
2. **deploy-staging-full.yml**: Build images + deploy infrastructure

Both workflows use **Workload Identity Federation** for secure, keyless authentication to Google Cloud.

### How It Works

1. GitHub Actions generates an OIDC token
2. Google Cloud validates the token against Workload Identity Pool
3. GitHub impersonates the service account (no keys needed!)
4. Terraform applies infrastructure changes
5. Cloud Run services pull secrets from Secret Manager at runtime

## Adding New Secrets

If you need to add new application secrets:

### 1. Add to Bootstrap

Update `infrastructure/bootstrap/terraform.tfvars`:

```hcl
env_secrets = {
  # ... existing secrets ...
  NEW_SECRET_KEY = "value-from-your-env-file"
}
```

### 2. Re-apply Bootstrap

```bash
cd infrastructure/bootstrap
terraform apply
```

### 3. Add Variable to Staging

In `infrastructure/staging/variables.tf`:

```hcl
variable "secret_new_secret_key" {
  description = "Secret Manager secret ID for new secret"
  type        = string
  default     = "NEW_SECRET_KEY"
}
```

### 4. Reference in Cloud Run

In `infrastructure/staging/main.tf`, add to the backend or frontend container:

```hcl
env {
  name = "NEW_SECRET_KEY"
  value_source {
    secret_key_ref {
      secret  = var.secret_new_secret_key
      version = "latest"
    }
  }
}
```

### 5. Deploy

Commit and push to trigger deployment.

## Outputs

After successful deployment, Terraform outputs:

- `frontend_url`: Public URL of the frontend application
- `backend_url`: Public URL of the backend API
- `database_connection_name`: Cloud SQL connection name
- `database_private_ip`: Database private IP address

View outputs:

```bash
terraform output
```

## Troubleshooting

### Cloud Run Can't Connect to Database

- Verify VPC connector is healthy
- Check service account has `roles/cloudsql.client`
- Ensure database is using private IP

### Secrets Not Loading

- Verify secrets exist in Secret Manager: `gcloud secrets list`
- Check service account has `roles/secretmanager.secretAccessor`
- Verify secret names match variable defaults

### Workload Identity Authentication Fails

- Confirm GitHub secrets are set correctly
- Verify repository matches attribute condition in bootstrap
- Check workflow has `id-token: write` permission

### State Lock Errors

If Terraform state is locked:

```bash
# Force unlock (use with caution)
terraform force-unlock LOCK_ID
```

## Cleanup

To destroy the staging infrastructure:

```bash
terraform destroy
```

**Warning**: This will delete:
- Cloud Run services
- Cloud SQL instance (and all data)
- VPC network and connector

The state file in GCS and Secret Manager secrets will remain.

## Security Best Practices

✅ **Implemented:**
- Workload Identity Federation (no service account keys!)
- All secrets in Secret Manager
- Database on private IP only
- Service accounts with minimal permissions
- Terraform state encrypted and versioned

❌ **Consider Adding:**
- Cloud Armor for DDoS protection
- Cloud CDN for frontend
- Cloud Monitoring alerts
- Binary Authorization for container signing
- Customer-managed encryption keys (CMEK)

    secret_key_ref {
      secret  = "SECRET_NAME"
      version = "latest"
    }

```

## Database Connection

The backend connects to Cloud SQL using:
1. **Private IP**: Via VPC connector (no public IP exposed)
2. **Cloud SQL Proxy**: Configured via annotation `run.googleapis.com/cloudsql-instances`
3. **Credentials**: Retrieved from Secret Manager at runtime

Connection string format:
```
postgresql://USER:PASSWORD@PRIVATE_IP:5432/DATABASE
```

## Outputs

After successful deployment:
- `frontend_url`: Public URL of the frontend application
- `backend_url`: Public URL of the backend API
- `database_connection_name`: Cloud SQL connection name
- `database_private_ip`: Private IP of the database (sensitive)
- `vpc_network`: VPC network name

View outputs:
```bash
terraform output
terraform output -raw frontend_url
```

## Cost Optimization

Staging environment uses cost-optimized settings:
- **Cloud SQL**: db-f1-micro tier (lowest cost)
- **Cloud Run**: Scales to zero when idle (no idle costs)
- **VPC Connector**: Minimum size (10.8.0.0/28)
- **Storage**: Standard HDD for Cloud SQL

Estimated monthly cost (minimal usage): ~$10-20

## Troubleshooting

### Cloud Run can't connect to Cloud SQL
- Verify VPC connector is created and attached
- Check service account has `cloudsql.client` role
- Ensure Cloud SQL has private IP configured

### Database password not accessible
- Verify service account has `secretmanager.secretAccessor` role
- Check secret exists: `gcloud secrets describe db-password`

### Images not found
- Verify images are pushed to Artifact Registry
- Check image paths in `terraform.tfvars`
- Ensure service account has `storage.admin` role

### Permission denied errors
- Verify bootstrap service account has all required roles
- Check IAM bindings: `gcloud projects get-iam-policy PROJECT_ID`

## Cleanup

To destroy the staging environment:

```bash
terraform destroy
```

**Warning**: This will delete all resources including the database!

## Next Steps

1. Push Docker images to Artifact Registry
2. Configure GitHub Actions workflow
3. Test the deployment pipeline
4. Monitor application logs and metrics in GCP Console
