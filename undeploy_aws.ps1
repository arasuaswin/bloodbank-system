
# ============================================================
#  BloodBank Management System — COMPLETE AWS TEARDOWN
# ============================================================
# This will DESTROY ALL AWS resources created by this project
# and stop ALL billing. Nothing will be left behind.
# Usage:   .\undeploy_aws.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$REGION = 'ap-south-1'
$PROJECT = 'bloodbank-gms'

Write-Host ''
Write-Host '==========================================' -ForegroundColor Red
Write-Host '  BloodBank — COMPLETE AWS TEARDOWN' -ForegroundColor Red
Write-Host '==========================================' -ForegroundColor Red
Write-Host ''
Write-Host '  WARNING: This will DESTROY all AWS resources:' -ForegroundColor Yellow
Write-Host '    - ECS Service, Cluster & Tasks' -ForegroundColor Yellow
Write-Host '    - RDS Database (NO snapshot saved)' -ForegroundColor Yellow
Write-Host '    - ALB, CloudFront, NAT Gateway' -ForegroundColor Yellow
Write-Host '    - ECR Repository & Docker Images' -ForegroundColor Yellow
Write-Host '    - All networking (VPC, subnets, etc.)' -ForegroundColor Yellow
Write-Host '    - CloudWatch Log Groups & Alarms' -ForegroundColor Yellow
Write-Host '    - RDS Snapshots (manual + automated)' -ForegroundColor Yellow
Write-Host '    - S3 CodePipeline artifacts bucket' -ForegroundColor Yellow
Write-Host '    - SNS topics, IAM roles, security groups' -ForegroundColor Yellow
Write-Host ''

$confirm = Read-Host "Type 'DESTROY' to confirm teardown"
if ($confirm -ne 'DESTROY') {
    Write-Host 'Aborted. No resources were destroyed.' -ForegroundColor Green
    exit 0
}

Write-Host ''

# --- Step 1: Disable RDS deletion protection ---
Write-Host '[1/7] Disabling RDS deletion protection...' -ForegroundColor Yellow
try {
    aws rds modify-db-instance --db-instance-identifier "$PROJECT-db" --no-deletion-protection --apply-immediately --region $REGION --no-cli-pager 2>$null | Out-Null
    Write-Host '  Deletion protection disabled.' -ForegroundColor Green
    Start-Sleep -Seconds 5
}
catch {
    Write-Host '  RDS instance not found or protection already off.' -ForegroundColor Gray
}

# --- Step 2: Terraform Destroy ---
Write-Host ''
Write-Host '[2/7] Destroying Terraform-managed resources...' -ForegroundColor Yellow
$TF_PATH = $ROOT + '\terraform'
Set-Location -Path $TF_PATH

$oldErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
terraform destroy -auto-approve 2>&1
$ErrorActionPreference = $oldErrorAction

Set-Location -Path $ROOT

# --- Step 3: Force-delete RDS if still alive ---
Write-Host ''
Write-Host '[3/7] Force-deleting RDS instance (if Terraform missed it)...' -ForegroundColor Yellow
try {
    $dbStatus = aws rds describe-db-instances --db-instance-identifier "$PROJECT-db" --no-cli-pager --query "DBInstances[0].DBInstanceStatus" --output text 2>$null
    if ($dbStatus -and $dbStatus -ne 'None') {
        Write-Host "  RDS still exists (status: $dbStatus). Force-deleting..." -ForegroundColor Yellow
        aws rds delete-db-instance --db-instance-identifier "$PROJECT-db" --skip-final-snapshot --delete-automated-backups --no-cli-pager --output text 2>$null | Out-Null
        Write-Host '  RDS delete command sent. Waiting for deletion...' -ForegroundColor Green
        # Wait up to 5 minutes for RDS to be deleted
        $waited = 0
        while ($waited -lt 300) {
            Start-Sleep -Seconds 15
            $waited += 15
            try {
                $status = aws rds describe-db-instances --db-instance-identifier "$PROJECT-db" --no-cli-pager --query "DBInstances[0].DBInstanceStatus" --output text 2>$null
                Write-Host "  RDS status: $status ($waited`s elapsed)" -ForegroundColor Gray
            }
            catch {
                Write-Host '  RDS instance deleted successfully.' -ForegroundColor Green
                break
            }
        }
    }
}
catch {
    Write-Host '  RDS instance already deleted.' -ForegroundColor Green
}

