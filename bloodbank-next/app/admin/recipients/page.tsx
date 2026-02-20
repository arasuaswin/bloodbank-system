"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCheck } from "lucide-react"

interface Recipient {
    reci_id: number
    reci_name: string
    reci_age: number | null
    reci_sex: string | null
    reci_phno: string | null
    reci_bgrp: string | null
    reci_reg_date: string | null
}

export default function AdminRecipients() {
    const [recipients, setRecipients] = useState<Recipient[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRecipients() {
            try {
                const res = await fetch('/api/recipient')
                const data = await res.json()
                if (Array.isArray(data)) {
                    setRecipients(data)
                }
            } catch (error) {
                console.error("Failed to fetch recipients:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchRecipients()
    }, [])

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <UserCheck className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold">Recipients</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Registered Recipients ({recipients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {recipients.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No recipients registered yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Blood Group</TableHead>
                                        <TableHead>Registered</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recipients.map((r) => (
                                        <TableRow key={`${r.reci_id}-${r.reci_name}`}>
                                            <TableCell className="font-medium">{r.reci_id}</TableCell>
                                            <TableCell>{r.reci_name}</TableCell>
                                            <TableCell>{r.reci_age || '-'}</TableCell>
                                            <TableCell>{r.reci_sex || '-'}</TableCell>
                                            <TableCell>{r.reci_phno || '-'}</TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                                                    {r.reci_bgrp || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {r.reci_reg_date ? new Date(r.reci_reg_date).toLocaleDateString() : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
