# Bootstrap After Run (DB Alterations)

This stack is designed to run **after** `infrastructure/staging` and apply PostgreSQL grants needed by the backend IAM DB user.

## Why this exists

In this project, Cloud SQL IAM user creation and GCP IAM roles are managed in staging Terraform, but PostgreSQL schema/table privileges are not automatically granted at the DB level.

Without these grants, backend startup or OAuth callback can fail with errors like:
- `permission denied for schema public`
- `relation "users" does not exist`

## What this stack does

- Reads staging outputs from remote state:
  - `database_connection_name`
  - `deployment_info.database_name`
  - `backend_database_iam_user`
  - `postgres_password`
- Connects to Cloud SQL as `postgres` using `gcloud sql connect`
  (requires local `psql` client)
- Grants backend DB permissions in schema `public`
- Optionally revokes `CREATE` after initial bootstrap

## Prerequisites

- `infrastructure/staging` has been applied successfully
- `gcloud` is authenticated
- You have permission to connect and administer Cloud SQL
- `psql` client is installed and available in PATH

## Usage

```bash
cd infrastructure/bootstrap-after-run
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

## Security notes

- `postgres_password` is sourced from staging remote state by default.
- Do not commit real secrets to `.tfvars` files.
- Keep `revoke_create_after_bootstrap = false` for the first successful backend boot.
- After backend creates the initial schema, set `revoke_create_after_bootstrap = true` and apply again to harden schema permissions.