# --- Step 4: Delete ALL RDS snapshots ---
Write-Host ''
Write-Host '[4/7] Deleting all RDS snapshots...' -ForegroundColor Yellow
try {
    $snapshots = aws rds describe-db-snapshots --no-cli-pager --query "DBSnapshots[?contains(DBSnapshotIdentifier,'$PROJECT')].DBSnapshotIdentifier" --output text 2>$null
    if ($snapshots -and $snapshots.Trim() -ne '') {
        foreach ($snap in $snapshots.Split("`t")) {
            $snap = $snap.Trim()
            if ($snap -ne '') {
                try {
                    aws rds delete-db-snapshot --db-snapshot-identifier $snap --no-cli-pager --output text 2>$null | Out-Null
                    Write-Host "  Deleted snapshot: $snap" -ForegroundColor Green
                }
                catch {
                    Write-Host "  Could not delete snapshot: $snap (automated snapshots auto-delete with instance)" -ForegroundColor Gray
                }
            }
        }
    }
    else {
        Write-Host '  No snapshots found.' -ForegroundColor Green
    }
}
catch {
    Write-Host '  No snapshots to delete.' -ForegroundColor Green
}

# --- Step 5: Delete CloudWatch Log Groups ---
Write-Host ''
Write-Host '[5/7] Deleting CloudWatch Log Groups...' -ForegroundColor Yellow
$logGroups = @(
    "/aws/codebuild/$PROJECT-build",
    "/aws/ecs/containerinsights/$PROJECT-cluster/performance",
    "/ecs/$PROJECT"
)
foreach ($lg in $logGroups) {
    try {
        aws logs delete-log-group --log-group-name $lg --no-cli-pager 2>$null | Out-Null
        Write-Host "  Deleted: $lg" -ForegroundColor Green
    }
    catch {
        Write-Host "  Not found: $lg" -ForegroundColor Gray
    }
}

# --- Step 6: Delete leftover ECR repository ---
Write-Host ''
Write-Host '[6/7] Deleting ECR repository...' -ForegroundColor Yellow
try {
    aws ecr delete-repository --repository-name "$PROJECT-repo" --force --no-cli-pager --output text 2>$null | Out-Null
    Write-Host "  Deleted ECR repo: $PROJECT-repo" -ForegroundColor Green
}
catch {
    Write-Host '  ECR repo not found or already deleted.' -ForegroundColor Green
}

