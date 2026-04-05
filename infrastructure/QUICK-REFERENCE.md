# Quick Reference - Terraform & GCP Commands

## 🚀 Bootstrap Commands

```bash
# Navigate to bootstrap directory
cd infrastructure/bootstrap

# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show outputs
terraform output

# Extract service account key
terraform output -raw github_actions_sa_key | base64 -d > sa-key.json

# Destroy infrastructure
terraform destroy
```

## 🏗️ Staging Commands

```bash
# Navigate to staging directory
cd infrastructure/staging

# Initialize Terraform
terraform init

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show outputs
terraform output
terraform output -raw frontend_url
terraform output -raw backend_url

# Destroy infrastructure
terraform destroy
```

## 🐳 Docker Commands

```bash
# Configure Docker for Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build backend image
docker build -t us-central1-docker.pkg.dev/PROJECT_ID/learnops/backend:latest ./backend

# Build frontend image
docker build -t us-central1-docker.pkg.dev/PROJECT_ID/learnops/frontend:latest ./frontend

# Push backend image
docker push us-central1-docker.pkg.dev/PROJECT_ID/learnops/backend:latest

# Push frontend image
docker push us-central1-docker.pkg.dev/PROJECT_ID/learnops/frontend:latest

# List images in registry
gcloud artifacts docker images list us-central1-docker.pkg.dev/PROJECT_ID/learnops
```

## ☁️ GCP gcloud Commands

### Project Management
```bash
# List projects
gcloud projects list

# Set active project
gcloud config set project PROJECT_ID

# Get project details
gcloud projects describe PROJECT_ID
```

### Cloud Run
```bash
# List services
gcloud run services list --region=us-central1

# Describe service
gcloud run services describe SERVICE_NAME --region=us-central1

# View logs
gcloud run services logs read SERVICE_NAME --region=us-central1

# Tail logs
gcloud run services logs tail SERVICE_NAME --region=us-central1

# Update service
gcloud run services update SERVICE_NAME --region=us-central1 --image=NEW_IMAGE

# Delete service
gcloud run services delete SERVICE_NAME --region=us-central1
```

### Cloud SQL
```bash
# List instances
gcloud sql instances list

# Describe instance
gcloud sql instances describe INSTANCE_NAME

# Connect to database
gcloud sql connect INSTANCE_NAME --user=USERNAME

# Stop instance (save costs)
gcloud sql instances patch INSTANCE_NAME --activation-policy=NEVER

# Start instance
gcloud sql instances patch INSTANCE_NAME --activation-policy=ALWAYS

# List databases
gcloud sql databases list --instance=INSTANCE_NAME

# Delete instance
gcloud sql instances delete INSTANCE_NAME
```

### Secret Manager
```bash
# List secrets
gcloud secrets list

# Create secret
echo -n "secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# View secret value
gcloud secrets versions access latest --secret=SECRET_NAME

# Update secret
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Delete secret
gcloud secrets delete SECRET_NAME

# Grant access to service account
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

### IAM & Service Accounts
```bash
# List service accounts
gcloud iam service-accounts list

# Create service account
gcloud iam service-accounts create SA_NAME --display-name="Display Name"

# Add IAM binding
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SA_EMAIL" \
  --role="roles/ROLE_NAME"

# List IAM bindings
gcloud projects get-iam-policy PROJECT_ID

# Create service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=SA_EMAIL

# List keys
gcloud iam service-accounts keys list --iam-account=SA_EMAIL
```

### VPC & Networking
```bash
# List VPCs
gcloud compute networks list

# Describe VPC
gcloud compute networks describe VPC_NAME

# List VPC connectors
gcloud compute networks vpc-access connectors list --region=us-central1

# Describe connector
gcloud compute networks vpc-access connectors describe CONNECTOR_NAME --region=us-central1
```

### Artifact Registry
```bash
# List repositories
gcloud artifacts repositories list

# Create repository
gcloud artifacts repositories create REPO_NAME \
  --repository-format=docker \
  --location=us-central1

# List images
gcloud artifacts docker images list LOCATION-docker.pkg.dev/PROJECT_ID/REPO_NAME

# Delete image
gcloud artifacts docker images delete IMAGE_PATH
```

## 🔍 Debugging Commands

```bash
# Check API enablement
gcloud services list --enabled

# Enable API
gcloud services enable SERVICE_NAME.googleapis.com

# Check quotas
gcloud compute project-info describe --project=PROJECT_ID

