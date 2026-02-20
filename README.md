# 🩸 Cloud-Native BloodBank Management System

A production-ready, NBTC/ICMR-compliant blood bank management system built with **Next.js 16**, **Prisma**, and **MySQL**. Engineered with enterprise-grade **AWS Cloud Architecture**, **DevSecOps**, and fully automated **CI/CD pipelines**. Features realistic India-specific workflows including donor eligibility screening, urgency-based blood requests, hospital/doctor tracking, and Aadhaar-based identity verification.

---

## ✨ Key Highlights

| Category | Details |
|----------|---------|
| **Tech** | Next.js 16 + React 19 + TypeScript + Prisma ORM + MySQL |
| **Styling** | Tailwind CSS + shadcn/ui + Framer Motion animations |
| **Auth** | NextAuth.js v5 (role-based: Admin / Donor) |
| **Cloud** | 15+ AWS services, IaC with Terraform, Docker containerized |
| **Compliance** | NBTC (National Blood Transfusion Council) & ICMR guidelines |
| **Deployment** | One-command deploy (`.\deploy_aws.ps1`) to production AWS |

---

## 📋 Features

### 🌐 Public Pages
- **Home Page** — Hero section with blood availability cards, real-time stock levels for all 8 blood groups (A+, A−, B+, B−, AB+, AB−, O+, O−), quick-action buttons
- **Blood Availability Search** — Search by blood group with live stock count and compatibility info
- **Donor Registration** — Full NBTC-compliant form:
  - Personal details with Indian state dropdown (36 states/UTs)
  - Aadhaar last-4-digit verification (NBTC identity compliance)
  - Blood group, age (18–65), weight (≥45 kg) eligibility checks
  - Donation type preference (Whole Blood / Platelets / Plasma)
  - Health screening: Haemoglobin, Blood Sugar, Blood Pressure with clinical ranges
  - Medical history disclosure (HIV/Hepatitis/Malaria flagging)
  - NBTC eligibility summary panel with donation interval info
- **Recipient Registration** — Hospital-integrated form:
  - Hospital name, attending doctor, patient address
  - Urgency level: 🟢 Normal (48 hrs) / 🟡 Urgent (12 hrs) / 🔴 Critical (immediate)
  - Purpose tracking: Surgery / Accident / Thalassemia / Cancer / Pregnancy / Dengue / Anaemia
  - Critical urgency warning with NBTC toll-free helpline (104 / 1800-180-1104)
  - Auto-generated Recipient ID for future blood requests
- **Blood Request Form** — Urgency-aware request system:
  - Blood group compatibility info displayed per selection
  - Quantity in units (1 unit = 350–450 ml per NBTC standard)
  - Urgency selector with colored badges
  - Hospital and purpose fields
  - Links to NBTC helpline for critical emergencies
- **Eligibility Checker** — Interactive NBTC eligibility questionnaire
- **Login** — Role-based authentication (Admin vs Donor)

### 🛡️ Admin Portal (`/admin/*`)
- **Dashboard** — Key statistics cards (total donors, recipients, requests, stock), blood stock chart visualization
- **Donor Management** — View all donors with state, donation type, lifetime units donated; delete capability
- **Blood Requests** — Enhanced request management:
  - Urgency badges: 🔴 Critical / 🟡 Urgent / 🟢 Normal
  - Status tracking: ⏳ Pending / ✅ Approved / ❌ Rejected (audit trail — no deletion)
  - Hospital, purpose, and recipient ID columns
  - Search by name, blood group, hospital
  - Filter by urgency level and status
  - Critical request count with animated alert badge
  - Approve (auto-deducts stock) / Reject with detailed feedback
- **Blood Stock Management** — Visual stock control:
  - Summary cards: Total Units, Critical (≤3), Low (≤8), OK
  - Color-coded rows: 🔴 red (critical), 🟠 orange (low), white (OK)
  - NBTC shelf-life reference panel (Whole Blood: 35 days, Platelets: 5 days, Plasma: 1 year, PRBCs: 42 days)
  - Volume display (approximate litres at 450 ml/unit)
  - Quick +1/+5/−1 buttons and custom quantity input per blood group
