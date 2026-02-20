"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar as CalendarIcon, Clock, Droplet, Info } from "lucide-react"
import { format } from "date-fns"

interface Appointment {
    id: number
    date: string
    status: string
    donation_type: string | null
    units: number | null
    notes: string | null
    created_at: string
}

export default function DonorAppointments() {
    const { toast } = useToast()
    const [date, setDate] = useState<Date | undefined>()
    const [donationType, setDonationType] = useState("Whole Blood")
    const [units, setUnits] = useState("1")
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isBooking, setIsBooking] = useState(false)

    async function fetchAppointments() {
        try {
            const res = await fetch('/api/appointments')
            if (!res.ok) throw new Error("Failed to load appointments")
            const data = await res.json()
            setAppointments(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    async function handleBookAppointment() {
        if (!date) return
        setIsBooking(true)
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: date.toISOString(),
                    donation_type: donationType,
                    units: parseInt(units),
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to book")
            }

            toast({ title: "Success ✅", description: `${donationType} donation appointment requested for ${format(date, "PPP")}!` })
            fetchAppointments()
            setDate(undefined)
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setIsBooking(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-500 hover:bg-green-600'
            case 'REJECTED': return 'bg-red-500 hover:bg-red-600'
            case 'COMPLETED': return 'bg-blue-500 hover:bg-blue-600'
            default: return 'bg-yellow-500 hover:bg-yellow-600'
        }
    }

    const donationIntervals: Record<string, string> = {
        'Whole Blood': '90 days gap required (NBTC)',
        'Platelets': '14 days gap (max 24 times/year)',
        'Plasma': '48 hours gap',
    }

    // Max units per donation type
    const maxUnits = donationType === 'Platelets' ? 3 : 1

    return (
        <div className="space-y-6">
            <div className="md:flex gap-8 items-start">

                {/* Booking Section */}
                <Card className="w-full md:w-auto shrink-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Droplet className="w-5 h-5 text-red-600" /> Book Donation Appointment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            disabled={(d) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return d < today;
                            }}
                        />

                        {/* Donation Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Donation Type</label>
                            <Select value={donationType} onValueChange={(v) => { setDonationType(v); setUnits("1"); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Whole Blood">🩸 Whole Blood (350-450ml)</SelectItem>
                                    <SelectItem value="Platelets">🔬 Platelets (SDP/RDP)</SelectItem>
                                    <SelectItem value="Plasma">💉 Plasma (FFP)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="w-3 h-3" /> {donationIntervals[donationType]}
                            </p>
                        </div>

                        {/* Units */}
                        {donationType === 'Platelets' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Units (SDP)</label>
                                <Select value={units} onValueChange={setUnits}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Unit</SelectItem>
                                        <SelectItem value="2">2 Units</SelectItem>
                                        <SelectItem value="3">3 Units</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={handleBookAppointment}
                            disabled={isBooking || !date}
                        >
                            {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                            Request {donationType} Donation
                        </Button>
                    </CardContent>
                </Card>

                {/* History Section */}
                <Card className="flex-1 mt-6 md:mt-0">
                    <CardHeader>
                        <CardTitle>Your Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : appointments.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No appointments found. Book your first donation!</p>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                <CalendarIcon className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{format(new Date(apt.date), "PPP")}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{apt.donation_type || 'Whole Blood'}</span>
                                                    <span>•</span>
                                                    <span>{apt.units || 1} unit(s)</span>
                                                </div>
                                                {apt.notes && (
                                                    <p className="text-xs text-blue-600 mt-1">📝 {apt.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={`${getStatusColor(apt.status)} text-white`}>
                                            {apt.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
