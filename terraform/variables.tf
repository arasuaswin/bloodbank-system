variable "aws_region" {
  description = "AWS Region"
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project Name"
  default     = "bloodbank-gms"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
  # Pass via: terraform apply -var="db_username=admin"
  # Or via terraform.tfvars (gitignored)
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  # Pass via: terraform apply -var="db_password=YourStrongP@ssw0rd!"
  # Or via terraform.tfvars (gitignored)

  validation {
    condition     = length(var.db_password) >= 12
    error_message = "DB password must be at least 12 characters."
  }
}

variable "db_name" {
  description = "Database Name"
  default     = "bloodmg"
}

variable "github_repo" {
  description = "GitHub Repository (user/repo)"
  type        = string
  # Pass via terraform.tfvars
}

variable "notification_email" {
  description = "Email for CloudWatch Alerts"
  type        = string
  # Pass via terraform.tfvars
}

variable "domain_name" {
  description = "Custom Domain Name (optional, leave empty for default CloudFront domain)"
  default     = ""
}

variable "admin_email" {
  description = "Initial admin account email"
  type        = string
  default     = "admin@bloodbank.com"
}

variable "admin_password" {
  description = "Initial admin account password"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.admin_password) >= 8
    error_message = "Admin password must be at least 8 characters."
  }
}
