resource "aws_db_subnet_group" "default" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "default" {
  allocated_storage      = 20
  max_allocated_storage  = 100 # Auto-scaling storage
  storage_type           = "gp3" # 20% cheaper than gp2, 3000 IOPS baseline
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  identifier             = "${var.project_name}-db"
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  parameter_group_name   = "default.mysql8.0"
  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.db.id]
  multi_az               = false # Single-AZ saves ~$12/mo (enable for prod HA)
  publicly_accessible    = false
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.main.arn

  # Backup & Recovery
  backup_retention_period   = 7
  backup_window             = "03:00-04:00"
  maintenance_window        = "sun:04:00-sun:05:00"
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-final-snapshot"
  copy_tags_to_snapshot     = true
  deletion_protection       = true

  # Performance Insights (FREE on db.t3.micro for 7 days)
  performance_insights_enabled          = false

  tags = {
    Name = "${var.project_name}-rds"
  }
}
