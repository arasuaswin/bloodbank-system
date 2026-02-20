resource "aws_ses_email_identity" "admin_email" {
  email = var.notification_email
}

# IAM Policy for App to Send Email
resource "aws_iam_role_policy" "ses_send_access" {
  name = "${var.project_name}-ses-send-access"
  role = aws_iam_role.ecs_task_role.id # Task Role needs this, not Execution Role

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Effect   = "Allow"
        Resource = "*" # Restrict to specific identity ARN in strict prod
      }
    ]
  })
}
