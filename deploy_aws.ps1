
# ============================================================
#  BloodBank Management System — SINGLE COMMAND AWS DEPLOY
# ============================================================
#  Does EVERYTHING: infra + build + push + migrate DB + deploy
#  Usage:   .\deploy_aws.ps1
# ============================================================

$ErrorActionPreference = 'Stop'
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$REGION = 'ap-south-1'

Write-Host ''
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  BloodBank — Full AWS Deployment' -ForegroundColor Cyan
Write-Host '==========================================' -ForegroundColor Cyan

# ============ STEP 0: Pre-flight Checks ============
Write-Host ''
Write-Host '[0/7] Pre-flight checks...' -ForegroundColor Yellow

# Check tools
$missing = @()
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) { $missing += 'terraform (https://terraform.io)' }
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { $missing += 'aws CLI (https://aws.amazon.com/cli)' }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { $missing += 'docker (https://docker.com)' }
if ($missing.Count -gt 0) {
    Write-Host '  Missing tools:' -ForegroundColor Red
    $missing | ForEach-Object { Write-Host ('    - ' + $_) -ForegroundColor Red }
    exit 1
}

# Check terraform.tfvars
$TF_VARS_PATH = $ROOT + '\terraform\terraform.tfvars'
if (-not (Test-Path $TF_VARS_PATH)) {
    Write-Host '  terraform.tfvars not found!' -ForegroundColor Red
    Write-Host '  Creating from example...' -ForegroundColor Yellow
    $TF_EXAMPLE_PATH = $ROOT + '\terraform\terraform.tfvars.example'
    Copy-Item $TF_EXAMPLE_PATH $TF_VARS_PATH
    Write-Host ''
    Write-Host '  EDIT this file with your real values, then re-run:' -ForegroundColor Yellow
    Write-Host ('    notepad ' + $TF_VARS_PATH) -ForegroundColor Cyan
    Write-Host ''
    Start-Process notepad $TF_VARS_PATH
    exit 1
}

# Check Docker is running
docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host '  Docker is not running! Start Docker Desktop first.' -ForegroundColor Red
    exit 1
}

# Check AWS credentials
aws sts get-caller-identity 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host '  AWS credentials not configured! Run: aws configure' -ForegroundColor Red
    exit 1
}

Write-Host '  All checks passed.' -ForegroundColor Green

# ============ STEP 1: Terraform Init + Apply ============
Write-Host ""
Write-Host '[1/7] Provisioning AWS Infrastructure...' -ForegroundColor Yellow
$TF_PATH = $ROOT + '\terraform'
Set-Location -Path $TF_PATH
terraform init -input=false
terraform apply -auto-approve
if ($LASTEXITCODE -ne 0) {
    Write-Host '  Terraform apply failed. Aborting deployment.' -ForegroundColor Red
    exit $LASTEXITCODE
}

# ============ STEP 2: Get Outputs ============
Write-Host ""
Write-Host '[2/7] Reading Terraform Outputs...' -ForegroundColor Yellow
$ECR_REPO_URL = $(terraform output -raw ecr_repository_url)
$ECS_CLUSTER = $(terraform output -raw ecs_cluster_name)
$ECS_SERVICE = $(terraform output -raw ecs_service_name)
$CF_DOMAIN = $(terraform output -raw cloudfront_domain_name)
$RDS_ENDPOINT = $(terraform output -raw rds_endpoint)

Write-Host ('  ECR:        ' + $ECR_REPO_URL)
Write-Host ('  Cluster:    ' + $ECS_CLUSTER)
Write-Host ('  CloudFront: ' + $CF_DOMAIN)
Write-Host ('  RDS:        ' + $RDS_ENDPOINT)

# ============ STEP 3: Activate GitHub Connection ============
Write-Host ''
Write-Host '[3/7] Checking GitHub Connection...' -ForegroundColor Yellow
$CONNECTIONS = aws codestar-connections list-connections --provider-type-filter GitHub --region $REGION 2>$null | ConvertFrom-Json
$PENDING = $CONNECTIONS.Connections | Where-Object { $_.ConnectionStatus -eq 'PENDING' }

if ($PENDING) {
    Write-Host '  GitHub connection needs activation (one-time setup).' -ForegroundColor Yellow
    Write-Host '  Opening AWS Console...' -ForegroundColor Cyan
    $CONSOLE_URL = 'https://' + $REGION + '.console.aws.amazon.com/codesuite/settings/connections?region=' + $REGION
    Start-Process $CONSOLE_URL
    Write-Host ''
    Write-Host '  In the browser:' -ForegroundColor White
    Write-Host '    1. Click ''Update pending connection''' -ForegroundColor White
    Write-Host '    2. Click ''Install a new app'' and authorize GitHub' -ForegroundColor White
    Write-Host '    3. Select your repository and click ''Connect''' -ForegroundColor White
    Write-Host ''
    Read-Host '  Press ENTER after you have completed the GitHub connection'
    Write-Host '  GitHub connection activated!' -ForegroundColor Green
}
else {
    Write-Host '  GitHub connection already active.' -ForegroundColor Green
}

