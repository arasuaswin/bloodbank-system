"use client"

import { useEffect, useState } from "react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter } from "lucide-react"

interface Request {
    id: number
    reci_name: string
    reci_bgrp: string
    reci_bqnty: number
    reci_id: number
    urgency: string | null
    purpose: string | null
    hospital: string | null
    status: string | null
    created_at: string | null
}

const urgencyBadge = (urgency: string | null) => {
    switch (urgency) {
        case 'Critical': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">🔴 Critical</span>
        case 'Urgent': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">🟡 Urgent</span>
        default: return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">🟢 Normal</span>
    }
}

const statusBadge = (status: string | null) => {
    switch (status) {
        case 'APPROVED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">✅ Approved</span>
        case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">❌ Rejected</span>
        default: return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">⏳ Pending</span>
    }
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([])
    const [search, setSearch] = useState("")
    const [urgencyFilter, setUrgencyFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("PENDING")
    const { toast } = useToast()

    useEffect(() => {
        fetchRequests()
    }, [])

    function fetchRequests() {
        fetch('/api/requests')
            .then(res => res.json())
            .then(data => setRequests(data))
    }

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            const res = await fetch('/api/requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Action failed")
            }

            toast({
                title: `Request ${action}d`,
                description: data.message,
                className: action === 'approve' ? "bg-green-600 text-white" : "bg-red-600 text-white"
            })

            fetchRequests()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        }
    }

    const filtered = requests.filter(r => {
        const matchSearch = search === "" ||
            r.reci_name.toLowerCase().includes(search.toLowerCase()) ||
            r.reci_bgrp.toLowerCase().includes(search.toLowerCase()) ||
            (r.hospital || '').toLowerCase().includes(search.toLowerCase())
        const matchUrgency = urgencyFilter === "all" || r.urgency === urgencyFilter
        const matchStatus = statusFilter === "all" || (r.status || "PENDING") === statusFilter
        return matchSearch && matchUrgency && matchStatus
    })

    const criticalCount = requests.filter(r => r.urgency === "Critical" && (r.status || "PENDING") === "PENDING").length
    const pendingCount = requests.filter(r => (r.status || "PENDING") === "PENDING").length

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Blood Requests</h1>
                <div className="flex gap-2">
                    {criticalCount > 0 && (
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold animate-pulse">
                            🚨 {criticalCount} Critical
                        </span>
                    )}
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {pendingCount} Pending
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, blood group, hospital..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                    <SelectTrigger className="w-[150px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Urgency</SelectItem>
                        <SelectItem value="Critical">🔴 Critical</SelectItem>
                        <SelectItem value="Urgent">🟡 Urgent</SelectItem>
                        <SelectItem value="Normal">🟢 Normal</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">⏳ Pending</SelectItem>
                        <SelectItem value="APPROVED">✅ Approved</SelectItem>
                        <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Requests ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Blood Group</TableHead>
                                    <TableHead>Units</TableHead>
                                    <TableHead>Urgency</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Hospital</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((req) => (
                                    <TableRow
                                        key={req.id}
                                        className={req.urgency === 'Critical' && (req.status || 'PENDING') === 'PENDING' ? 'bg-red-50 dark:bg-red-950/20' : ''}
                                    >
                                        <TableCell>{req.id}</TableCell>
                                        <TableCell className="font-medium">
                                            {req.reci_name}
                                            <span className="text-xs text-gray-400 ml-1">(ID: {req.reci_id})</span>
                                        </TableCell>
                                        <TableCell><span className="font-bold text-red-600">{req.reci_bgrp}</span></TableCell>
                                        <TableCell className="font-semibold">{req.reci_bqnty}</TableCell>
                                        <TableCell>{urgencyBadge(req.urgency)}</TableCell>
                                        <TableCell>{req.purpose || '-'}</TableCell>
                                        <TableCell>{req.hospital || '-'}</TableCell>
                                        <TableCell>{statusBadge(req.status)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {(req.status || "PENDING") === "PENDING" ? (
                                                <>
                                                    <Button size="sm" onClick={() => handleAction(req.id, 'approve')} className="bg-green-600 hover:bg-green-700">Approve</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleAction(req.id, 'reject')}>Reject</Button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400">Processed</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">No requests match your filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
