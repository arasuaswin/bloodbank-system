import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { donorId } = await req.json()
        if (!donorId) return NextResponse.json({ error: "Missing donorId" }, { status: 400 })

        const today = new Date()

        // Mark the most recent APPROVED or PENDING appointment as COMPLETED, or create a record
        const latestAppointment = await prisma.appointment.findFirst({
            where: {
                donor_id: parseInt(donorId),
                status: { in: ['APPROVED', 'PENDING'] }
            },
            orderBy: { date: 'asc' }
        })

        if (latestAppointment) {
            await prisma.appointment.update({
                where: { id: latestAppointment.id },
                data: { status: 'COMPLETED' }
            })
        } else {
            // Create a new completed appointment entry for today
            await prisma.appointment.create({
                data: {
                    donor_id: parseInt(donorId),
                    date: today,
                    status: 'COMPLETED',
                }
            })
        }

        // Update last_donation and recalculate eligibility
        // ICMR/NBTC: donor can donate every 90 days
        const nextEligible = new Date(today)
        nextEligible.setDate(nextEligible.getDate() + 90)

        await prisma.donor.update({
            where: { D_id: parseInt(donorId) },
            data: {
                last_donation: today,
                eligibility: `Eligible from ${nextEligible.toLocaleDateString('en-IN')}`,
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("complete-donation error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