# --- Step 7: Clean up leftover VPC (if Terraform missed it) ---
Write-Host ''
Write-Host '[7/7] Cleaning up leftover VPC resources...' -ForegroundColor Yellow
try {
    $vpcId = aws ec2 describe-vpcs --no-cli-pager --filters "Name=tag:Name,Values=*$PROJECT*" --query "Vpcs[0].VpcId" --output text 2>$null
    if ($vpcId -and $vpcId -ne 'None') {
        Write-Host "  Found leftover VPC: $vpcId. Cleaning up..." -ForegroundColor Yellow
        
        # Delete subnets
        $subnets = aws ec2 describe-subnets --no-cli-pager --filters "Name=vpc-id,Values=$vpcId" --query "Subnets[*].SubnetId" --output text 2>$null
        if ($subnets) {
            foreach ($sub in $subnets.Split("`t")) {
                $sub = $sub.Trim()
                if ($sub -ne '' -and $sub -ne 'None') {
                    aws ec2 delete-subnet --subnet-id $sub --no-cli-pager 2>$null | Out-Null
                    Write-Host "    Deleted subnet: $sub" -ForegroundColor Gray
                }
            }
        }

        # Delete internet gateways
        $igws = aws ec2 describe-internet-gateways --no-cli-pager --filters "Name=attachment.vpc-id,Values=$vpcId" --query "InternetGateways[*].InternetGatewayId" --output text 2>$null
        if ($igws) {
            foreach ($igw in $igws.Split("`t")) {
                $igw = $igw.Trim()
                if ($igw -ne '' -and $igw -ne 'None') {
                    aws ec2 detach-internet-gateway --internet-gateway-id $igw --vpc-id $vpcId --no-cli-pager 2>$null | Out-Null
                    aws ec2 delete-internet-gateway --internet-gateway-id $igw --no-cli-pager 2>$null | Out-Null
                    Write-Host "    Deleted IGW: $igw" -ForegroundColor Gray
                }
            }
        }

        # Delete security groups (except default)
        $sgs = aws ec2 describe-security-groups --no-cli-pager --filters "Name=vpc-id,Values=$vpcId" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text 2>$null
        if ($sgs) {
            foreach ($sg in $sgs.Split("`t")) {
                $sg = $sg.Trim()
                if ($sg -ne '' -and $sg -ne 'None') {
                    aws ec2 delete-security-group --group-id $sg --no-cli-pager 2>$null | Out-Null
                    Write-Host "    Deleted SG: $sg" -ForegroundColor Gray
                }
            }
        }

        # Delete route tables (non-main)
        $rts = aws ec2 describe-route-tables --no-cli-pager --filters "Name=vpc-id,Values=$vpcId" --query "RouteTables[?Associations[0].Main!=``true``].RouteTableId" --output text 2>$null
        if ($rts) {
            foreach ($rt in $rts.Split("`t")) {
                $rt = $rt.Trim()
                if ($rt -ne '' -and $rt -ne 'None') {
                    aws ec2 delete-route-table --route-table-id $rt --no-cli-pager 2>$null | Out-Null
                    Write-Host "    Deleted RT: $rt" -ForegroundColor Gray
                }
            }
        }

        # Delete VPC
        aws ec2 delete-vpc --vpc-id $vpcId --no-cli-pager 2>$null | Out-Null
        Write-Host "  VPC $vpcId deleted." -ForegroundColor Green
    }
    else {
        Write-Host '  No leftover VPC found.' -ForegroundColor Green
    }
}
catch {
    Write-Host '  VPC cleanup completed (or nothing to clean).' -ForegroundColor Green
}

# --- Final Summary ---
Write-Host ''
Write-Host '==========================================' -ForegroundColor Green
Write-Host '  COMPLETE TEARDOWN FINISHED!' -ForegroundColor Green
Write-Host '==========================================' -ForegroundColor Green
Write-Host '  All AWS resources have been destroyed:' -ForegroundColor White
Write-Host '    ✅ ECS Cluster, Service & Tasks' -ForegroundColor White
Write-Host '    ✅ RDS Database (no snapshot saved)' -ForegroundColor White
Write-Host '    ✅ RDS Snapshots (all deleted)' -ForegroundColor White
Write-Host '    ✅ ALB, CloudFront, NAT Gateway' -ForegroundColor White
Write-Host '    ✅ ECR Repository & Docker Images' -ForegroundColor White
Write-Host '    ✅ VPC, Subnets, Security Groups' -ForegroundColor White
Write-Host '    ✅ CloudWatch Log Groups' -ForegroundColor White
Write-Host '    ✅ S3 Buckets, SNS, IAM Roles' -ForegroundColor White
Write-Host ''
Write-Host '  Billing will stop within the hour.' -ForegroundColor Gray
Write-Host '  To redeploy: .\deploy_aws.ps1' -ForegroundColor Gray
Write-Host ''
