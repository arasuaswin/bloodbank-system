const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// Realistic stock levels (India distribution: O+ ~37%, B+ ~32%, A+ ~22%)
const STOCK_LEVELS = {
    'O+': 24, 'O-': 5, 'B+': 20, 'B-': 4,
    'A+': 18, 'A-': 3, 'AB+': 8, 'AB-': 2,
}

const INDIAN_DONORS = [
    { D_name: 'Rajan Kumar', D_age: 28, D_sex: 'Male', D_phno: '9841234501', D_bgrp: 'O+', D_weight: 72, D_email: 'rajan.kumar@gmail.com', D_address: 'Anna Nagar, Chennai', D_state: 'Tamil Nadu', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 6 },
    { D_name: 'Priya Lakshmi', D_age: 25, D_sex: 'Female', D_phno: '9876543201', D_bgrp: 'A+', D_weight: 55, D_email: 'priya.lakshmi@gmail.com', D_address: 'Adyar, Chennai', D_state: 'Tamil Nadu', D_donation_type: 'Platelets', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 4 },
    { D_name: 'Mohammed Irfan', D_age: 32, D_sex: 'Male', D_phno: '9845678902', D_bgrp: 'B+', D_weight: 78, D_email: 'irfan.m@outlook.com', D_address: 'Koramangala, Bengaluru', D_state: 'Karnataka', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 12 },
    { D_name: 'Deepa Nair', D_age: 29, D_sex: 'Female', D_phno: '9123456703', D_bgrp: 'AB+', D_weight: 58, D_email: 'deepa.nair@yahoo.com', D_address: 'Ernakulam, Kochi', D_state: 'Kerala', D_donation_type: 'Plasma', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 3 },
    { D_name: 'Suresh Venkatesh', D_age: 40, D_sex: 'Male', D_phno: '9444567804', D_bgrp: 'O-', D_weight: 80, D_email: 'suresh.v@gmail.com', D_address: 'T. Nagar, Chennai', D_state: 'Tamil Nadu', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 18 },
    { D_name: 'Ananya Sharma', D_age: 23, D_sex: 'Female', D_phno: '9876234105', D_bgrp: 'B+', D_weight: 52, D_email: 'ananya.s@gmail.com', D_address: 'Jubilee Hills, Hyderabad', D_state: 'Telangana', D_donation_type: 'Platelets', HLevel: 'normal', BS: 'normal', BP: 'low', diseases: 'Mild Anaemia', D_units_donated: 2 },
    { D_name: 'Karthik Raman', D_age: 35, D_sex: 'Male', D_phno: '9789456706', D_bgrp: 'A-', D_weight: 68, D_email: 'karthik.r@icloud.com', D_address: 'Velachery, Chennai', D_state: 'Tamil Nadu', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 8 },
    { D_name: 'Fatima Begum', D_age: 27, D_sex: 'Female', D_phno: '9845123407', D_bgrp: 'O+', D_weight: 60, D_email: 'fatima.b@gmail.com', D_address: 'Mylapore, Chennai', D_state: 'Tamil Nadu', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 5 },
    { D_name: 'Vikram Singh', D_age: 38, D_sex: 'Male', D_phno: '9871234508', D_bgrp: 'B-', D_weight: 85, D_email: 'vikram.singh@hotmail.com', D_address: 'Connaught Place, Delhi', D_state: 'Delhi', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'high', BP: 'normal', diseases: 'Controlled Diabetes', D_units_donated: 3 },
    { D_name: 'Lakshmi Devi', D_age: 30, D_sex: 'Female', D_phno: '9445678909', D_bgrp: 'AB-', D_weight: 54, D_email: 'lakshmi.d@gmail.com', D_address: 'Tambaram, Chennai', D_state: 'Tamil Nadu', D_donation_type: 'Plasma', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 1 },
    { D_name: 'Arun Prasad', D_age: 45, D_sex: 'Male', D_phno: '9567890110', D_bgrp: 'A+', D_weight: 75, D_email: 'arun.prasad@gmail.com', D_address: 'RS Puram, Coimbatore', D_state: 'Tamil Nadu', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 14 },
    { D_name: 'Sneha Reddy', D_age: 26, D_sex: 'Female', D_phno: '9876543211', D_bgrp: 'O+', D_weight: 56, D_email: 'sneha.reddy@gmail.com', D_address: 'Banjara Hills, Hyderabad', D_state: 'Telangana', D_donation_type: 'Platelets', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 7 },
    { D_name: 'Ganesh Murugan', D_age: 33, D_sex: 'Male', D_phno: '9789012312', D_bgrp: 'B+', D_weight: 70, D_email: 'ganesh.m@gmail.com', D_address: 'Madurai', D_state: 'Tamil Nadu', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 9 },
    { D_name: 'Meena Kumari', D_age: 22, D_sex: 'Female', D_phno: '9845012313', D_bgrp: 'A+', D_weight: 50, D_email: 'meena.k@yahoo.com', D_address: 'Thiruvananthapuram', D_state: 'Kerala', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 2 },
    { D_name: 'Rajesh Khanna', D_age: 42, D_sex: 'Male', D_phno: '9871230014', D_bgrp: 'O+', D_weight: 82, D_email: 'rajesh.k@gmail.com', D_address: 'Andheri, Mumbai', D_state: 'Maharashtra', D_donation_type: 'Whole Blood', HLevel: 'normal', BS: 'normal', BP: 'normal', diseases: 'None', D_units_donated: 20 },
]

