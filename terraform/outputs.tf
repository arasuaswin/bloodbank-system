output "alb_dns_name" {
  description = "DNS name of the Load Balancer"
  value       = aws_lb.main.dns_name
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for app code"
  value       = aws_s3_bucket.app_bucket.id
}

output "rds_endpoint" {
  description = "RDS Endpoint"
  value       = aws_db_instance.default.address
}

output "cloudfront_domain_name" {
  description = "CloudFront Domain Name (primary access URL)"
  value       = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "ecr_repository_url" {
  description = "ECR Repository URL"
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "ECS Cluster Name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS Service Name"
  value       = aws_ecs_service.app.name
}