- **Recipient Management** — Full recipient registry:
  - Hospital, doctor, urgency, purpose columns
  - Search by name, phone, hospital, blood group
  - Urgency filter (All / Critical / Urgent / Normal)
  - Critical patient highlighting
- **Appointment Management** — Approve/reject/complete donor appointments with email notifications

### 🩸 Donor Portal (`/donor/*`)
- **Dashboard** — Personal eligibility status, donation stats, blood group card, next eligible donation date
- **Appointment Booking** — Enhanced booking:
  - Calendar date picker (future dates only)
  - Donation type selector: 🩸 Whole Blood / 🔬 Platelets (SDP/RDP) / 💉 Plasma (FFP)
  - Units selector (1–3 for platelets, 1 for whole blood)
  - NBTC donation interval info: 90 days (Whole Blood), 14 days (Platelets), 48 hours (Plasma)
  - Appointment history with donation type, units, admin notes, and status badges
- **Profile Management** — Edit phone, address, weight, diseases, blood group (name/email locked)

### 📧 Email Notifications (AWS SES)
- Appointment approval/rejection emails to donors
- Urgency-labeled blood request alerts to admin (🔴 CRITICAL / 🟡 URGENT / 🟢 Normal)
- Email templates with professional formatting

---

## 🏗️ Project Structure

```
bloodbank-system/
├── deploy_aws.ps1              # One-command AWS deployment script
├── undeploy_aws.ps1            # Complete AWS teardown (7-step cleanup)
├── README.md
│
├── bloodbank-next/             # Next.js Application
│   ├── app/
│   │   ├── page.tsx            # Home page (hero + blood stock)
│   │   ├── login/              # Authentication page
│   │   ├── register/           # Donor registration (NBTC-compliant)
│   │   ├── search/             # Blood availability search
│   │   ├── request/            # Blood request form
│   │   ├── eligibility/        # NBTC eligibility checker
│   │   ├── recipient/
│   │   │   └── register/       # Recipient registration
│   │   ├── admin/
│   │   │   ├── page.tsx        # Admin dashboard
│   │   │   ├── donors/         # Donor management
│   │   │   ├── requests/       # Blood request management
│   │   │   ├── stock/          # Blood stock management
│   │   │   ├── recipients/     # Recipient management
│   │   │   └── appointments/   # Appointment management
│   │   ├── donor/
│   │   │   ├── page.tsx        # Donor dashboard
│   │   │   ├── appointments/   # Appointment booking
│   │   │   └── profile/        # Profile management
│   │   └── api/                # Next.js API Routes
│   │       ├── donors/         # Donor CRUD
│   │       ├── recipient/      # Recipient CRUD
│   │       ├── requests/       # Blood request CRUD + approval
│   │       ├── appointments/   # Appointment CRUD
│   │       ├── stock/          # Blood stock management
│   │       ├── admin/          # Admin stats + donation completion
│   │       └── auth/           # NextAuth.js authentication
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (8 models)
│   │   └── seed.js             # Realistic Indian seed data
│   ├── lib/                    # Utilities (prisma client, email, auth)
│   ├── components/             # shadcn/ui components
│   ├── Dockerfile              # Multi-stage Docker build
│   ├── start.js                # Container startup (migration + seed + server)
│   └── next.config.ts          # Next.js config (standalone output)
│
└── terraform/                  # Infrastructure as Code
    ├── main.tf                 # VPC, Subnets, NAT, Internet Gateway
    ├── ecs.tf                  # ECS Fargate cluster + auto-scaling
    ├── rds.tf                  # RDS MySQL 8.0
    ├── alb.tf                  # Application Load Balancer
    ├── cloudfront.tf           # CDN distribution
    ├── cicd.tf                 # CodePipeline + CodeBuild + ECR
    ├── security.tf             # Security groups + Secrets Manager
    ├── monitoring.tf           # CloudWatch alarms + SNS alerts
    ├── kms.tf                  # Encryption keys
    ├── ses.tf                  # Email service
    ├── iam_task_role.tf        # IAM roles
    ├── variables.tf            # Configuration variables
    ├── outputs.tf              # Terraform outputs
    └── terraform.tfvars.example # Template for secrets
```

