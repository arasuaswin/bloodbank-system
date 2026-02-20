import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { z } from 'zod'
import { sendEmail } from "@/lib/email"
import { auth } from "@/auth"

const requestSchema = z.object({
    reci_name: z.string().min(2),
    reci_bgrp: z.string().min(1),
    reci_bqnty: z.coerce.number().min(1),
    reci_id: z.coerce.number().min(1),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validatedData = requestSchema.parse(body)

        // Verify Recipient Exists and matches ID/Name
        const recipient = await prisma.recipient.findUnique({
            where: {
                reci_id_reci_name: {
                    reci_id: validatedData.reci_id,
                    reci_name: validatedData.reci_name
                }
            }
        })

        if (!recipient) {
            return NextResponse.json({ error: "Invalid Recipient ID or Name" }, { status: 400 })
        }

        const newRequest = await prisma.blood_request.create({
            data: validatedData
        })

        // Send Email Alert
        await sendEmail(
            process.env.ADMIN_EMAIL || "admin@bloodbank.com",
            "New Blood Request Received",
            `A new request for ${validatedData.reci_bqnty} units of ${validatedData.reci_bgrp} has been placed by ${validatedData.reci_name}.`
        )

        return NextResponse.json(newRequest, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        console.error("Error creating request:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const requests = await prisma.blood_request.findMany({
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(requests)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, action } = body

        if (!id || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const request = await prisma.blood_request.findUnique({
            where: { id: parseInt(id) }
        })

        if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 })

        if (action === 'approve') {
            // Check stock
            const stock = await prisma.blood_stock.findFirst({
                where: { b_grp: request.reci_bgrp }
            })

            if (!stock || (stock.B_qnty || 0) < request.reci_bqnty) {
                return NextResponse.json({ error: "Insufficient Stock" }, { status: 400 })
            }

            // Deduct Stock
            await prisma.blood_stock.update({
                where: { stockid: stock.stockid },
                data: { B_qnty: { decrement: request.reci_bqnty } }
            })

            // Delete request (it's fulfilled)
            await prisma.blood_request.delete({
                where: { id: parseInt(id) }
            })

            return NextResponse.json({ message: "Approved and Stock Deducted" })
        } else {
            // Reject - just delete
            await prisma.blood_request.delete({
                where: { id: parseInt(id) }
            })
            return NextResponse.json({ message: "Request Rejected" })
        }

    } catch (error) {
        console.error("Request action error:", error)
        return NextResponse.json({ error: "Action failed" }, { status: 500 })
    }
}
