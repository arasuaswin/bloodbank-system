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
- Donor registration with email OTP verification
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

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL database

### Setup

1. Clone the repository
2. Navigate to the project:
   ```bash
   cd miniproject_dbms/bloodbank-next
   ```
3. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Push the database schema:
   ```bash
   npx prisma db push
   ```
6. Seed the database:
   ```bash
   node prisma/seed.js
   ```
7. Start the development server:
   ```bash
   npm run dev
   ```

### Default Admin Credentials
- **Email:** admin@bloodbank.com
- **Password:** Admin@123

> ⚠️ Change these credentials immediately in production.

## Project Structure

```
bloodbank-next/
├── app/
│   ├── admin/          # Admin portal pages
│   ├── donor/          # Donor portal pages
│   ├── api/            # API routes
│   ├── login/          # Login page
│   ├── register/       # Donor registration
│   ├── search/         # Blood availability search
│   ├── request/        # Blood request form
│   └── recipient/      # Recipient registration
├── components/         # Reusable UI components
├── lib/                # Utility functions
├── prisma/             # Database schema and seed
├── types/              # TypeScript type definitions
└── terraform/          # AWS deployment config
```

## Deployment

### Docker
```bash
docker build -t bloodbank .
docker run -p 3000:3000 --env-file .env bloodbank
```

### AWS (Terraform)
```bash
cd terraform
terraform init
terraform apply
```

## License

This project is for educational purposes.