---

## 🗃️ Database Schema

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **donor** | name, age, sex, phone, blood group, email, state, aadhaar (last 4), donation type, weight, health records, eligibility, units donated | Donor registry with NBTC-compliant fields |
| **recipient** | name, age, sex, phone, blood group, hospital, doctor, urgency, purpose, address | Patient registry with hospital tracking |
| **blood_request** | recipient ref, blood group, quantity, urgency, purpose, hospital, status (PENDING/APPROVED/REJECTED) | Request lifecycle with audit trail |
| **blood_stock** | blood group, quantity | Real-time inventory per blood group |
| **appointment** | donor ref, date, status, donation type, units, admin notes | Donation scheduling system |
| **users** | name, email, phone, password | Admin authentication |

### Seed Data
The database is pre-populated with realistic Indian data:
- **15 Donors** — Real Indian names from Tamil Nadu, Karnataka, Kerala, Telangana, Delhi, Maharashtra with valid phone patterns and diverse blood groups
- **8 Recipients** — Registered at major hospitals: Apollo Chennai, CMC Vellore, AIIMS Delhi, JIPMER Puducherry, Fortis Bengaluru, Stanley Chennai, Manipal Chennai, Kauvery Trichy
- **Blood Stock** — Realistic distribution matching India's blood group population: O+ (24 units), B+ (20), A+ (18), AB+ (8), O− (5), B− (4), A− (3), AB− (2)
- **Sample Blood Requests** — With varied urgency levels

---

## 🩺 NBTC/ICMR Compliance Features

This system follows guidelines from the **National Blood Transfusion Council (NBTC)** and **Indian Council of Medical Research (ICMR)**:

| Guideline | Implementation |
|-----------|---------------|
| **Donor Age** | 18–65 years (enforced in registration form) |
| **Donor Weight** | ≥45 kg minimum (validated) |
| **Haemoglobin** | ≥12.5 g/dL required for eligibility |
| **Blood Pressure** | Systolic 100–140, Diastolic 60–90 mmHg |
| **Donation Intervals** | Whole Blood: 90 days, Platelets: 14 days, Plasma: 48 hours |
| **Unit Volume** | 1 unit = 350–450 ml (displayed in forms) |
| **Component Types** | Whole Blood, Platelets (SDP/RDP), Plasma (FFP) |
| **Shelf Life** | Whole Blood: 35 days, Platelets: 5 days, FFP: 1 year, PRBCs: 42 days |
| **Identity Verification** | Aadhaar last-4-digit tracking |
| **Disease Screening** | HIV, Hepatitis B/C, Malaria history flagging |
| **Emergency Helpline** | 104 (NBTC) / 1800-180-1104 shown for critical requests |

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js** 20+ 
- **MySQL** database (local or remote)
- **npm** (comes with Node.js)

### Setup Steps

1. **Clone and navigate:**
   ```bash
   git clone https://github.com/arasuaswin/bloodbank-system.git
   cd bloodbank-system/bloodbank-next
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your MySQL connection string:
   ```
   DATABASE_URL="mysql://root:your_password@127.0.0.1:3306/bloodmg"
   NEXTAUTH_SECRET="any-random-string-for-local-dev"
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Setup database:**
   ```bash
   npx prisma db push        # Creates all tables
   node prisma/seed.js        # Seeds admin user + 15 donors + 8 recipients + stock
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Default Credentials (Local)
| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@bloodbank.com | Admin@123 |
| **Donor** | rajan.kumar@gmail.com (or any seeded donor) | Donor@123 |

### Local Production Build (Windows)
```cmd
cd bloodbank-next
deploy.bat
```
This compiles the production build and starts the server on `http://localhost:3000`.

---

## ☁️ AWS Architecture & Deployment

### Architecture Overview

