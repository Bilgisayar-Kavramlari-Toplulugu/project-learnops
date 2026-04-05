terraform {
  required_version = ">= 1.4"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }

  backend "gcs" {
    bucket = "project-learnops-staging-terraform-statefiles"
    prefix = "bootstrap-after-run"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

data "terraform_remote_state" "staging" {
  backend = "gcs"

  config = {
    bucket = var.staging_state_bucket
    prefix = var.staging_state_prefix
  }
}

locals {
  staging_outputs = data.terraform_remote_state.staging.outputs

  database_connection_name = local.staging_outputs.database_connection_name
  derived_db_instance_name = element(split(":", local.database_connection_name), 2)

  db_instance_name = trimspace(var.db_instance_name) != "" ? var.db_instance_name : (trimspace(var.db_instance_name_override) != "" ? var.db_instance_name_override : local.derived_db_instance_name)
  db_name          = trimspace(var.db_name) != "" ? var.db_name : (trimspace(var.db_name_override) != "" ? var.db_name_override : local.staging_outputs.deployment_info.database_name)
  backend_db_user  = trimspace(var.backend_db_iam_user_override) != "" ? var.backend_db_iam_user_override : local.staging_outputs.backend_database_iam_user

  postgres_admin_password = trimspace(var.postgres_admin_password_override) != "" ? var.postgres_admin_password_override : local.staging_outputs.postgres_password

  grant_sql = <<-SQL
    GRANT USAGE, CREATE ON SCHEMA public TO "${local.backend_db_user}";
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${local.backend_db_user}";
    GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO "${local.backend_db_user}";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${local.backend_db_user}";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO "${local.backend_db_user}";
  SQL

  revoke_sql = <<-SQL
    REVOKE CREATE ON SCHEMA public FROM "${local.backend_db_user}";
  SQL
}

resource "terraform_data" "grant_backend_db_permissions" {
  triggers_replace = {
    project_id       = var.project_id
    region           = var.region
    db_instance_name = local.db_instance_name
    db_name          = local.db_name
    backend_db_user  = local.backend_db_user
    grant_sql_hash   = sha256(local.grant_sql)
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]

    environment = {
      CLOUDSDK_CORE_DISABLE_PROMPTS = "1"
      CLOUDSDK_CORE_PROJECT         = var.project_id
      PGPASSWORD                    = local.postgres_admin_password
    }

    command = <<-EOT
      set -euo pipefail

      if ! command -v psql >/dev/null 2>&1; then
        echo "ERROR: psql client not found in PATH."
        echo "Install on macOS: brew install libpq && export PATH=\"/opt/homebrew/opt/libpq/bin:\$PATH\""
        exit 1
      fi

      if ! command -v gcloud >/dev/null 2>&1; then
        echo "ERROR: gcloud CLI not found in PATH."
        exit 1
      fi

      sdk_root="$(gcloud info --format='value(installation.sdk_root)')"
      proxy_bin="$sdk_root/bin/cloud-sql-proxy"

      if [[ ! -x "$proxy_bin" ]]; then
        echo "ERROR: cloud-sql-proxy not found at $proxy_bin"
        exit 1
      fi

      sql_file="$(mktemp)"
      proxy_log="$(mktemp)"

      cat > "$sql_file" <<'SQL'
      ${local.grant_sql}
      SQL

      access_token="$(gcloud auth print-access-token)"
      instance_conn="${var.project_id}:${var.region}:${local.db_instance_name}"

      disable_public_ip() {
        gcloud sql instances patch "${local.db_instance_name}" \
          --project="${var.project_id}" \
          --quiet \
          --no-assign-ip >/dev/null || true
      }

      # Temporarily allow public endpoint so local proxy can reach the instance.
      gcloud sql instances patch "${local.db_instance_name}" \
        --project="${var.project_id}" \
        --quiet \
        --assign-ip >/dev/null

      "$proxy_bin" \
        --token "$access_token" \
        "$instance_conn" \
        --port 9470 >"$proxy_log" 2>&1 &
      proxy_pid=$!

      cleanup() {
        kill "$proxy_pid" >/dev/null 2>&1 || true
        disable_public_ip
        rm -f "$sql_file" "$proxy_log"
      }
      trap cleanup EXIT

      sleep 4

      psql "host=127.0.0.1 port=9470 user=postgres dbname=${local.db_name} sslmode=disable" \
        -v ON_ERROR_STOP=1 \
        -f "$sql_file" || {
        echo "ERROR: Failed to execute grant SQL. Proxy log:" >&2
        cat "$proxy_log" >&2 || true
        exit 1
      }

      trap - EXIT
      cleanup
    EOT
  }
}

resource "terraform_data" "revoke_create_post_bootstrap" {
  count = var.revoke_create_after_bootstrap ? 1 : 0

  triggers_replace = {
    project_id       = var.project_id
    region           = var.region
    db_instance_name = local.db_instance_name
    db_name          = local.db_name
    backend_db_user  = local.backend_db_user
    revoke_sql_hash  = sha256(local.revoke_sql)
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]

    environment = {
      CLOUDSDK_CORE_DISABLE_PROMPTS = "1"
      CLOUDSDK_CORE_PROJECT         = var.project_id
      PGPASSWORD                    = local.postgres_admin_password
    }

    command = <<-EOT
      set -euo pipefail

      if ! command -v psql >/dev/null 2>&1; then
        echo "ERROR: psql client not found in PATH."
        echo "Install on macOS: brew install libpq && export PATH=\"/opt/homebrew/opt/libpq/bin:\$PATH\""
        exit 1
      fi

      if ! command -v gcloud >/dev/null 2>&1; then
        echo "ERROR: gcloud CLI not found in PATH."
        exit 1
      fi

      sdk_root="$(gcloud info --format='value(installation.sdk_root)')"
      proxy_bin="$sdk_root/bin/cloud-sql-proxy"

      if [[ ! -x "$proxy_bin" ]]; then
        echo "ERROR: cloud-sql-proxy not found at $proxy_bin"
        exit 1
      fi

      sql_file="$(mktemp)"
      proxy_log="$(mktemp)"

      cat > "$sql_file" <<'SQL'
      ${local.revoke_sql}
      SQL

      access_token="$(gcloud auth print-access-token)"
      instance_conn="${var.project_id}:${var.region}:${local.db_instance_name}"

      disable_public_ip() {
        gcloud sql instances patch "${local.db_instance_name}" \
          --project="${var.project_id}" \
          --quiet \
          --no-assign-ip >/dev/null || true
      }

      # Temporarily allow public endpoint so local proxy can reach the instance.
      gcloud sql instances patch "${local.db_instance_name}" \
        --project="${var.project_id}" \
        --quiet \
        --assign-ip >/dev/null

      "$proxy_bin" \
        --token "$access_token" \
        "$instance_conn" \
        --port 9470 >"$proxy_log" 2>&1 &
      proxy_pid=$!

      cleanup() {
        kill "$proxy_pid" >/dev/null 2>&1 || true
        disable_public_ip
        rm -f "$sql_file" "$proxy_log"
      }
      trap cleanup EXIT

      sleep 4

      psql "host=127.0.0.1 port=9470 user=postgres dbname=${local.db_name} sslmode=disable" \
        -v ON_ERROR_STOP=1 \
        -f "$sql_file" || {
        echo "ERROR: Failed to execute revoke SQL. Proxy log:" >&2
        cat "$proxy_log" >&2 || true
        exit 1
      }

      trap - EXIT
      cleanup
    EOT
  }

  depends_on = [terraform_data.grant_backend_db_permissions]
}
