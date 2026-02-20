import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from 'zod'

const profileSchema = z.object({
    D_phno: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    D_weight: z.coerce.number().min(45, "Weight must be at least 45kg"),
    D_address: z.string().max(100).optional(),
    diseases: z.string().optional(),
    D_bgrp: z.string().min(1, "Blood group cannot be empty"),
    D_age: z.coerce.number().min(18).max(65),
})

export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== 'donor') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const donor = await prisma.donor.findUnique({
            where: { D_id: parseInt(session.user.id) },
            select: {
                D_id: true,
                D_name: true,
                D_email: true,
                D_phno: true,
                D_bgrp: true,
                D_sex: true,
                D_age: true,
                D_weight: true,
                D_address: true,
                diseases: true,
                HLevel: true,
                BS: true,
                BP: true,
                last_donation: true,
                eligibility: true,
                rdate: true,
            }
        })

        if (!donor) return NextResponse.json({ error: "Donor not found" }, { status: 404 })

        return NextResponse.json(donor)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== 'donor') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const validatedData = profileSchema.parse(body)

        const updatedDonor = await prisma.donor.update({
            where: { D_id: parseInt(session.user.id) },
            data: validatedData
        })

        return NextResponse.json(updatedDonor)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }
}