const INDIAN_RECIPIENTS = [
    { reci_name: 'Kavitha Sundaram', reci_age: 45, reci_sex: 'Female', reci_phno: '9841098701', reci_bgrp: 'O+', reci_hospital: 'Apollo Hospital, Chennai', reci_doctor: 'Dr. Srinivas Rao', reci_urgency: 'Urgent', reci_purpose: 'Surgery', reci_address: 'Greams Road, Chennai' },
    { reci_name: 'Arjun Mehta', reci_age: 8, reci_sex: 'Male', reci_phno: '9876098702', reci_bgrp: 'B+', reci_hospital: 'CMC Vellore', reci_doctor: 'Dr. Thomas Mathew', reci_urgency: 'Critical', reci_purpose: 'Thalassemia', reci_address: 'Vellore, Tamil Nadu' },
    { reci_name: 'Sita Ram', reci_age: 62, reci_sex: 'Female', reci_phno: '9445098703', reci_bgrp: 'A+', reci_hospital: 'AIIMS Delhi', reci_doctor: 'Dr. Anil Kumar', reci_urgency: 'Normal', reci_purpose: 'Cancer', reci_address: 'Ansari Nagar, Delhi' },
    { reci_name: 'Bharath Kumar', reci_age: 28, reci_sex: 'Male', reci_phno: '9567098704', reci_bgrp: 'AB+', reci_hospital: 'Stanley Medical College, Chennai', reci_doctor: 'Dr. Meena Ganesan', reci_urgency: 'Critical', reci_purpose: 'Accident', reci_address: 'Royapuram, Chennai' },
    { reci_name: 'Divya Krishnan', reci_age: 30, reci_sex: 'Female', reci_phno: '9789098705', reci_bgrp: 'O-', reci_hospital: 'Fortis Hospital, Bengaluru', reci_doctor: 'Dr. Priya Verma', reci_urgency: 'Urgent', reci_purpose: 'Pregnancy', reci_address: 'Bannerghatta Road, Bengaluru' },
    { reci_name: 'Mohan Das', reci_age: 55, reci_sex: 'Male', reci_phno: '9871098706', reci_bgrp: 'B-', reci_hospital: 'JIPMER Puducherry', reci_doctor: 'Dr. Karthik Subramani', reci_urgency: 'Normal', reci_purpose: 'Surgery', reci_address: 'Dhanvantari Nagar, Puducherry' },
    { reci_name: 'Nithya Raj', reci_age: 19, reci_sex: 'Female', reci_phno: '9845098707', reci_bgrp: 'A-', reci_hospital: 'Manipal Hospital, Chennai', reci_doctor: 'Dr. Rajesh Babu', reci_urgency: 'Urgent', reci_purpose: 'Dengue', reci_address: 'Porur, Chennai' },
    { reci_name: 'Venkatesh Iyer', reci_age: 70, reci_sex: 'Male', reci_phno: '9123098708', reci_bgrp: 'O+', reci_hospital: 'Kauvery Hospital, Trichy', reci_doctor: 'Dr. Sundar Rajan', reci_urgency: 'Normal', reci_purpose: 'Anaemia', reci_address: 'Cantonment, Trichy' },
]

