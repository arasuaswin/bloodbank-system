# BloodBank Management System

A full-stack blood bank management system built with Next.js, Prisma, and MySQL.

## Tech Stack

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** MySQL
- **Authentication:** NextAuth.js v5 (Credentials provider)
- **Email:** AWS SES
- **Deployment:** Docker, Terraform (AWS)

## Features

### Public
- Blood availability search with real-time stock display
- Blood request submission
- Donor registration (Immediate signup)
- Recipient registration

### Admin Portal
- Dashboard with key statistics and blood stock chart
- Donor management (view, delete)
- Blood stock management (add, subtract, set quantities)
- Blood request approval/rejection (with stock deduction)
- Appointment management (approve, reject, mark complete)
- Recipient management

### Donor Portal
- Personal dashboard with eligibility and donation stats
- Appointment booking and history tracking
- Profile management (contact info, health details)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 20+
- MySQL database

### Setup Steps
1. Clone the repository and navigate to the Next.js directory:
   ```bash
   git clone https://github.com/<your-username>/Bloodbank-management-system.git
   cd Bloodbank-management-system/bloodbank-next
   ```
2. Copy the environment file and configure your database and secrets:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Push the database schema and seed default data:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### Local Production Build (Windows)
If you want to test the fully compiled production version of the application locally, you can use the included `deploy.bat` script inside the Next.js directory:

```cmd
cd bloodbank-next
deploy.bat
```
This script will automatically generate the Prisma client, push your database schema, run the Next.js production compiler, and start the application on `http://localhost:3000`.

---

## ☁️ AWS Architecture & Deployment Guide

This project includes production-ready **Terraform Configuration** to deploy the entire stack to AWS in minutes. 

### AWS Architecture Overview

```mermaid
graph TD
    %% Define Styles
    classDef aws fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:white;
    classDef vpc fill:#F3F3F3,stroke:#3F8624,stroke-width:2px,stroke-dasharray: 5 5;
    classDef public fill:#E6F0FA,stroke:#0052CC,stroke-width:1px;
    classDef private fill:#FAD7E1,stroke:#E0004D,stroke-width:1px;
    classDef cicd fill:#F9F9F9,stroke:#5A6B86,stroke-width:2px,stroke-dasharray: 5 5;

    User([👤 End User]) -->|HTTPS| CF[🌐 AWS CloudFront]
    
    %% Main VPC Architecture
    subgraph VPC ["☁️ AWS Virtual Private Cloud (VPC)"]
        direction TB
        IGW[🚪 Internet Gateway]
        
        %% Public Tier
        subgraph PublicSubnets ["🌐 Public Subnets (AZ-a / AZ-b)"]
            ALB[⚖️ Application Load Balancer]
            NAT[🔄 NAT Gateway]
            ECS[🐳 Amazon ECS<br>Fargate & Spot Instances]
        end
        
        %% Private Tier
        subgraph PrivateSubnets ["🔒 Private Subnets (AZ-a / AZ-b)"]
            RDS[(🗄️ Amazon RDS MySQL 8.0)]
        end
        
        %% Network flow
        IGW --- PublicSubnets
        ALB -->|Port 3000| ECS
        ECS -->|Outbound Web/Updates| NAT
        NAT --> IGW
        ECS -->|Port 3306| RDS
    end

    %% External Connections from VPC
    CF -->|HTTP/HTTPS| ALB
    ECS -->|API via NAT| SES[📧 Amazon SES]
    
    %% CI/CD Setup
    subgraph CICD ["⚙️ CI/CD & Security"]
        direction LR
        GH[(🐙 GitHub Repo)] -.->|Webhook| CP[🛣️ AWS CodePipeline]
        CP -.-> CB[🛠️ AWS CodeBuild]
        CB -.->|Builds & Pushes| ECR[📦 Amazon ECR]
        CB -.->|Triggers Update| ECS
        
        SM[🔑 AWS Secrets Manager] -.->|Injects DB/Auth Secrets| ECS
        KMS[🗝️ AWS KMS] -.->|Encrypts| RDS
        KMS -.->|Encrypts| ECR
    end
    
    %% Apply Styles
    class CF,ALB,ECS,RDS,NAT,IGW,SES,CP,CB,ECR,SM,KMS aws;
    class VPC vpc;
    class PublicSubnets public;
    class PrivateSubnets private;
    class CICD cicd;
```

