# ===========================
# Cloud Monitoring & Alerting
# Purpose: Uptime checks, alert policies, and dashboard for staging services
# ===========================

# ===========================
# Notification Channel (Email)
# ===========================

resource "google_monitoring_notification_channel" "email" {
  count = var.enable_monitoring && var.alert_email != "" ? 1 : 0

  project      = var.project_id
  display_name = "LearnOps Staging Alerts"
  type         = "email"

  labels = {
    email_address = var.alert_email
  }
}

# ===========================
# Uptime Checks
# ===========================

resource "google_monitoring_uptime_check_config" "frontend" {
  count = var.enable_monitoring ? 1 : 0

  project      = var.project_id
  display_name = "Frontend Uptime Check (Staging)"
  timeout      = "10s"
  period       = "300s" # 5 minutes

  http_check {
    path         = "/"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = var.frontend_domain
    }
  }
}

resource "google_monitoring_uptime_check_config" "backend" {
  count = var.enable_monitoring ? 1 : 0

  project      = var.project_id
  display_name = "Backend Uptime Check (Staging)"
  timeout      = "10s"
  period       = "300s" # 5 minutes

  http_check {
    path         = "/v1/health"
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = replace(replace(local.backend_run_url, "https://", ""), "/", "")
    }
  }
}

# ===========================
# Alert Policies
# ===========================

# Frontend Uptime Alert — triggers when uptime drops below 99%
resource "google_monitoring_alert_policy" "frontend_uptime" {
  count = var.enable_monitoring && var.alert_email != "" ? 1 : 0

  project      = var.project_id
  display_name = "Frontend Uptime < 99% (Staging)"
  combiner     = "OR"

  conditions {
    display_name = "Frontend uptime check failure"
    condition_threshold {
      filter          = "resource.type = \"uptime_url\" AND metric.type = \"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.labels.check_id = \"${google_monitoring_uptime_check_config.frontend[0].uptime_check_id}\""
      comparison      = "COMPARISON_LT"
      threshold_value = 1
      duration        = "300s"

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_NEXT_OLDER"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        group_by_fields      = ["resource.label.project_id"]
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email[0].name]

  alert_strategy {
    auto_close = "1800s" # 30 minutes
  }

  documentation {
    content   = "Frontend staging servisi erişilebilirlik kontrolünde başarısız oldu. Cloud Run servisini ve load balancer'ı kontrol edin.\n\nKontrol URL: https://${var.frontend_domain}"
    mime_type = "text/markdown"
  }
}

# Backend Uptime Alert — triggers when uptime drops below 99%
resource "google_monitoring_alert_policy" "backend_uptime" {
  count = var.enable_monitoring && var.alert_email != "" ? 1 : 0

  project      = var.project_id
  display_name = "Backend Uptime < 99% (Staging)"
  combiner     = "OR"

  conditions {
    display_name = "Backend uptime check failure"
    condition_threshold {
      filter          = "resource.type = \"uptime_url\" AND metric.type = \"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.labels.check_id = \"${google_monitoring_uptime_check_config.backend[0].uptime_check_id}\""
      comparison      = "COMPARISON_LT"
      threshold_value = 1
      duration        = "300s"

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_NEXT_OLDER"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        group_by_fields      = ["resource.label.project_id"]
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email[0].name]

  alert_strategy {
    auto_close = "1800s"
  }

  documentation {
    content   = "Backend staging servisi /v1/health endpoint'inde erişilebilirlik kontrolünde başarısız oldu. Cloud Run servisini ve VPC bağlantısını kontrol edin.\n\nKontrol URL: ${local.backend_public_url}/v1/health"
    mime_type = "text/markdown"
  }
}

# Error Rate Alert — triggers when backend 5xx error rate exceeds 1%
resource "google_monitoring_alert_policy" "backend_error_rate" {
  count = var.enable_monitoring && var.alert_email != "" ? 1 : 0

  project      = var.project_id
  display_name = "Backend Error Rate > 1% (Staging)"
  combiner     = "OR"

  conditions {
    display_name = "Backend 5xx error rate exceeds 1%"
    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.backend_service_name}\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0.01
      duration        = "300s"

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.label.service_name"]
      }

      denominator_filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.backend_service_name}\" AND metric.type = \"run.googleapis.com/request_count\""

      denominator_aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.label.service_name"]
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email[0].name]

  alert_strategy {
    auto_close = "1800s"
  }

  documentation {
    content   = "Backend staging servisinde 5xx hata oranı %1'i aştı. Cloud Run loglarını kontrol edin.\n\n```\ngcloud run services logs read ${var.backend_service_name} --region=${var.region} --limit=50\n```"
    mime_type = "text/markdown"
  }
}

# ===========================
# Monitoring Dashboard
# ===========================