async function main() {
    console.log('🩸 BloodBank Seed — Starting...\n')

    // 1. Seed Admin User
    const email = process.env.ADMIN_EMAIL || 'admin@bloodbank.com'
    const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
    const password = await bcrypt.hash(rawPassword, 10)

    const user = await prisma.users.findFirst({ where: { email } })

    if (!user) {
        await prisma.users.create({
            data: { name: 'Admin User', email, phone: '1234567890', password },
        })
        console.log(`✅ Created admin user: ${email}`)
        if (!process.env.ADMIN_PASSWORD) {
            console.log('  ⚠️  WARNING: Using default password. Set ADMIN_PASSWORD env var for production!')
        }
    } else {
        console.log(`ℹ️  Admin user already exists: ${email}`)
    }

    // 2. Seed Blood Stock with realistic levels
    for (const bg of BLOOD_GROUPS) {
        const existing = await prisma.blood_stock.findFirst({ where: { b_grp: bg } })

        if (!existing) {
            await prisma.blood_stock.create({
                data: { b_grp: bg, B_qnty: STOCK_LEVELS[bg] || 0 }
            })
            console.log(`✅ Created blood stock: ${bg} = ${STOCK_LEVELS[bg]} units`)
        } else {
            // Update to realistic levels if currently 0
            if (existing.B_qnty === 0 || existing.B_qnty === null) {
                await prisma.blood_stock.update({
                    where: { stockid: existing.stockid },
                    data: { B_qnty: STOCK_LEVELS[bg] }
                })
                console.log(`📊 Updated stock: ${bg} → ${STOCK_LEVELS[bg]} units`)
            } else {
                console.log(`ℹ️  Blood stock exists: ${bg} = ${existing.B_qnty} units`)
            }
        }
    }

    // 3. Seed Indian Donors (skip if any exist with same phone)
    let donorsCreated = 0
    for (const donor of INDIAN_DONORS) {
        const existing = await prisma.donor.findFirst({ where: { D_phno: donor.D_phno } })
        if (!existing) {
            const hashedPwd = await bcrypt.hash('Donor@123', 10)
            const eligibility = (donor.HLevel === 'normal' && donor.BS === 'normal' && donor.BP === 'normal') ? 'Eligible!!' : 'Not Eligible!'

            await prisma.donor.create({
                data: {
                    ...donor,
                    password: hashedPwd,
                    rdate: new Date(),
                    eligibility: eligibility,
                    last_donation: new Date(Date.now() - Math.floor(Math.random() * 180) * 86400000), // Random date within last 6 months
                }
            })
            donorsCreated++
        }
    }
    console.log(`✅ Donors: ${donorsCreated} new, ${INDIAN_DONORS.length - donorsCreated} already existed`)

    // 4. Seed Indian Recipients
    let recipientsCreated = 0
    for (const reci of INDIAN_RECIPIENTS) {
        const existing = await prisma.recipient.findFirst({ where: { reci_phno: reci.reci_phno } })
        if (!existing) {
            await prisma.recipient.create({
                data: {
                    ...reci,
                    reci_reg_date: new Date(),
                }
            })
            recipientsCreated++
        }
    }
    console.log(`✅ Recipients: ${recipientsCreated} new, ${INDIAN_RECIPIENTS.length - recipientsCreated} already existed`)

    // 5. Seed sample blood requests (only if none exist)
    const existingRequests = await prisma.blood_request.count()
    if (existingRequests === 0) {
        // Get first recipient for FK reference
        const firstRecipient = await prisma.recipient.findFirst()
        if (firstRecipient) {
            const sampleRequests = [
                { reci_name: firstRecipient.reci_name, reci_id: firstRecipient.reci_id, reci_bgrp: firstRecipient.reci_bgrp || 'O+', reci_bqnty: 2, urgency: 'Critical', purpose: 'Surgery', hospital: 'Apollo Hospital, Chennai', status: 'PENDING' },
            ]
            for (const req of sampleRequests) {
                await prisma.blood_request.create({ data: req })
            }
            console.log(`✅ Created ${sampleRequests.length} sample blood request(s)`)
        }
    } else {
        console.log(`ℹ️  ${existingRequests} blood requests already exist`)
    }

    console.log('\n🎉 Seeding completed successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
