# Infrastructure as Code

This directory contains Terraform configurations and deployment automation for the LearnOps application on Google Cloud Platform (GCP).

## 📁 Directory Structure

```
infrastructure/
├── bootstrap/                    # Tier 1: Project setup (manual)
│   ├── main.tf                   # Bootstrap infrastructure
│   ├── terraform.tfvars.example  # Configuration template
│   └── README.md                 # Bootstrap guide
├── staging/                      # Tier 2: App infrastructure (automated)
│   ├── main.tf                   # Staging infrastructure
│   ├── terraform.tfvars.example  # Configuration template
│   └── README.md                 # Staging guide
├── production/                   # Production environment (future)
├── develop/                      # Development environment (Local)
├── .gitignore                    # Ignore sensitive files
├── DEPLOYMENT-GUIDE.md           # Complete deployment guide
└── QUICK-REFERENCE.md            # Command cheat sheet
```

## 🏗️ Two-Tier Architecture

### Tier 1: Bootstrap (One-Time Manual Setup)
- **Purpose**: Create GCP project and set up CI/CD service account
- **Execution**: Run once locally
- **Location**: `bootstrap/`
- **Outputs**: Service account key for GitHub Actions

### Tier 2: Infrastructure & Application (Automated)
- **Purpose**: Deploy networking, database, and application services
- **Execution**: Automated via GitHub Actions
- **Location**: `staging/`, `production/`, etc.
- **Outputs**: Application URLs

## 🚀 Quick Start

### For First-Time Setup:

1. **Run Bootstrap** (one time only)
   ```bash
   cd bootstrap
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   terraform init
   terraform apply
   # Follow instructions to add SA key to GitHub
   ```

2. **Configure GitHub Secrets**
   - Add `GCP_SA_KEY` (from bootstrap output)
   - Add `GCP_PROJECT_ID` (your project ID)

3. **Deploy via GitHub Actions**
   ```bash
   git checkout -b release
   git push origin release
   # Workflow automatically deploys infrastructure
   ```

### For Subsequent Deployments:

Just push to the `release` branch:
```bash
git push origin release
```

## 📚 Documentation

- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Comprehensive deployment walkthrough
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Command cheat sheet
- **[bootstrap/README.md](bootstrap/README.md)** - Bootstrap setup details
- **[staging/README.md](staging/README.md)** - Staging infrastructure details

## 🏛️ Architecture Components

### Networking
- VPC Network with private subnets
- Serverless VPC Access Connector
- Private Service Connection for Cloud SQL

### Database
- Cloud SQL PostgreSQL
- Private IP only (no public access)
- Automated backups
- Credentials in Secret Manager

### Application ServicesA
- **Backend**: Cloud Run (FastAPI)
- **Frontend**: Cloud Run (Next.js)
- Both scale to zero when idle

### Security
- Service accounts with least privilege
- Private database connectivity
- Secrets in Google Secret Manager
- VPC isolation

## 🔐 Security

All sensitive data is excluded from version control:
- `*.tfvars` - Configuration files
- `*.tfstate` - Terraform state files
- `*.json` - Service account keys
- `.terraform/` - Terraform cache

**Never commit:**
- Service account keys
- Database passwords
- API keys
- Configuration files with actual values

## 🔧 Common Commands

```bash
# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# View outputs
terraform output

# Destroy infrastructure
terraform destroy
```

## 🌍 Environments

| Environment | Branch | Directory | Status |
|-------------|--------|-----------|--------|
| Staging | `release` | `staging/` | ✅ Configured |
| Production | `main` | `production/` | 🚧 Future |
| Development | `develop` | `develop/` | 🚧 Configured |

## 🤖 CI/CD Workflows

### Available Workflows

1. **staging-infra.yml**
   - Terraform-only deployment
   - For infrastructure changes

2. **deploy-staging-full.yml**
   - Full pipeline: build → push → deploy
   - For application + infrastructure changes

### Workflow Triggers

- **Automatic**: Push to `release` branch
- **Manual**: GitHub Actions → Run workflow

## 📊 Monitoring

View resources in GCP Console:
- [Cloud Run](https://console.cloud.google.com/run)
- [Cloud SQL](https://console.cloud.google.com/sql)
- [VPC Networks](https://console.cloud.google.com/networking/)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager)

## 💰 Cost Optimization

Staging is configured for minimal costs:
- Cloud Run scales to zero (no idle costs)
- Cloud SQL db-f1-micro (~$10/month)
- Minimal VPC connector size
- Private networking (no NAT costs)

**Estimated monthly cost**: $10-20

To reduce costs further:
```bash
# Stop Cloud SQL when not in use
gcloud sql instances patch INSTANCE_NAME --activation-policy=NEVER

# Restart when needed
gcloud sql instances patch INSTANCE_NAME --activation-policy=ALWAYS
```

## 🆘 Troubleshooting

### Common Issues

1. **Terraform state lock**
   ```bash
   terraform force-unlock LOCK_ID
   ```

2. **Permission denied**
   - Check service account has required roles
   - Verify IAM bindings

3. **Database connection failed**
   - Verify VPC connector is created
   - Check Cloud SQL private IP

4. **Image not found**
   - Ensure images are pushed to Artifact Registry
   - Check image paths in tfvars

See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for detailed troubleshooting.

## 🔄 State Management

Currently using **local state**. For team collaboration, consider:

1. **GCS Backend** (Recommended)
   ```hcl
   terraform {
     backend "gcs" {
       bucket = "PROJECT_ID-terraform-state"
       prefix = "staging"
     }
   }
   ```

2. **Terraform Cloud**
   - Free for small teams
   - State locking
   - Remote execution

## 🧪 Testing Infrastructure

Test locally before deploying:

```bash
# Validate syntax
terraform validate

# Format code
terraform fmt -recursive

# Check what will change
terraform plan

# Apply with confirmation
terraform apply
```

## 📝 Making Changes

1. Create feature branch
2. Modify Terraform files
3. Test locally (optional)
4. Create PR
5. Review plan in PR
6. Merge to `release` to deploy

## 🎯 Best Practices

- ✅ Always run `terraform plan` before `apply`
- ✅ Use variables for all configurable values
- ✅ Store state remotely for team projects
- ✅ Use consistent naming conventions
- ✅ Document all resources
- ✅ Tag resources for cost tracking
- ✅ Enable deletion protection for production
- ✅ Use modules for reusable components

## 🚧 Future Enhancements

- [ ] Add production environment
- [ ] Implement remote state in GCS
- [ ] Add Terraform modules
- [ ] Set up Cloud Monitoring alerts
- [ ] Implement automatic backups
- [ ] Add custom domain configuration
- [ ] Implement blue-green deployments
- [ ] Add Terraform Cloud integration

## 📞 Support

For help:
1. Check [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
2. Review [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
3. Check GitHub Actions logs
4. Review Cloud Run/SQL logs in GCP Console

## 📖 Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [Google Cloud Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated**: March 2026  
**Maintained By**: LearnOps DevOps Team