```mermaid
graph TD
    classDef aws fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:white;
    classDef vpc fill:#F3F3F3,stroke:#3F8624,stroke-width:2px,stroke-dasharray: 5 5;
    classDef public fill:#E6F0FA,stroke:#0052CC,stroke-width:1px;
    classDef private fill:#FAD7E1,stroke:#E0004D,stroke-width:1px;
    classDef cicd fill:#F9F9F9,stroke:#5A6B86,stroke-width:2px,stroke-dasharray: 5 5;

    User([👤 End User]) -->|HTTPS| CF[🌐 AWS CloudFront]
    
    subgraph VPC ["☁️ AWS Virtual Private Cloud (VPC)"]
        direction TB
        IGW[🚪 Internet Gateway]
        
        subgraph PublicSubnets ["🌐 Public Subnets (AZ-a / AZ-b)"]
            ALB[⚖️ Application Load Balancer]
            NAT[🔄 NAT Gateway]
            ECS[🐳 Amazon ECS<br>Fargate & Spot Instances]
        end
        
        subgraph PrivateSubnets ["🔒 Private Subnets (AZ-a / AZ-b)"]
            RDS[(🗄️ Amazon RDS MySQL 8.0)]
        end
        
        IGW --- PublicSubnets
        ALB -->|Port 3000| ECS
        ECS -->|Outbound Web/Updates| NAT
        NAT --> IGW
        ECS -->|Port 3306| RDS
    end

    CF -->|HTTP/HTTPS| ALB
    ECS -->|API via NAT| SES[📧 Amazon SES]
    
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
    
    class CF,ALB,ECS,RDS,NAT,IGW,SES,CP,CB,ECR,SM,KMS aws;
    class VPC vpc;
    class PublicSubnets public;
    class PrivateSubnets private;
    class CICD cicd;
```

### AWS Services Used (15+)

| Category | Services |
|----------|----------|
| **Compute** | ECS Fargate (Spot), CodeBuild |
| **Networking** | VPC, ALB, CloudFront CDN, NAT Gateway, Internet Gateway |
| **Database** | RDS MySQL 8.0 |
| **Storage** | ECR (Docker images), S3 (CI/CD artifacts) |
| **Security** | Secrets Manager, KMS, IAM, Security Groups |
| **CI/CD** | CodePipeline, CodeBuild, CodeStar Connections |
| **Monitoring** | CloudWatch (Logs + Alarms), SNS (Email alerts) |
| **Communication** | SES (Transactional emails) |

### Estimated Monthly Cost: ~$65–75/month

| Service | Specification | Est. Cost |
|---------|--------------|-----------|
| NAT Gateway | 1 shared across all subnets | ~$32 |
| ALB | 1 ALB + minimal LCU usage | ~$16 |
| RDS MySQL | `db.t3.micro` + 20GB gp3 | ~$13 |
| ECS Fargate Spot | 1–4 tasks (0.25 vCPU, 0.5GB) | ~$3–5 |
| CloudFront, KMS, SES, SM | Pay-per-use / Free Tier | ~$1–4 |

### Security & Compliance

- **Zero-Trust Architecture** — RDS in private subnets, no public IP
- **Encryption at Rest** — KMS-managed keys for RDS and ECR
- **Encryption in Transit** — HTTPS enforced via CloudFront + ALB
- **Least Privilege** — Docker runs as unprivileged user (uid 1001); IAM roles scoped to minimum permissions
- **No Hardcoded Secrets** — All credentials via AWS Secrets Manager
- **Container Security** — Multi-stage Docker build, vulnerability scanning on ECR push
- **Circuit Breaker Rollbacks** — ECS auto-rolls back failed deployments

---

## 🚀 AWS Deployment Guide

> ⚠️ **IMPORTANT: Fork Required!**  
> The `deploy_aws.ps1` script configures AWS CodePipeline to automatically pull code from **your GitHub repository** on every push to `main`. This means:  
> 1. You **MUST fork** this repository to your own GitHub account first  
> 2. Update the `github_repo` value in `terraform/terraform.tfvars` to point to your fork (e.g., `your-username/bloodbank-system`)  
> 3. The CI/CD pipeline will connect to **your fork**, not the original repo  
>  
> **Without forking, the deploy script will fail** because AWS CodePipeline needs read access to a repository you own.