# View audit logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Check Cloud Run service status
gcloud run services describe SERVICE_NAME --region=us-central1 --format=json

# Test connectivity to Cloud SQL
gcloud sql connect INSTANCE_NAME --user=USERNAME --quiet

# Check service account permissions
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:SA_EMAIL"
```

## 📊 Monitoring Commands

```bash
# Cloud Run metrics
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"'

# List recent deployments
gcloud run revisions list --service=SERVICE_NAME --region=us-central1

# Get service URL
gcloud run services describe SERVICE_NAME --region=us-central1 --format='value(status.url)'

# Check Cloud SQL operations
gcloud sql operations list --instance=INSTANCE_NAME

# View billing
gcloud billing accounts list
```

## 🧹 Cleanup Commands

```bash
# Delete all Cloud Run services
gcloud run services list --format="value(SERVICE)" --region=us-central1 | \
  xargs -I {} gcloud run services delete {} --region=us-central1 --quiet

# Delete Cloud SQL instance
gcloud sql instances delete INSTANCE_NAME --quiet

# Delete VPC connector
gcloud compute networks vpc-access connectors delete CONNECTOR_NAME --region=us-central1 --quiet

# Delete VPC network
gcloud compute networks delete VPC_NAME --quiet

# Delete secrets
gcloud secrets delete SECRET_NAME --quiet

# Delete Artifact Registry repository
gcloud artifacts repositories delete REPO_NAME --location=us-central1 --quiet

# Delete project (DANGEROUS!)
gcloud projects delete PROJECT_ID
```

## 🔐 Security Commands

```bash
# List exposed Cloud Run services
gcloud run services list \
  --format="table(SERVICE,URL,LAST_MODIFIER,LAST_MODIFIED)" \
  --filter="metadata.annotations['run.googleapis.com/ingress']='all'"

# Revoke public access
gcloud run services remove-iam-policy-binding SERVICE_NAME \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"

# Rotate service account key
gcloud iam service-accounts keys create new-key.json --iam-account=SA_EMAIL
# Update GitHub secret
# Delete old key
gcloud iam service-accounts keys delete KEY_ID --iam-account=SA_EMAIL

# Check for public buckets (if any)
gsutil iam get gs://BUCKET_NAME

# Scan for vulnerabilities
gcloud container images describe IMAGE_PATH --show-package-vulnerability
```

## 📝 Git & GitHub Commands

```bash
# Push to release branch (triggers deployment)
git checkout -b release
git add .
git commit -m "Deploy to staging"
git push origin release

# View GitHub Actions logs
gh run list
gh run view RUN_ID
gh run watch RUN_ID

# List repository secrets
gh secret list

# Set repository secret
gh secret set GCP_SA_KEY < sa-key.json
gh secret set GCP_PROJECT_ID --body "PROJECT_ID"
```

## 🔧 Useful One-Liners

```bash
# Get all service URLs
gcloud run services list --region=us-central1 --format="value(status.url)"

# Count running revisions
gcloud run services list --format="value(metadata.name)" | wc -l

# Get database connection string
echo "postgresql://$(gcloud sql users list --instance=INSTANCE_NAME --format='value(name)'):PASSWORD@$(gcloud sql instances describe INSTANCE_NAME --format='value(ipAddresses[0].ipAddress)'):5432/DATABASE_NAME"

# Check if service is publicly accessible
gcloud run services get-iam-policy SERVICE_NAME --region=us-central1 | grep allUsers

# Get latest image tag
gcloud artifacts docker images list us-central1-docker.pkg.dev/PROJECT_ID/REPO/IMAGE --sort-by=~UPDATE_TIME --limit=1

# Estimate monthly costs (requires billing export)
gcloud billing accounts list
```

## 💡 Tips

### Terraform
- Always run `terraform plan` before `apply`
- Use `terraform fmt` to format code
- Use `terraform validate` to check syntax
- Store state remotely for team collaboration

### GCP
- Use `--format` flag for structured output
- Use `--filter` for precise queries
- Use `--quiet` to skip confirmations
- Set default region: `gcloud config set run/region us-central1`

### Docker
- Tag images with version and `latest`
- Use `.dockerignore` to reduce image size
- Multi-stage builds for smaller images
- Scan images for vulnerabilities

### Security
- Never commit `.tfvars` or service account keys
- Rotate keys periodically
- Use least privilege principle
- Enable audit logging
- Use Secret Manager for all secrets
