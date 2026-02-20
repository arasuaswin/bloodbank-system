resource "aws_s3_bucket" "app_bucket" {
  bucket        = "${var.project_name}-code-${random_id.bucket_suffix.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_lifecycle_configuration" "app_bucket" {
  bucket = aws_s3_bucket.app_bucket.id

  rule {
    id     = "expire-old-code"
    status = "Enabled"

    expiration {
      days = 90
    }
  }
}