### CI/CD Practices (Continuous Integration & Deployment)
This repository leverages advanced DevOps methodologies to ensure seamless updates with zero downtime:
* **Fully Automated Pipeline**: Built using AWS CodePipeline. Pushing changes to the `main` GitHub branch automatically triggers a build.
* **Build Phase**: AWS CodeBuild creates a Docker container, compiles the Next.js app, and pushes the optimized image to Amazon ECR.
* **Zero-Downtime Rolling Updates**: AWS ECS gracefully rolls out new container instances and drains old ones only when the new instances pass ALB health checks.
* **Circuit Breaker Rollbacks**: If a bad deployment occurs (e.g., application crashes on start), ECS automatically halts the deployment and rolls back to the previous stable version.
* **Secure Secret Injection**: No passwords are kept in code or environment files on the server. AWS Secrets Manager injects credentials securely into the ECS task at runtime.

### Containerization & Application Performance
This project has been heavily optimized for cloud environments, significantly reducing AWS networking costs and startup latency:
1. **Next.js Standalone Output**: The Next.js configuration (`output: "standalone"`) automatically traces imports and bundles only the necessary node_modules. This shrinks the Docker image size by over **80%**, drastically reducing ECR storage costs and accelerating ECS deployment times.
2. **Multi-Stage Docker Builds**: The `Dockerfile` separates dependency installation (`deps`), compilation (`builder`), and execution (`runner`). The final production image discards the heavy compilation toolchains entirely.
3. **Least Privilege Execution**: The Docker container refuses to run as root. It creates a dedicated unprivileged `nextjs` user (`uid 1001`), completely nullifying entire classes of container escape vulnerabilities.
4. **Auto-Migration Script**: Database schema pushing is not an afterthought. The container spins up executing `start.js`, which detects if the Prisma database is in sync with the application code and automatically triggers migrations *before* booting the listener.

### Step-by-Step AWS Setup for forkers

If you have forked this repository and want to host it on your own AWS account, follow these steps strictly:

#### 1. Setup Deployment Variables
All passwords and sensitive tokens are managed via Terraform variables and injected into AWS Secrets Manager. 

Navigate to the terraform directory:
```bash
cd terraform
```
Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```
**Open `terraform.tfvars` and fill it out completely.** 
* Set strong passwords for `db_password` (min 12 chars), `admin_password` (min 8 chars), and `nextauth_secret` (generate one using `openssl rand -base64 32`).
* Provide your GitHub repository string (e.g., `YourUsername/bloodbank-management-system`).

> ⚠️ **Note:** `terraform.tfvars` is intentionally included in `.gitignore` so your secrets are never accidentally pushed to GitHub.

#### 2. Deploy Infrastructure
We have provided comprehensive PowerShell scripts that completely automate the provisioning, Docker building, database pushing, and AWS deployments natively for Windows machines. 

Open a PowerShell terminal as Administrator, authenticate with your AWS CLI locally, and run:

```powershell
.\deploy_aws.ps1
```
This single script will:
- Check for all prerequisite tools (Docker, AWS CLI, Terraform)
- Run `terraform init` and `terraform apply` for you
- Build the Next.js Docker image and push it to Amazon ECR
- Attempt to automate Prisma database schema pushing
- Force-deploy the latest container onto your ECS cluster

#### 3. Connect GitHub to AWS CodePipeline
Because your AWS account needs permission to read your public GitHub repository during automated builds, Terraform creates a pending connection.

1. Log into your **AWS Console**.
2. Navigate to **Developer Tools** ➡️ **Settings** ➡️ **Connections**.
3. You will see a connection named `bloodbank-gms-github-connection` in a `Pending` state.
4. Click on it and choose **Update pending connection**.
5. Follow the prompts to authorize AWS to access your GitHub repositories.

#### 4. Future Deployments & CI/CD
Once the GitHub connection is active and your first Fargate instances are live:
* **To push a new update**: Simply commit your changes to the `main` branch of your GitHub repository. AWS CodePipeline will automatically fetch the new code, rebuild the Docker image, and perform a rolling update natively.

---

## 🗑️ Tearing Down Infrastructure

If you wish to completely destroy the AWS infrastructure to stop incurring costs, simply run the included undeploy script from a PowerShell window:

```powershell
.\undeploy_aws.ps1
```
This script will empty the S3 artifact buckets and safely run `terraform destroy` to remove all AWS resources.

---

## Default Admin Credentials
- **Email:** admin@bloodbank.com
- **Password:** The password you defined as `admin_password` in `terraform.tfvars`

## License
This project is for educational purposes.
