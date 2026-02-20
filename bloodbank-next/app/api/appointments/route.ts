import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from 'zod'
import { sendEmail } from "@/lib/email"
import { EmailTemplates } from "@/lib/email-templates"

const appointmentSchema = z.object({
    date: z.string().transform((str) => new Date(str)),
    donation_type: z.string().optional().default("Whole Blood"),
    units: z.coerce.number().min(1).max(3).optional().default(1),
})

export async function GET() {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        if (session.user.role === 'admin') {
            const appointments = await prisma.appointment.findMany({
                include: { donor: true },
                orderBy: { date: 'asc' }
            })
            return NextResponse.json(appointments)
        } else {
            // Donor sees only their own
            const appointments = await prisma.appointment.findMany({
                where: { donor_id: parseInt(session.user.id) },
                orderBy: { date: 'desc' }
            })
            return NextResponse.json(appointments)
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== 'donor') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { date, donation_type, units } = appointmentSchema.parse(body)

        const appointment = await prisma.appointment.create({
            data: {
                donor_id: parseInt(session.user.id),
                date: date,
                status: "PENDING",
                donation_type: donation_type || "Whole Blood",
                units: units || 1,
            }
        })

        return NextResponse.json(appointment, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 })
    }
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, status } = body

        if (!id || !['APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 })
        }

        const updated = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: { status }
        })


        if (status === 'APPROVED') {
            const appointmentWithDonor = await prisma.appointment.findUnique({
                where: { id: parseInt(id) },
                include: { donor: true }
            })

            if (appointmentWithDonor && appointmentWithDonor.donor) {
                const { D_email, D_name } = appointmentWithDonor.donor

                if (D_email && D_name) {
                    const dateStr = new Date(appointmentWithDonor.date).toLocaleDateString()
                    const timeStr = new Date(appointmentWithDonor.date).toLocaleTimeString()

                    await sendEmail(
                        D_email,
                        "Appointment Approved - BloodBank",
                        EmailTemplates.appointmentApproved(D_name, dateStr, timeStr)
                    )
                }
            }
        } else if (status === 'REJECTED') {
            const appointmentWithDonor = await prisma.appointment.findUnique({
                where: { id: parseInt(id) },
                include: { donor: true }
            })

            if (appointmentWithDonor && appointmentWithDonor.donor) {
                const { D_email, D_name } = appointmentWithDonor.donor

                if (D_email && D_name) {
                    const dateStr = new Date(appointmentWithDonor.date).toLocaleDateString()

                    await sendEmail(
                        D_email,
                        "Appointment Update - BloodBank",
                        EmailTemplates.appointmentRejected(D_name, dateStr)
                    )
                }
            }
        }

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }
}
