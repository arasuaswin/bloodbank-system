import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from 'zod'

const recipientSchema = z.object({
    reci_name: z.string().min(2, "Name must be at least 2 characters"),
    reci_age: z.coerce.number().min(1).max(120),
    reci_sex: z.enum(["Male", "Female", "Other"]),
    reci_phno: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    reci_bgrp: z.string().min(1),
    reci_hospital: z.string().min(2).optional(),
    reci_doctor: z.string().optional(),
    reci_address: z.string().optional(),
    reci_urgency: z.string().optional().default("Normal"),
    reci_purpose: z.string().optional(),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const data = recipientSchema.parse(body)

        // Check for duplicate phone number
        const existing = await prisma.recipient.findFirst({
            where: { reci_phno: data.reci_phno }
        })
        if (existing) {
            return NextResponse.json(
                { error: "A recipient with this phone number is already registered", reci_id: existing.reci_id },
                { status: 409 }
            )
        }

        const newRecipient = await prisma.recipient.create({
            data: {
                reci_name: data.reci_name,
                reci_age: data.reci_age,
                reci_sex: data.reci_sex,
                reci_phno: data.reci_phno,
                reci_bgrp: data.reci_bgrp,
                reci_hospital: data.reci_hospital || null,
                reci_doctor: data.reci_doctor || null,
                reci_address: data.reci_address || null,
                reci_urgency: data.reci_urgency || "Normal",
                reci_purpose: data.reci_purpose || null,
                reci_reg_date: new Date(),
            }
        })

        return NextResponse.json(newRecipient, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        console.error("Error creating recipient:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const recipients = await prisma.recipient.findMany({
            orderBy: { reci_id: 'desc' }
        })
        return NextResponse.json(recipients)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
