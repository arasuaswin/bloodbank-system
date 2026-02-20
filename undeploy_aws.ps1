
# ============================================================
#  BloodBank Management System — ONE-COMMAND AWS TEARDOWN
# ============================================================
# This will DESTROY all AWS resources and stop billing.
# Usage:   .\undeploy_aws.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "==========================================" -ForegroundColor Red
Write-Host "  BloodBank — AWS TEARDOWN (UNDEPLOY)" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""
Write-Host "  WARNING: This will DESTROY all AWS resources:" -ForegroundColor Yellow
Write-Host "    - ECS Service & Tasks" -ForegroundColor Yellow
Write-Host "    - RDS Database (final snapshot will be saved)" -ForegroundColor Yellow
Write-Host "    - ALB, CloudFront, NAT Gateway" -ForegroundColor Yellow
Write-Host "    - ECR Repository & Docker Images" -ForegroundColor Yellow
Write-Host "    - All networking (VPC, subnets, etc.)" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type 'DESTROY' to confirm teardown"
if ($confirm -ne "DESTROY") {
    Write-Host "Aborted. No resources were destroyed." -ForegroundColor Green
    exit 0
}

Write-Host ""

# --- Step 1: Disable RDS deletion protection ---
Write-Host "[1/3] Disabling RDS deletion protection..." -ForegroundColor Yellow
Set-Location -Path "$ROOT\terraform"

$DB_ID = $(terraform output -raw rds_endpoint 2>$null) -replace '\..*$', ''
if ($DB_ID) {
    try {
        $REGION = "ap-south-1"
        aws rds modify-db-instance --db-instance-identifier "bloodbank-gms-db" --no-deletion-protection --apply-immediately --region $REGION 2>$null | Out-Null
        Write-Host "  Deletion protection disabled." -ForegroundColor Green
        Start-Sleep -Seconds 5
    }
    catch {
        Write-Host "  Could not disable deletion protection (may already be off)." -ForegroundColor Gray
    }
}

# --- Step 2: Terraform Destroy ---
Write-Host "`n[2/3] Destroying all AWS resources..." -ForegroundColor Yellow
terraform destroy -auto-approve

# --- Step 3: Cleanup ---
Write-Host "`n[3/3] Cleaning up local state..." -ForegroundColor Yellow
# Optionally remove .terraform directory
# Remove-Item -Recurse -Force ".terraform" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  TEARDOWN COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  All AWS resources have been destroyed." -ForegroundColor White
Write-Host "  A final RDS snapshot was saved." -ForegroundColor Gray
Write-Host "  Billing will stop within the hour." -ForegroundColor Gray
Write-Host ""

Set-Location -Path $ROOT
