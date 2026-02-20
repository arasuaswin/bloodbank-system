const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

async function main() {
    // 1. Seed Admin User
    // Use environment variables in production, fall back to defaults for dev
    const email = process.env.ADMIN_EMAIL || 'admin@bloodbank.com'
    const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
    const password = await bcrypt.hash(rawPassword, 10)

    const user = await prisma.users.findFirst({
        where: { email },
    })

    if (!user) {
        await prisma.users.create({
            data: {
                name: 'Admin User',
                email,
                phone: '1234567890',
                password,
            },
        })
        console.log(`Created admin user: ${email}`)
        if (!process.env.ADMIN_PASSWORD) {
            console.log('  WARNING: Using default password. Set ADMIN_PASSWORD env var for production!')
        }
    } else {
        console.log(`Admin user already exists: ${email}`)
    }

    // 2. Seed Blood Stock for all 8 blood groups
    for (const bg of BLOOD_GROUPS) {
        const existing = await prisma.blood_stock.findFirst({
            where: { b_grp: bg }
        })

        if (!existing) {
            await prisma.blood_stock.create({
                data: { b_grp: bg, B_qnty: 0 }
            })
            console.log(`Created blood stock entry: ${bg}`)
        } else {
            console.log(`Blood stock already exists: ${bg}`)
        }
    }

    console.log('Seeding completed.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
