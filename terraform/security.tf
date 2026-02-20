# Secrets Manager for App Secrets
resource "random_password" "nextauth_secret" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "app_secrets" {
  name_prefix = "${var.project_name}-app-secrets-"
  description = "Application secrets (DB URL, NextAuth Secret)"
}

resource "aws_secretsmanager_secret_version" "app_secrets_val" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL    = "mysql://${var.db_username}:${var.db_password}@${aws_db_instance.default.endpoint}/${var.db_name}"
    NEXTAUTH_SECRET = random_password.nextauth_secret.result
    ADMIN_EMAIL     = var.admin_email
    ADMIN_PASSWORD  = var.admin_password
  })
}

# IAM Policy for ECS Task Role to access Secrets
resource "aws_iam_role_policy" "secrets_access" {
  name = "${var.project_name}-secrets-access"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["secretsmanager:GetSecretValue"]
        Effect   = "Allow"
        Resource = [aws_secretsmanager_secret.app_secrets.arn]
      }
    ]
  })
}

# AWS Backup — daily only (cost-optimized)
resource "aws_backup_vault" "main" {
  name = "${var.project_name}-backup-vault"
}

resource "aws_backup_plan" "daily" {
  name = "${var.project_name}-daily-backup"

  rule {
    rule_name         = "DailyBackup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 5 * * ? *)"
    lifecycle {
      delete_after = 7
    }
  }
}

resource "aws_iam_role" "backup_role" {
  name = "${var.project_name}-backup-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "backup_role_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup_role.name
}

resource "aws_backup_selection" "rds" {
  iam_role_arn = aws_iam_role.backup_role.arn
  name         = "${var.project_name}-backup-selection"
  plan_id      = aws_backup_plan.daily.id

  resources = [
    aws_db_instance.default.arn
  ]
}
