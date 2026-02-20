import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { z } from 'zod'
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { verifyRegistrationToken } from "@/lib/jwt"

// Validation Schema
const donorSchema = z.object({
    D_name: z.string().min(2, "Name is required"),
    D_age: z.coerce.number().min(18, "Age must be 18+").max(65, "Age must be < 65"),
    D_sex: z.enum(["Male", "Female", "Other"]),
    D_phno: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    D_bgrp: z.string().min(1, "Blood Group required"),
    D_weight: z.coerce.number().min(45, "Weight must be at least 45kg").optional(),
    D_email: z.string().email("Invalid email"),
    D_address: z.string().max(100).optional(),
    last_donation: z.coerce.date().optional().nullable(),
    diseases: z.string().optional(),
    HLevel: z.string().optional(),
    BS: z.string().optional(),
    BP: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    verificationToken: z.string().min(1, "Verification token is required")
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validatedData = donorSchema.parse(body)

        // 1. Verify OTP Token
        const decoded = verifyRegistrationToken(validatedData.verificationToken)
        if (!decoded || decoded.email !== validatedData.D_email) {
            return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
        }

        // 2. Check if phone or email already exists
        const existingDonor = await prisma.donor.findFirst({
            where: {
                OR: [
                    { D_phno: validatedData.D_phno },
                    { D_email: validatedData.D_email }
                ]
            }
        })

        if (existingDonor) {
            return NextResponse.json({ error: "Donor with this phone or email already exists" }, { status: 400 })
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10)

        // Determine initial eligibility (simplified logic)
        let eligibility = "Pending"
        if (validatedData.HLevel === 'normal' && validatedData.BP === 'normal' && validatedData.BS === 'normal') {
            eligibility = "Eligible!!"
        } else {
            eligibility = "Not Eligible!"
        }

        // Remove non-db fields
        const { verificationToken, password, ...donorData } = validatedData

        const newDonor = await prisma.donor.create({
            data: {
                ...donorData,
                password: hashedPassword,
                rdate: new Date(),
                eligibility: eligibility
            },
            select: {
                D_id: true,
                D_name: true,
                D_email: true,
                D_phno: true,
                D_bgrp: true,
                D_sex: true,
                D_age: true,
                D_address: true,
                eligibility: true,
                rdate: true,
            }
        })

        return NextResponse.json(newDonor, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        console.error("Error creating donor:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const donors = await prisma.donor.findMany({
            orderBy: { D_id: 'desc' },
            select: {
                D_id: true,
                D_name: true,
                D_email: true,
                D_phno: true,
                D_bgrp: true,
                D_sex: true,
                D_age: true,
                D_address: true,
                last_donation: true,
                eligibility: true
            }
        })
        return NextResponse.json(donors)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id } = body

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

        // Delete appointments first to avoid FK constraint errors
        await prisma.appointment.deleteMany({
            where: { donor_id: parseInt(id) }
        })

        await prisma.donor.delete({
            where: { D_id: parseInt(id) }
        })

        return NextResponse.json({ message: "Donor deleted" })
    } catch (error) {
        console.error("Delete donor error:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
