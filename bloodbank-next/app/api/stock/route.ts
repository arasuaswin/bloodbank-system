import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
    try {
        const stock = await prisma.blood_stock.findMany({
            orderBy: { b_grp: 'asc' }
        })
        return NextResponse.json(stock)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { b_grp, quantity, operation } = body

        if (!b_grp || quantity === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Find existing
        const existing = await prisma.blood_stock.findFirst({
            where: { b_grp: b_grp }
        })

        if (!existing) {
            // Create if not exists (though usually seeded)
            const newStock = await prisma.blood_stock.create({
                data: { b_grp, B_qnty: quantity }
            })
            return NextResponse.json(newStock)
        }

        let newQuantity = existing.B_qnty || 0
        if (operation === 'add') {
            newQuantity += quantity
        } else if (operation === 'subtract') {
            newQuantity -= quantity
        } else {
            // set
            newQuantity = quantity
        }

        if (newQuantity < 0) newQuantity = 0

        const updated = await prisma.blood_stock.update({
            where: { stockid: existing.stockid },
            data: { B_qnty: newQuantity }
        })

        return NextResponse.json(updated)

    } catch (error) {
        console.error("Stock update error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