### Prerequisites
- **AWS Account** with billing enabled
- **AWS CLI** installed and configured (`aws configure`)
- **Terraform** installed ([terraform.io](https://terraform.io))
- **Docker Desktop** installed and running
- **Git** with your fork cloned locally

### Step 1: Fork & Clone
```bash
# Fork this repo on GitHub first, then:
git clone https://github.com/YOUR-USERNAME/bloodbank-system.git
cd bloodbank-system
```

### Step 2: Configure Variables
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:
```hcl
db_password        = "YourStrongDBPassword123!"    # Min 12 chars
admin_password     = "YourAdminPassword@123"        # Min 8 chars  
nextauth_secret    = "run: openssl rand -base64 32" # Random string
notification_email = "your-email@gmail.com"         # For alerts
github_repo        = "YOUR-USERNAME/bloodbank-system" # YOUR fork!
github_branch      = "main"
```

> ⚠️ `terraform.tfvars` is in `.gitignore` — your secrets will never be pushed to GitHub.

### Step 3: Deploy (One Command)
```powershell
.\deploy_aws.ps1
```

This single script will:
1. ✅ Check prerequisites (Docker, AWS CLI, Terraform)
2. ✅ Provision all AWS infrastructure via Terraform
3. ✅ Activate GitHub ↔ AWS CodePipeline connection (one-time)
4. ✅ Build the Docker image locally
5. ✅ Push to Amazon ECR
6. ✅ Run database migrations (Prisma)
7. ✅ Force-deploy to ECS Fargate

### Step 4: Post-Deployment
1. **Verify Email** — AWS sends 2 emails to your `notification_email`:
   - SNS Subscription Confirmation (for CloudWatch alerts)
   - SES Verification (for sending transactional emails)
   - **Click both links!**

2. **Activate GitHub Connection** (if prompted):
   - Go to AWS Console → Developer Tools → Settings → Connections
   - Click `bloodbank-gms-github-connection` → Update pending connection
   - Authorize GitHub access

3. **Access Your App:**
   - URL is displayed at the end of the deploy script
   - Format: `https://xxxxxx.cloudfront.net`

### Future Deployments
Once the initial setup is complete, just push to your `main` branch:
```bash
git add -A && git commit -m "your changes" && git push origin main
```
AWS CodePipeline automatically builds, pushes, and deploys with zero downtime.

---

## 🗑️ Teardown (Complete AWS Cleanup)

```powershell
.\undeploy_aws.ps1
```

Type `DESTROY` when prompted. This comprehensive 7-step script will:
1. Disable RDS deletion protection
2. Run `terraform destroy`
3. Force-delete RDS if Terraform missed it
4. Delete ALL RDS snapshots (manual + automated)
5. Delete CloudWatch Log Groups
6. Delete ECR repository
7. Clean up leftover VPC resources (subnets, IGWs, security groups, route tables)

**Nothing is left behind. Billing drops to $0.**

---

## 🔧 Tech Stack Details

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Next.js (App Router) | 16.x |
| **UI Framework** | React | 19.x |
| **Language** | TypeScript | 5.x |
| **CSS** | Tailwind CSS | 4.x |
| **Components** | shadcn/ui | Latest |
| **Animations** | Framer Motion | 12.x |
| **ORM** | Prisma | 5.22.x |
| **Database** | MySQL | 8.0 |
| **Auth** | NextAuth.js | 5.x (beta) |
| **Validation** | Zod | 3.x |
| **Charts** | Recharts | 2.x |
| **Icons** | Lucide React | Latest |
| **Containerization** | Docker (multi-stage) | — |
| **IaC** | Terraform | 1.x |
| **Cloud** | AWS (15+ services) | — |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational and portfolio purposes. Built as a demonstration of full-stack development with cloud-native architecture, DevSecOps practices, and India-specific healthcare compliance.

---

## 👤 Author

**Arasu Aswin** — [GitHub](https://github.com/arasuaswin)