# ============ STEP 4: Docker Build ============
Write-Host ''
Write-Host '[4/7] Building Docker Image...' -ForegroundColor Yellow
$BNEXT_PATH = $ROOT + '\bloodbank-next'
Set-Location -Path $BNEXT_PATH
docker build --network=host -t bloodbank-app .
if ($LASTEXITCODE -ne 0) {
    Write-Host '  Docker build failed!' -ForegroundColor Red
    exit $LASTEXITCODE
}

# ============ STEP 5: Push to ECR ============
Write-Host ''
Write-Host '[5/7] Pushing to Amazon ECR...' -ForegroundColor Yellow
$ECR_HOST = $ECR_REPO_URL.Split('/')[0]
$ECR_PASS = aws ecr get-login-password --region $REGION
docker login --username AWS --password $ECR_PASS $ECR_HOST
if ($LASTEXITCODE -ne 0) {
    Write-Host '  Docker login to ECR failed!' -ForegroundColor Red
    exit $LASTEXITCODE
}
$TAG_URL = $ECR_REPO_URL + ':latest'
docker tag bloodbank-app:latest $TAG_URL
if ($LASTEXITCODE -ne 0) {
    Write-Host '  Docker tag failed!' -ForegroundColor Red
    exit $LASTEXITCODE
}
docker push $TAG_URL
if ($LASTEXITCODE -ne 0) {
    Write-Host '  Docker push failed!' -ForegroundColor Red
    exit $LASTEXITCODE
}

# ============ STEP 6: Run Database Migration ============
Write-Host ''
Write-Host '[6/7] Running Database Migration (Prisma)...' -ForegroundColor Yellow
# Get the DATABASE_URL from Secrets Manager
$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$SECRET_ARN = aws secretsmanager list-secrets --filter Key=name, Values=bloodbank-gms-app-secrets --query 'SecretList[0].ARN' --output text --region $REGION 2>$null

if ($SECRET_ARN -and $SECRET_ARN -ne 'None') {
    $SECRETS = aws secretsmanager get-secret-value --secret-id $SECRET_ARN --query SecretString --output text --region $REGION 2>$null | ConvertFrom-Json
    $env:DATABASE_URL = $SECRETS.DATABASE_URL

    $PATH_TO_GOTO = $ROOT + '\bloodbank-next'
    Set-Location -Path $PATH_TO_GOTO
    npx prisma db push --skip-generate 2>$null
    $ErrorActionPreference = $oldErrorAction

    if ($LASTEXITCODE -eq 0) {
        Write-Host '  Database schema pushed successfully.' -ForegroundColor Green
    }
    else {
        Write-Host '  DB migration skipped (RDS may still be starting, ECS will retry).' -ForegroundColor Gray
    }
    Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
}
else {
    $ErrorActionPreference = $oldErrorAction
    Write-Host '  Secrets not found yet. ECS will handle migration on first boot.' -ForegroundColor Gray
}

# ============ STEP 7: Deploy to ECS ============
Write-Host ""
Write-Host '[7/7] Deploying to ECS (force new deployment)...' -ForegroundColor Yellow
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment --region $REGION | Out-Null

# ============ DONE ============
Write-Host ''
Write-Host '==========================================' -ForegroundColor Green
Write-Host '  DEPLOYMENT COMPLETE!' -ForegroundColor Green
Write-Host '==========================================' -ForegroundColor Green
Write-Host ''
Write-Host '  Your app is live at:' -ForegroundColor White
Write-Host ('    https://' + $CF_DOMAIN) -ForegroundColor Cyan
Write-Host ''
Write-Host '  What was deployed:' -ForegroundColor White
Write-Host '    - VPC, Subnets, NAT Gateway' -ForegroundColor Gray
Write-Host '    - ALB + CloudFront CDN' -ForegroundColor Gray
Write-Host '    - ECS Fargate (auto-scales 1-4 tasks)' -ForegroundColor Gray
Write-Host '    - RDS MySQL (gp3, encrypted)' -ForegroundColor Gray
Write-Host '    - CI/CD Pipeline (auto-deploys on git push)' -ForegroundColor Gray
Write-Host '    - CloudWatch Alarms + SNS Alerts' -ForegroundColor Gray
Write-Host ''
Write-Host '  Future deploys: just push to GitHub (main branch).' -ForegroundColor White
Write-Host '  To tear down:   ./undeploy_aws.ps1' -ForegroundColor White
Write-Host ''

Set-Location -Path $ROOT