resource "google_monitoring_dashboard" "learnops" {
  count = var.enable_monitoring ? 1 : 0

  project        = var.project_id
  dashboard_json = jsonencode({
    displayName = "LearnOps Staging Overview"
    mosaicLayout = {
      tiles = [
        # --- Row 1: Request Count ---
        {
          xPos   = 0
          yPos   = 0
          width  = 6
          height = 4
          widget = {
            title = "Backend — Request Count"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.backend_service_name}\" AND metric.type = \"run.googleapis.com/request_count\""
                    aggregation = {
                      alignmentPeriod    = "300s"
                      perSeriesAligner   = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                      groupByFields      = ["metric.label.response_code_class"]
                    }
                  }
                }
                plotType = "STACKED_BAR"
              }]
            }
          }
        },
        {
          xPos   = 6
          yPos   = 0
          width  = 6
          height = 4
          widget = {
            title = "Frontend — Request Count"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.frontend_service_name}\" AND metric.type = \"run.googleapis.com/request_count\""
                    aggregation = {
                      alignmentPeriod    = "300s"
                      perSeriesAligner   = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                      groupByFields      = ["metric.label.response_code_class"]
                    }
                  }
                }
                plotType = "STACKED_BAR"
              }]
            }
          }
        },
        # --- Row 2: Latency (p50 & p99) ---
        {
          xPos   = 0
          yPos   = 4
          width  = 6
          height = 4
          widget = {
            title = "Backend — Latency (p50 & p99)"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.backend_service_name}\" AND metric.type = \"run.googleapis.com/request_latencies\""
                      aggregation = {
                        alignmentPeriod    = "300s"
                        perSeriesAligner   = "ALIGN_PERCENTILE_50"
                        crossSeriesReducer = "REDUCE_MEAN"
                      }
                    }
                  }
                  plotType   = "LINE"
                  legendTemplate = "p50"
                },
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.backend_service_name}\" AND metric.type = \"run.googleapis.com/request_latencies\""
                      aggregation = {
                        alignmentPeriod    = "300s"
                        perSeriesAligner   = "ALIGN_PERCENTILE_99"
                        crossSeriesReducer = "REDUCE_MEAN"
                      }
                    }
                  }
                  plotType   = "LINE"
                  legendTemplate = "p99"
                }
              ]
            }
          }
        },
        {
          xPos   = 6
          yPos   = 4
          width  = 6
          height = 4
          widget = {
            title = "Frontend — Latency (p50 & p99)"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.frontend_service_name}\" AND metric.type = \"run.googleapis.com/request_latencies\""
                      aggregation = {
                        alignmentPeriod    = "300s"
                        perSeriesAligner   = "ALIGN_PERCENTILE_50"
                        crossSeriesReducer = "REDUCE_MEAN"
                      }
                    }
                  }
                  plotType   = "LINE"
                  legendTemplate = "p50"
                },
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.frontend_service_name}\" AND metric.type = \"run.googleapis.com/request_latencies\""
                      aggregation = {
                        alignmentPeriod    = "300s"
                        perSeriesAligner   = "ALIGN_PERCENTILE_99"
                        crossSeriesReducer = "REDUCE_MEAN"
                      }
                    }
                  }
                  plotType   = "LINE"
                  legendTemplate = "p99"
                }
              ]
            }
          }
        },
        # --- Row 3: Error Rate & Instance Count ---
        {
          xPos   = 0
          yPos   = 8
          width  = 6
          height = 4
          widget = {
            title = "Backend — Error Rate (5xx)"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.backend_service_name}\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
                    aggregation = {
                      alignmentPeriod    = "300s"
                      perSeriesAligner   = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                    }
                  }
                }
                plotType = "LINE"
              }]
            }
          }
        },
        {
          xPos   = 6
          yPos   = 8
          width  = 6
          height = 4
          widget = {
            title = "Cloud Run — Active Instances"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.backend_service_name}\" AND metric.type = \"run.googleapis.com/container/instance_count\""
                      aggregation = {
                        alignmentPeriod    = "300s"
                        perSeriesAligner   = "ALIGN_MEAN"
                        crossSeriesReducer = "REDUCE_SUM"
                      }
                    }
                  }
                  plotType       = "LINE"
                  legendTemplate = "Backend"
                },
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.frontend_service_name}\" AND metric.type = \"run.googleapis.com/container/instance_count\""
                      aggregation = {
                        alignmentPeriod    = "300s"
                        perSeriesAligner   = "ALIGN_MEAN"
                        crossSeriesReducer = "REDUCE_SUM"
                      }
                    }
                  }
                  plotType       = "LINE"
                  legendTemplate = "Frontend"
                }
              ]
            }
          }
        }
      ]
    }
  })
}
