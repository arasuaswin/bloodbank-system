"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCheck, Search, Hospital } from "lucide-react"

interface Recipient {
    reci_id: number
    reci_name: string
    reci_age: number | null
    reci_sex: string | null
    reci_phno: string | null
    reci_bgrp: string | null
    reci_reg_date: string | null
    reci_hospital: string | null
    reci_doctor: string | null
    reci_urgency: string | null
    reci_purpose: string | null
    reci_address: string | null
}

const urgencyBadge = (urgency: string | null) => {
    switch (urgency) {
        case 'Critical': return <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-bold">🔴 Critical</span>
        case 'Urgent': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">🟡 Urgent</span>
        default: return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-bold">🟢 Normal</span>
    }
}

export default function AdminRecipients() {
    const [recipients, setRecipients] = useState<Recipient[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [urgencyFilter, setUrgencyFilter] = useState("all")

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

    const filtered = recipients.filter(r => {
        const matchSearch = search === "" ||
            r.reci_name.toLowerCase().includes(search.toLowerCase()) ||
            (r.reci_phno || '').includes(search) ||
            (r.reci_hospital || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.reci_bgrp || '').toLowerCase().includes(search.toLowerCase())
        const matchUrgency = urgencyFilter === "all" || (r.reci_urgency || "Normal") === urgencyFilter
        return matchSearch && matchUrgency
    })

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>
    }

    const criticalCount = recipients.filter(r => r.reci_urgency === "Critical").length

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <UserCheck className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold">Recipients</h1>
                {criticalCount > 0 && (
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
                        {criticalCount} Critical
                    </span>
                )}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, phone, hospital, blood group..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Filter Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Urgency</SelectItem>
                        <SelectItem value="Critical">🔴 Critical</SelectItem>
                        <SelectItem value="Urgent">🟡 Urgent</SelectItem>
                        <SelectItem value="Normal">🟢 Normal</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Registered Recipients ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filtered.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No recipients match your search.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Age/Gender</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Blood Group</TableHead>
                                        <TableHead>Hospital</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Urgency</TableHead>
                                        <TableHead>Registered</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((r) => (
                                        <TableRow
                                            key={`${r.reci_id}-${r.reci_name}`}
                                            className={r.reci_urgency === 'Critical' ? 'bg-red-50 dark:bg-red-950/20' : ''}
                                        >
                                            <TableCell className="font-medium">{r.reci_id}</TableCell>
                                            <TableCell className="font-medium">{r.reci_name}</TableCell>
                                            <TableCell>{r.reci_age || '-'} / {r.reci_sex || '-'}</TableCell>
                                            <TableCell>{r.reci_phno || '-'}</TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                                                    {r.reci_bgrp || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {r.reci_hospital ? (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <Hospital className="w-3 h-3 text-gray-400" /> {r.reci_hospital}
                                                    </span>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>{r.reci_doctor || '-'}</TableCell>
                                            <TableCell>{r.reci_purpose || '-'}</TableCell>
                                            <TableCell>{urgencyBadge(r.reci_urgency)}</TableCell>
                                            <TableCell>
                                                {r.reci_reg_date ? new Date(r.reci_reg_date).toLocaleDateString('en-IN') : '-'}
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
