# LearnOps Staging Deployment Guide

This guide walks you through deploying the LearnOps 3-tier application to Google Cloud Platform (GCP) using a two-tier Terraform architecture.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     TIER 1: Bootstrap                        │
│  (Manual Local Execution - One Time Setup)                  │
├─────────────────────────────────────────────────────────────┤
│  • Create GCP Project                                        │
│  • Enable Required APIs                                      │
│  • Create GitHub Actions Service Account                    │
│  • Assign IAM Roles                                          │
│  • Output Service Account Key                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              TIER 2: Infrastructure & App                    │
│        (Automated via GitHub Actions)                        │
├─────────────────────────────────────────────────────────────┤
│  Networking:                                                 │
│    • VPC Network                                             │
│    • Serverless VPC Access Connector                        │
│    • Private IP Range (Cloud SQL)                           │
│                                                              │
│  Database:                                                   │
│    • Cloud SQL PostgreSQL (Private IP only)                 │
│    • Auto-generated password in Secret Manager              │
│                                                              │
│  Backend (Cloud Run):                                        │
│    • FastAPI/Uvicorn on port 8080                           │
│    • Connected to Cloud SQL via private IP                  │
│    • Environment variables from Secret Manager              │
│                                                              │
│  Frontend (Cloud Run):                                       │
│    • Next.js on port 3000                                   │
│    • Connected to backend via environment variable          │
│    • Publicly accessible                                    │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

Before starting, ensure you have:

1. **GCP Account** with billing enabled
2. **Terraform** >= 1.0 installed locally
3. **gcloud CLI** installed and authenticated
4. **Docker** installed (for building images)
5. **GitHub Repository** with admin access
6. **Project structure** with backend and frontend directories

## 🚀 Deployment Steps

### Phase 1: Bootstrap (One-Time Setup)

#### 1.1 Configure Bootstrap Variables

```bash
cd infrastructure/bootstrap
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
billing_account = "YOUR_BILLING_ACCOUNT_ID"  # Find at console.cloud.google.com/billing
project_id = "learnops-staging"               # Must be globally unique
region = "us-central1"
github_actions_sa_name = "learnops-stg-gha-sa"
```

#### 1.2 Authenticate with GCP

```bash
gcloud auth application-default login
```

#### 1.3 Run Bootstrap

```bash
terraform init
terraform plan
terraform apply
```

**Expected Output:**
- New GCP project created
- APIs enabled
- GitHub Actions service account created with required roles

#### 1.4 Extract Service Account Key

```bash
# Extract the key
terraform output -raw github_actions_sa_key | base64 -d > sa-key.json

# Verify the file
cat sa-key.json | jq .
```

#### 1.5 Add to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add two secrets:
   - Name: `GCP_SA_KEY`
     Value: Paste entire contents of `sa-key.json`
   - Name: `GCP_PROJECT_ID`
     Value: Your project ID (e.g., `learnops-staging`)
5. Click **Add secret**

#### 1.6 Clean Up Local Key

```bash
# IMPORTANT: Delete the local key for security
rm sa-key.json

# Verify it's gone
ls -la sa-key.json  # Should show "No such file"
```

### Phase 2: Prepare Application

#### 2.1 Create Artifact Registry Repository

```bash
# Set project
gcloud config set project learnops-staging

# Create repository
gcloud artifacts repositories create learnops \
  --repository-format=docker \
  --location=us-central1 \
  --description="LearnOps Docker images"
```

#### 2.2 Build and Push Initial Images (Optional)

You can build and push images manually first, or let GitHub Actions do it:

```bash
# Configure Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build images
docker build -t us-central1-docker.pkg.dev/learnops-staging/learnops/backend:latest ./backend
docker build -t us-central1-docker.pkg.dev/learnops-staging/learnops/frontend:latest ./frontend

# Push images
docker push us-central1-docker.pkg.dev/learnops-staging/learnops/backend:latest
docker push us-central1-docker.pkg.dev/learnops-staging/learnops/frontend:latest
```

### Phase 3: Deploy Infrastructure (Automated)

#### 3.1 Configure Staging Variables (Optional for local testing)

If you want to test locally before using GitHub Actions:

```bash
cd infrastructure/staging
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
project_id = "learnops-staging"
region = "us-central1"
backend_image = "us-central1-docker.pkg.dev/learnops-staging/learnops/backend:latest"
frontend_image = "us-central1-docker.pkg.dev/learnops-staging/learnops/frontend:latest"
```

#### 3.2 Deploy via GitHub Actions

Push to the `release` branch to trigger deployment:

```bash
# Create and switch to release branch
git checkout -b release

# Commit your changes
git add .
git commit -m "Initial staging deployment"

# Push to trigger deployment
git push origin release
```

The GitHub Actions workflow will:
1. ✅ Build Docker images
2. ✅ Push to Artifact Registry
3. ✅ Run Terraform to create infrastructure
4. ✅ Deploy Cloud Run services
5. ✅ Output application URLs

#### 3.3 Monitor Deployment

1. Go to: **GitHub → Actions → Deploy to Staging**
2. Watch the workflow progress
3. Check the summary for deployment URLs

### Phase 4: Verify Deployment

#### 4.1 Get Application URLs

The workflow will output URLs in the summary. You can also get them manually:

```bash
cd infrastructure/staging
terraform output frontend_url
terraform output backend_url
```

#### 4.2 Test Frontend

```bash
# Open in browser
open $(terraform output -raw frontend_url)

# Or use curl
curl $(terraform output -raw frontend_url)
```

#### 4.3 Test Backend

