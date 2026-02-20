"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Request {
    id: number
    reci_name: string
    reci_bgrp: string
    reci_bqnty: number
    reci_id: number
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([])
    const { toast } = useToast()

    useEffect(() => {
        fetchRequests()
    }, [])

    function fetchRequests() {
        fetch('/api/requests')
            .then(res => res.json())
            .then(data => setRequests(data))
    }

    // Implement approve/reject logic
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
                description: action === 'approve' ? "Stock deducted and request cleared." : "Request rejected and cleared.",
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Blood Requests</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Recipient Name</TableHead>
                            <TableHead>Recipient ID</TableHead>
                            <TableHead>Blood Group</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>{req.id}</TableCell>
                                <TableCell className="font-medium">{req.reci_name}</TableCell>
                                <TableCell>{req.reci_id}</TableCell>
                                <TableCell><span className="font-bold text-red-600">{req.reci_bgrp}</span></TableCell>
                                <TableCell>{req.reci_bqnty}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" onClick={() => handleAction(req.id, 'approve')} className="bg-green-600 hover:bg-green-700">Approve</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleAction(req.id, 'reject')}>Reject</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">No pending requests.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
