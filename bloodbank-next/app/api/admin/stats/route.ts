import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const [totalDonors, totalRequests, totalStock, totalRecipients, pendingAppointments] = await Promise.all([
            prisma.donor.count(),
            prisma.blood_request.count(),
            prisma.blood_stock.aggregate({ _sum: { B_qnty: true } }),
            prisma.recipient.count(),
            prisma.appointment.count({ where: { status: 'PENDING' } }),
        ])

        const stockByGroup = await prisma.blood_stock.findMany({ orderBy: { b_grp: 'asc' } })
        const lowStock = stockByGroup.filter(s => (s.B_qnty || 0) <= 5)

        const recentActivity = await prisma.appointment.findMany({
            where: { status: { in: ['APPROVED', 'COMPLETED'] } },
            orderBy: { created_at: 'desc' },
            take: 5,
            include: { donor: { select: { D_name: true, D_bgrp: true } } }
        })

        return NextResponse.json({
            totalDonors,
            totalRequests,
            totalStock: totalStock._sum.B_qnty || 0,
            totalRecipients,
            stockByGroup,
            pendingAppointments,
            lowStock,
            recentActivity,
        })
    } catch (error) {
        console.error("Error fetching stats:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
