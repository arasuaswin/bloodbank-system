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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Donor } from "@/types"

export default function DonorsPage() {
    const [donors, setDonors] = useState<Donor[]>([])
    const [error, setError] = useState(false)
    const { toast } = useToast()

    const fetchDonors = () => {
        fetch('/api/donors')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch')
                return res.json()
            })
            .then(data => { setDonors(data); setError(false) })
            .catch(() => setError(true))
    }

    useEffect(() => {
        fetchDonors()
    }, [])

    if (error) return <div className="p-8 text-center text-red-600">Failed to load donors. <button className="underline" onClick={() => { setError(false); fetchDonors() }}>Retry</button></div>

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will delete the donor and all their appointment history.")) return

        try {
            const res = await fetch('/api/donors', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })

            if (!res.ok) throw new Error("Delete failed")

            toast({ title: "Donor Deleted", className: "bg-red-600 text-white" })
            fetchDonors()
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete donor", variant: "destructive" })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Donor List</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Sex</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Blood Group</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {donors.map((donor) => (
                            <TableRow key={donor.D_id}>
                                <TableCell>{donor.D_id}</TableCell>
                                <TableCell className="font-medium">{donor.D_name}</TableCell>
                                <TableCell>{donor.D_age}</TableCell>
                                <TableCell>{donor.D_sex}</TableCell>
                                <TableCell>{donor.D_phno}</TableCell>
                                <TableCell><span className="font-bold text-red-600">{donor.D_bgrp}</span></TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${donor.eligibility === 'Eligible!!'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {donor.eligibility}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(donor.D_id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {donors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-4">No donors found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
