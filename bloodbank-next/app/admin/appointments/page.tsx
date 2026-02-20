"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Check, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
    id: number
    date: string
    status: string
    donor: {
        D_name: string
        D_email: string
        D_phno: string
        D_bgrp: string
    }
}

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<number | null>(null)
    const { toast } = useToast()

    const fetchAppointments = async () => {
        try {
            const res = await fetch('/api/appointments')
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setAppointments(data)
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    const handleStatusUpdate = async (id: number, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
        setProcessing(id)
        try {
            const res = await fetch('/api/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })

            if (!res.ok) throw new Error("Update failed")

            toast({
                title: `Appointment ${status}`,
                description: `The appointment has been ${status.toLowerCase()}.`,
                className: status === 'APPROVED' ? "bg-green-600 text-white" : "bg-red-600 text-white"
            })

            fetchAppointments()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive"
            })
        } finally {
            setProcessing(null)
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Appointments</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Appointment Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Donor</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Blood Group</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No appointments found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                appointments.map((apt) => (
                                    <TableRow key={apt.id}>
                                        <TableCell className="font-medium">{apt.donor?.D_name || "Unknown"}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{apt.donor?.D_phno}</div>
                                            <div className="text-xs text-gray-500">{apt.donor?.D_email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-bold">{apt.donor?.D_bgrp}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(apt.date), "PPP")}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                apt.status === 'APPROVED' ? 'default' :
                                                    apt.status === 'REJECTED' ? 'destructive' : 'secondary'
                                            }>
                                                {apt.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {apt.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                                        onClick={() => handleStatusUpdate(apt.id, 'APPROVED')}
                                                        disabled={processing === apt.id}
                                                    >
                                                        {processing === apt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleStatusUpdate(apt.id, 'REJECTED')}
                                                        disabled={processing === apt.id}
                                                    >
                                                        {processing === apt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            )}
                                            {apt.status === 'APPROVED' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 h-8 px-2"
                                                    onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')}
                                                    disabled={processing === apt.id}
                                                >
                                                    {processing === apt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Completed"}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
