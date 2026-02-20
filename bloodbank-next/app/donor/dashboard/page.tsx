import { auth } from "@/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Droplet, Calendar, Award } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export default async function DonorDashboard() {
    const session = await auth()

    if (!session || !session.user?.id) return null

    const donor = await prisma.donor.findUnique({
        where: { D_id: parseInt(session.user.id) },
        include: { appointments: true }
    })

    if (!donor) return <div>Donor not found</div>

    const lastDonationDate = donor.last_donation
        ? format(new Date(donor.last_donation), "PPP")
        : "Never"

    // Simple calculation: 1 donation = 3 lives saved (refined logic can be added)
    const donationsCount = await prisma.appointment.count({
        where: {
            donor_id: donor.D_id,
            status: "COMPLETED"
        }
    })

    // Assuming each completed donation saves 3 lives
    const livesSaved = donationsCount * 3

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Welcome, {session.user.name}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blood Group</CardTitle>
                        <Droplet className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{donor.D_bgrp || "Unknown"}</div>
                        <p className="text-xs text-muted-foreground">Your verified blood type</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Donation</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lastDonationDate}</div>
                        <p className="text-xs text-muted-foreground">
                            {donor.eligibility === "Eligible!!" ? "You are eligible to donate!" : "Not currently eligible"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lives Saved</CardTitle>
                        <Award className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{livesSaved}</div>
                        <p className="text-xs text-muted-foreground">Based on completed donations</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
