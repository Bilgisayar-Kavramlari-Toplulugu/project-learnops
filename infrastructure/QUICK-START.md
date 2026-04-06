# Quick Reference - Infrastructure Changes

## What Was Done

All 5 requirements have been implemented:

1. ✅ **Workload Identity Federation** - No more service account keys
2. ✅ **GCS State Bucket** - Manual creation with instructions
3. ✅ **Secret Manager Integration** - .env values uploaded automatically
4. ✅ **Generic terraform.tfvars** - References secret names, not values
5. ✅ **Separated Files** - variables.tf and outputs.tf created

## Quick Start

### 1. Create State Bucket (One-time)

```bash
BUCKET_NAME="learnops-terraform-state-$(date +%s)"
gcloud storage buckets create gs://${BUCKET_NAME} --location=US --uniform-bucket-level-access
gcloud storage buckets update gs://${BUCKET_NAME} --versioning
```

### 2. Configure Bootstrap

```bash
cd infrastructure/bootstrap

# Copy and edit config
cp terraform.tfvars.example terraform.tfvars
# Edit: billing_account, project_id, github_org, github_repo, bucket name

# Load secrets from .env
./load-env-to-tfvars.sh ../../backend/.env  # Or path to your .env

# Update main.tf backend bucket name (line 18)
# Uncomment backend configuration after bucket is created

# Apply
terraform init
terraform apply
```

### 3. Save GitHub Secrets

After bootstrap apply, get values:

```bash
terraform output -raw project_id                          # GCP_PROJECT_ID
terraform output -raw project_number                      # GCP_PROJECT_NUMBER
terraform output -raw workload_identity_provider          # GCP_WORKLOAD_IDENTITY_PROVIDER
terraform output -raw github_actions_sa_email             # GCP_SERVICE_ACCOUNT
```

Add to GitHub: `Settings → Secrets and variables → Actions`

### 4. Configure Staging

```bash
cd ../staging

# Update main.tf backend bucket name (line 18)

# Check terraform.tfvars.example for defaults
# Most values are already set, just verify they match your needs
```

### 5. Deploy

Push to `release` branch:

```bash
git add .
git commit -m "Infrastructure improvements with Workload Identity"
git push origin release
```

Watch GitHub Actions deploy automatically!

## File Structure

```
infrastructure/
├── bootstrap/
│   ├── main.tf                    # Resources (Workload Identity, Secrets)
│   ├── variables.tf               # Input variables
│   ├── outputs.tf                 # Outputs for GitHub
│   ├── terraform.tfvars.example   # Example configuration
│   ├── load-env-to-tfvars.sh     # Helper script ⭐ NEW
│   └── README.md                  # Detailed guide
│
├── staging/
│   ├── main.tf                    # Resources (Cloud Run, SQL, VPC)
│   ├── variables.tf               # Input variables (with secret references)
│   ├── outputs.tf                 # Deployment outputs
│   ├── terraform.tfvars.example   # Example configuration
│   └── README.md                  # Detailed guide
│
└── IMPLEMENTATION-SUMMARY.md      # This document explains everything ⭐ NEW
```

## Key GitHub Secrets

| Secret Name | Where to Get | Purpose |
|-------------|--------------|---------|
| `GCP_PROJECT_ID` | `terraform output -raw project_id` | Project identifier |
| `GCP_PROJECT_NUMBER` | `terraform output -raw project_number` | For Workload Identity |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `terraform output -raw workload_identity_provider` | Authentication |
| `GCP_SERVICE_ACCOUNT` | `terraform output -raw github_actions_sa_email` | Service account to impersonate |

## Important Notes

### ⚠️ Security

- ❌ **Never commit** `terraform.tfvars` with real values
- ❌ **Never commit** `*.auto.tfvars` files (auto-excluded)
- ✅ **Always use** Secret Manager for sensitive data
- ✅ **Always use** Workload Identity (no keys!)

### 🔧 Customization

Edit these if needed:

**Bootstrap** (`terraform.tfvars`):
- `billing_account` - Your GCP billing account
- `project_id` - Globally unique project ID
- `github_org` - Your GitHub username/org
- `github_repo` - Your repository name
- `terraform_state_bucket_name` - Globally unique bucket name

**Staging** (`terraform.tfvars.example`):
- Most defaults are fine
- Update image paths if different registry
- Adjust instance sizes if needed (db-f1-micro, etc.)

### 🐛 Troubleshooting

**"Permission Denied" in GitHub Actions:**
- Check all 4 GitHub secrets are set correctly
- Verify repository name matches `github_org/github_repo` in bootstrap
- Ensure workflow has `id-token: write` permission (already added)

**"Bucket Not Found":**
- Create bucket manually (see step 1 above)
- Update bucket name in both bootstrap and staging `main.tf`

**"Secret Not Found":**
- Verify secrets uploaded: `gcloud secrets list --project=PROJECT_ID`
- Re-run bootstrap if needed: `cd infrastructure/bootstrap && terraform apply`

**Backend Can't Read Secrets:**
- Check service account has `roles/secretmanager.secretAccessor`
- Verify secret names match between bootstrap and staging variables

## Testing

### Test Bootstrap

```bash
cd infrastructure/bootstrap
terraform plan   # Should show all resources to be created
terraform apply  # Creates project, Workload Identity, secrets
terraform output # Verify all outputs are present
```

### Test Staging (locally)

```bash
cd infrastructure/staging
terraform init
terraform plan   # Should show Cloud Run, SQL, VPC to be created
# Don't apply locally if using CI/CD
```

### Test GitHub Actions

1. Push to `release` branch
2. Go to Actions tab
3. Watch workflow execute
4. Check for green checkmarks ✅

## Verification

After successful deployment:

```bash
# List Cloud Run services
gcloud run services list --project=PROJECT_ID

# Check database
gcloud sql instances list --project=PROJECT_ID

# Check secrets
gcloud secrets list --project=PROJECT_ID

# Get application URLs
cd infrastructure/staging
terraform output frontend_url
terraform output backend_url
```

## Next Actions

1. ✅ Test bootstrap deployment locally
2. ✅ Add GitHub secrets
3. ✅ Test staging deployment via GitHub Actions
4. ✅ Verify application is accessible
5. ⏭️ Set up monitoring and alerts
6. ⏭️ Configure custom domain
7. ⏭️ Implement Blue-Green deployment

## Documentation

- **Full Details**: `/infrastructure/IMPLEMENTATION-SUMMARY.md`
- **Bootstrap Guide**: `/infrastructure/bootstrap/README.md`
- **Staging Guide**: `/infrastructure/staging/README.md`
- **Deployment Guide**: `/infrastructure/DEPLOYMENT-GUIDE.md`

## Support

Run into issues? Check:

1. README files for detailed explanations
2. Terraform state: `terraform show`
3. GCP Console for resource status
4. GitHub Actions logs for deployment details

---

**Remember**: All secrets are now in Secret Manager, state is in GCS, and authentication is keyless! 🎉
