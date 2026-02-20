"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BloodStock } from "@/types"
import { Search, Droplet, AlertTriangle, Phone } from "lucide-react"
import Link from "next/link"

const bloodCompatibilityInfo: Record<string, string> = {
    'O-': '🌟 Universal Donor — can give to all blood groups',
    'O+': 'Can donate to A+, B+, AB+, O+',
    'A+': 'Can donate to A+ and AB+',
    'A-': 'Can donate to A+, A-, AB+, AB-',
    'B+': 'Can donate to B+ and AB+',
    'B-': 'Can donate to B+, B-, AB+, AB-',
    'AB+': '🌟 Universal Recipient — can receive from all groups',
    'AB-': 'Can donate to AB+ and AB-',
}

function getUrgency(qty: number | null | undefined) {
    const q = qty ?? 0
    if (q === 0) return { label: "Out of Stock", color: "bg-gray-100 text-gray-600 border-gray-300", badge: "bg-gray-500", icon: "⚫" }
    if (q <= 3) return { label: "Critical", color: "border-red-400 bg-red-50", badge: "bg-red-600", icon: "🚨" }
    if (q <= 8) return { label: "Low", color: "border-orange-400 bg-orange-50", badge: "bg-orange-500", icon: "⚠️" }
    return { label: "Available", color: "border-green-300 bg-green-50", badge: "bg-green-600", icon: "✅" }
}

export default function SearchBlood() {
    const [stock, setStock] = useState<BloodStock[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStock() {
            try {
                const res = await fetch('/api/stock')
                const data = await res.json()
                if (Array.isArray(data)) setStock(data)
            } catch (e) {
                console.error("Failed to fetch stock")
            } finally {
                setLoading(false)
            }
        }
        fetchStock()
    }, [])

    const filteredStock = stock.filter(item =>
        item.b_grp.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const criticalGroups = stock.filter(s => (s.B_qnty ?? 0) <= 3 && (s.B_qnty ?? 0) > 0)

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-3">
                    <span className="text-red-600">Blood</span> Availability
                </h1>
                <p className="text-gray-500 max-w-xl mx-auto text-sm">
                    Real-time blood stock availability at our blood bank. All 8 blood groups tracked 24/7.
                    Stocks are updated after every donation and dispatch.
                </p>
            </div>

            {/* Critical Emergency Banner */}
            {criticalGroups.length > 0 && (
                <div className="mb-8 bg-red-50 border border-red-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-700">🚨 Critical Blood Shortage Alert</h3>
                    </div>
                    <p className="text-sm text-red-600 mb-3">
                        The following groups are critically low. If you are eligible, please consider donating urgently.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {criticalGroups.map(s => (
                            <span key={s.stockid} className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                {s.b_grp}: only {s.B_qnty} unit{s.B_qnty !== 1 ? 's' : ''} left
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                        <Link href="/eligibility">
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">Check My Eligibility</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm" variant="outline" className="border-red-400 text-red-700">Register as Donor</Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="max-w-md mx-auto mb-8 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                    className="pl-10"
                    placeholder="Search Blood Group (e.g. A+, O-)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs text-gray-500">
                <span className="flex items-center gap-1">🚨 <span className="font-medium text-red-600">Critical</span> ≤3 units</span>
                <span className="flex items-center gap-1">⚠️ <span className="font-medium text-orange-500">Low</span> 4–8 units</span>
                <span className="flex items-center gap-1">✅ <span className="font-medium text-green-600">Available</span> &gt;8 units</span>
                <span className="flex items-center gap-1">⚫ <span className="font-medium text-gray-500">Out of Stock</span></span>
            </div>

            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredStock.map((item) => {
                        const urgency = getUrgency(item.B_qnty)
                        return (
                            <Card key={item.stockid} className={`hover:shadow-lg transition-all border-2 ${urgency.color}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-2xl font-bold">{item.b_grp}</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <Droplet className={`h-5 w-5 ${(item.B_qnty || 0) > 0 ? 'text-red-600' : 'text-gray-300'}`} fill={(item.B_qnty || 0) > 0 ? "currentColor" : "none"} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Available Units</div>
                                        <div className="text-3xl font-bold">{item.B_qnty ?? 0}</div>
                                    </div>

                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white font-medium ${urgency.badge}`}>
                                        {urgency.icon} {urgency.label}
                                    </span>

                                    <p className="text-xs text-gray-500 italic leading-tight">
                                        {bloodCompatibilityInfo[item.b_grp]}
                                    </p>

                                    {(item.B_qnty || 0) > 0 ? (
                                        <div className="space-y-2">
                                            <Link href={`/request?bg=${encodeURIComponent(item.b_grp)}`}>
                                                <Button className="w-full bg-red-600 hover:bg-red-700 text-sm h-9">
                                                    Request Blood
                                                </Button>
                                            </Link>
                                            {(item.B_qnty ?? 0) <= 5 && (
                                                <p className="text-xs text-center text-orange-600">
                                                    ⏱️ Fulfillment may take 24–48 hrs
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Button disabled className="w-full text-sm h-9">Out of Stock</Button>
                                            <Link href="/register">
                                                <Button variant="outline" size="sm" className="w-full text-xs border-red-300 text-red-600 hover:bg-red-50">
                                                    Donate This Group
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Emergency Helpline */}
            <div className="mt-12 text-center bg-gray-900 text-white rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">Need Blood Urgently?</h3>
                <p className="text-gray-400 text-sm mb-4">If stocks are unavailable here, contact the national blood helpline immediately.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="tel:104" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Phone className="w-4 h-4" /> 104 (NBTC Toll-Free)
                    </a>
                    <a href="tel:18001801104" className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Phone className="w-4 h-4" /> 1800-180-1104
                    </a>
                </div>
                <p className="text-xs text-gray-500 mt-3">National Blood Transfusion Council (NBTC) — Ministry of Health & Family Welfare, Govt. of India</p>
            </div>
        </div>
    )
}
