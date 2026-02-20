import { auth } from "@/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Droplet, Calendar, Award, Clock, AlertTriangle, CheckCircle, Heart } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { format, addDays } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DonorDashboard() {
    const session = await auth()

    if (!session || !session.user?.id) return null

    const donor = await prisma.donor.findUnique({
        where: { D_id: parseInt(session.user.id) },
        include: { appointments: { orderBy: { date: 'desc' } } }
    })

    if (!donor) return <div>Donor not found</div>

    const lastDonationDate = donor.last_donation
        ? format(new Date(donor.last_donation), "d MMMM yyyy")
        : null

    // Next eligible date (ICMR India standard: 90 days between whole blood donations)
    const nextEligibleDate = donor.last_donation
        ? addDays(new Date(donor.last_donation), 90)
        : null

    const isEligibleToday = nextEligibleDate ? new Date() >= nextEligibleDate : true

    const donationsCount = await prisma.appointment.count({
        where: { donor_id: donor.D_id, status: "COMPLETED" }
    })

    const livesSaved = donationsCount * 3
    const pendingAppointment = donor.appointments.find(a => a.status === 'PENDING')
    const nextApproved = donor.appointments.find(a => a.status === 'APPROVED')

    // Milestone levels
    const milestones = [
        { count: 1, label: "First Drop", icon: "🩸" },
        { count: 5, label: "Life Saver", icon: "💪" },
        { count: 10, label: "Blood Hero", icon: "🏅" },
        { count: 25, label: "रक्तवीर", icon: "🏆" },
    ]
    const currentMilestone = milestones.slice().reverse().find(m => donationsCount >= m.count)
    const nextMilestone = milestones.find(m => m.count > donationsCount)

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Namaste, {session.user.name?.split(' ')[0]} 🙏
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Your blood donation journey — making India healthier, one drop at a time.
                    </p>
                </div>
                {currentMilestone && (
                    <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-100 px-4 py-2 rounded-xl">
                        <div className="text-2xl">{currentMilestone.icon}</div>
                        <div className="text-xs font-bold text-red-700 mt-1">{currentMilestone.label}</div>
                    </div>
                )}
            </div>

            {/* Upcoming Appointment Banner */}
            {nextApproved && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <div>
                        <p className="font-semibold text-green-700">Upcoming Approved Donation</p>
                        <p className="text-sm text-green-600">📅 {format(new Date(nextApproved.date), "EEEE, d MMMM yyyy")} — Please arrive at the blood bank 10 minutes early.</p>
                    </div>
                </div>
            )}
            {pendingAppointment && !nextApproved && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-yellow-600 shrink-0" />
                    <div>
                        <p className="font-semibold text-yellow-700">Appointment Pending Approval</p>
                        <p className="text-sm text-yellow-600">Requested for {format(new Date(pendingAppointment.date), "d MMM yyyy")} — Awaiting blood bank confirmation.</p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blood Group</CardTitle>
                        <Droplet className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{donor.D_bgrp || "Not Set"}</div>
                        <p className="text-xs text-muted-foreground">Your verified blood type</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Donation</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{lastDonationDate || "First time?"}</div>
                        {nextEligibleDate ? (
                            <p className={`text-xs ${isEligibleToday ? 'text-green-600' : 'text-orange-500'}`}>
                                {isEligibleToday ? "✅ Eligible to donate again!" : `⏳ Eligible from ${format(nextEligibleDate, "d MMM yyyy")}`}
                            </p>
                        ) : (
                            <p className="text-xs text-green-600">✅ You can donate today!</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Donations Done</CardTitle>
                        <Award className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{donationsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {nextMilestone
                                ? `${nextMilestone.count - donationsCount} more to become "${nextMilestone.label}" ${nextMilestone.icon}`
                                : "🏆 Top tier donor!"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lives Saved</CardTitle>
                        <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{livesSaved}</div>
                        <p className="text-xs text-muted-foreground">Estimated (1 donation = 3 lives)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Eligibility & Next Steps */}
            {!isEligibleToday && nextEligibleDate && (
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10">
                    <CardContent className="pt-4 flex items-center gap-4">
                        <AlertTriangle className="w-8 h-8 text-orange-500 shrink-0" />
                        <div>
                            <p className="font-semibold text-orange-800">Next Eligible Date: {format(nextEligibleDate, "EEEE, d MMMM yyyy")}</p>
                            <p className="text-sm text-orange-600">ICMR guidelines require a 90-day gap between whole blood donations to ensure your full recovery.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* India Health Tips & Book CTA */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            🇮🇳 India Health Tips for Donors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            {[
                                "Drink coconut water or ORS after donation to replenish electrolytes",
                                "Eat iron-rich foods: spinach (palak), jaggery (gur), lentils (dal), dates",
                                "Avoid riding a two-wheeler for 2 hours after donating (NBTC guideline)",
                                "ICMR recommends ≥90 days between whole blood donations",
                                "Free health check (Hb, BP, blood sugar) is done at every donation visit",
                                "Carry your Aadhaar or Voter ID to the blood bank for registration",
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-600 to-red-800 text-white border-0">
                    <CardContent className="pt-6 space-y-4 text-center">
                        <div className="text-4xl">🩸</div>
                        <h3 className="text-xl font-bold">Ready to Donate?</h3>
                        {isEligibleToday ? (
                            <>
                                <p className="text-red-100 text-sm">You are eligible today! Book an appointment at your nearest blood bank.</p>
                                <Link href="/donor/appointments">
                                    <Button className="bg-white text-red-700 hover:bg-red-50 w-full font-semibold">
                                        Book Appointment
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className="text-red-100 text-sm">Come back on {nextEligibleDate ? format(nextEligibleDate, "d MMMM") : ''} to book your next appointment.</p>
                                <Link href="/donor/appointments">
                                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-700 w-full">
                                        View Appointments
                                    </Button>
                                </Link>
                            </>
                        )}
                        <p className="text-red-200 text-xs">🚨 Emergency? Call 104 (NBTC Toll-Free)</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
