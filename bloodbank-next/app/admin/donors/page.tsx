"use client"

import { useEffect, useState } from "react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, CheckCircle, Search, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Donor } from "@/types"
import { format } from "date-fns"

export default function DonorsPage() {
    const [donors, setDonors] = useState<Donor[]>([])
    const [filtered, setFiltered] = useState<Donor[]>([])
    const [error, setError] = useState(false)
    const [search, setSearch] = useState("")
    const [bloodFilter, setBloodFilter] = useState("all")
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

    useEffect(() => { fetchDonors() }, [])

    useEffect(() => {
        let result = donors
        if (search) {
            const s = search.toLowerCase()
            result = result.filter(d =>
                (d.D_name || '').toLowerCase().includes(s) ||
                (d.D_phno || '').includes(s) ||
                (d.D_email || '').toLowerCase().includes(s)
            )
        }
        if (bloodFilter !== "all") {
            result = result.filter(d => d.D_bgrp === bloodFilter)
        }
        setFiltered(result)
    }, [donors, search, bloodFilter])

    if (error) return (
        <div className="p-8 text-center text-red-600">
            Failed to load donors.{" "}
            <button className="underline" onClick={() => { setError(false); fetchDonors() }}>Retry</button>
        </div>
    )

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
        } catch {
            toast({ title: "Error", description: "Failed to delete donor", variant: "destructive" })
        }
    }

    const handleMarkComplete = async (donorId: number) => {
        try {
            const res = await fetch('/api/admin/complete-donation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ donorId })
            })
            if (!res.ok) throw new Error("Failed")
            toast({ title: "Donation Marked Complete ✅", description: "Last donation date updated. Eligibility recalculated.", className: "bg-green-600 text-white" })
            fetchDonors()
        } catch {
            toast({ title: "Error", description: "Failed to mark donation complete", variant: "destructive" })
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Donor List</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {donors.length} donors shown</p>
                    </div>
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-48">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search name/phone/email…"
                                className="pl-9 h-9 text-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={bloodFilter} onValueChange={setBloodFilter}>
                            <SelectTrigger className="h-9 w-28 text-sm">
                                <SelectValue placeholder="Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Blood Group</TableHead>
                                <TableHead>Last Donation</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((donor) => (
                                <TableRow key={donor.D_id}>
                                    <TableCell className="text-muted-foreground text-xs">#{donor.D_id}</TableCell>
                                    <TableCell className="font-medium">
                                        <div>{donor.D_name}</div>
                                        <div className="text-xs text-muted-foreground">{donor.D_email}</div>
                                    </TableCell>
                                    <TableCell>{donor.D_phno}</TableCell>
                                    <TableCell>
                                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-sm">{donor.D_bgrp}</span>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {(donor as any).last_donation
                                            ? format(new Date((donor as any).last_donation), "d MMM yyyy")
                                            : <span className="text-gray-400 text-xs">Never</span>}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${donor.eligibility === 'Eligible!!'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {donor.eligibility === 'Eligible!!' ? '✅ Eligible' : '⛔ Not Eligible'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkComplete(donor.D_id)}
                                                className="text-green-600 hover:text-green-800 hover:bg-green-50 text-xs px-2"
                                                title="Mark donation as completed today"
                                            >
                                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                                Done
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(donor.D_id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No donors match your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