```bash
# Health check
curl $(terraform output -raw backend_url)/health

# API endpoint
curl $(terraform output -raw backend_url)/api/v1/...
```

#### 4.4 Check Cloud Run Logs

```bash
# Backend logs
gcloud run services logs read learnops-backend-staging --region=us-central1

# Frontend logs
gcloud run services logs read learnops-frontend-staging --region=us-central1
```

#### 4.5 Verify Database Connection

```bash
# Check Cloud SQL instance
gcloud sql instances describe learnops-db-staging

# Connect to database (requires Cloud SQL Proxy)
gcloud sql connect learnops-db-staging --user=learnops_user
```

## 🔐 Security Best Practices

### 1. Service Account Key Management

- ✅ Store keys only in GitHub Secrets
- ✅ Never commit keys to repository
- ✅ Rotate keys periodically
- ✅ Consider Workload Identity Federation (keyless)

### 2. Database Security

- ✅ Private IP only (no public access)
- ✅ Auto-generated strong passwords
- ✅ Stored in Secret Manager
- ✅ Encrypted at rest

### 3. Secret Management

All sensitive data should be stored in Secret Manager:

```bash
# Create a secret
echo -n "secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# Grant access to service account
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:backend-runtime-sa@learnops-staging.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Network Security

- ✅ VPC for private communication
- ✅ Serverless VPC Connector for Cloud Run
- ✅ No public database access

## 🔧 Troubleshooting

### Issue: "Project ID already exists"

**Solution:** Choose a different project ID in `bootstrap/terraform.tfvars`

### Issue: "Permission denied on Cloud Run"

**Cause:** Service account missing `iam.serviceAccountUser` role

**Solution:**
```bash
gcloud projects add-iam-policy-binding learnops-staging \
  --member="serviceAccount:github-actions-ci@learnops-staging.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### Issue: "Backend can't connect to database"

**Cause:** VPC connector not properly configured

**Solution:**
1. Verify VPC connector exists:
   ```bash
   gcloud compute networks vpc-access connectors describe learnops-vpc-connector \
     --region=us-central1
   ```
2. Check Cloud Run annotation:
   ```bash
   gcloud run services describe learnops-backend-staging \
     --region=us-central1 \
     --format="value(metadata.annotations.[run.googleapis.com/cloudsql-instances])"
   ```

### Issue: "Image not found in Artifact Registry"

**Cause:** Images not built/pushed yet

**Solution:**
```bash
# List images
gcloud artifacts docker images list us-central1-docker.pkg.dev/learnops-staging/learnops

# Build and push
docker build -t us-central1-docker.pkg.dev/learnops-staging/learnops/backend:latest ./backend
docker push us-central1-docker.pkg.dev/learnops-staging/learnops/backend:latest
```

### Issue: "Terraform state locked"

**Cause:** Previous workflow didn't finish properly

**Solution:**
```bash
cd infrastructure/staging
terraform force-unlock LOCK_ID
```

## 📊 Monitoring and Logs

### Cloud Run Metrics

```bash
# View metrics in Console
open https://console.cloud.google.com/run?project=learnops-staging

# Get service details
gcloud run services describe learnops-backend-staging --region=us-central1
gcloud run services describe learnops-frontend-staging --region=us-central1
```

### Cloud SQL Monitoring

```bash
# View Cloud SQL metrics
gcloud sql operations list --instance=learnops-db-staging

# Check instance status
gcloud sql instances describe learnops-db-staging
```

### Application Logs

```bash
# Stream backend logs
gcloud run services logs tail learnops-backend-staging --region=us-central1

# Stream frontend logs
gcloud run services logs tail learnops-frontend-staging --region=us-central1
```

## 💰 Cost Management

### Cost Optimization

The staging environment is configured for minimal costs:

- **Cloud Run**: Scales to zero (no idle costs)
- **Cloud SQL**: db-f1-micro instance (~$7-10/month)
- **VPC**: Minimal connector size
- **Networking**: Private IP (no NAT gateway costs)

**Estimated Monthly Cost:** $10-20 (with minimal usage)

### Stop/Start Staging

To minimize costs when not in use:

```bash
# Stop Cloud SQL (saves ~50% of costs)
gcloud sql instances patch learnops-db-staging --activation-policy=NEVER

# Restart when needed
gcloud sql instances patch learnops-db-staging --activation-policy=ALWAYS

# Cloud Run automatically scales to zero when idle
```

### Complete Teardown

To completely remove staging environment:

```bash
cd infrastructure/staging
terraform destroy
```

**Warning:** This will delete ALL resources including the database!

## 🔄 CI/CD Workflows

### Available Workflows

1. **deploy-staging.yml**: Terraform-only deployment
2. **deploy-staging-full.yml**: Full pipeline (build → push → deploy)

### Workflow Triggers

- **Automatic**: Push to `release` branch
- **Manual**: GitHub Actions → Run workflow

### Workflow Steps

1. Build Docker images
2. Push to Artifact Registry
3. Initialize Terraform
4. Validate configuration
5. Plan changes
6. Apply infrastructure
7. Deploy Cloud Run services
8. Output URLs

## 📚 Additional Resources

- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check Cloud Run logs: `gcloud run services logs read SERVICE_NAME`
4. Verify IAM permissions: `gcloud projects get-iam-policy PROJECT_ID`
5. Review Terraform state: `terraform show`

## 🎉 Next Steps

After successful deployment:

1. ✅ Test all application features
2. ✅ Set up monitoring and alerting
3. ✅ Configure custom domain (if needed)
4. ✅ Implement backup strategy
5. ✅ Document application-specific configurations
6. ✅ Create production environment following same pattern
