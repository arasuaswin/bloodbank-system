"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, Droplet, ClipboardList, Activity, Clock, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface RecentActivity {
    id: number
    date: string
    status: string
    created_at: string
    donor: { D_name: string | null; D_bgrp: string | null }
}

interface LowStockItem {
    stockid: number
    b_grp: string
    B_qnty: number | null
}

interface Stats {
    totalDonors: number
    totalRequests: number
    totalStock: number
    totalRecipients: number
    stockByGroup: { b_grp: string; B_qnty: number | null }[]
    pendingAppointments: number
    lowStock: LowStockItem[]
    recentActivity: RecentActivity[]
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch')
                return res.json()
            })
            .then(data => setStats(data))
            .catch(() => setError(true))
    }, [])

    if (error) return (
        <div className="p-8 text-center text-red-600">
            Failed to load dashboard. <button className="underline" onClick={() => window.location.reload()}>Retry</button>
        </div>
    )
    if (!stats) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                    <p className="text-muted-foreground text-sm mt-1">Blood Bank Management — Real-time stats</p>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                    NBTC Compliant System
                </div>
            </div>

            {/* Low Stock Alert */}
            {stats.lowStock.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-700 dark:text-red-400">⚠️ Critical Low Stock Alert</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {stats.lowStock.map(s => (
                            <span key={s.stockid} className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                                <Droplet className="w-3 h-3" /> {s.b_grp}: {s.B_qnty ?? 0} units
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-red-600 mt-2">Immediate restocking required. Contact blood bank coordinators.</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDonors}</div>
                        <p className="text-xs text-muted-foreground">Registered voluntary donors</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blood Units</CardTitle>
                        <Droplet className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.totalStock}</div>
                        <p className="text-xs text-muted-foreground">Total units in stock</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blood Requests</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRequests}</div>
                        <p className="text-xs text-muted-foreground">Total requests received</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recipients</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRecipients}</div>
                        <p className="text-xs text-muted-foreground">Registered recipients</p>
                    </CardContent>
                </Card>
                <Card className={`hover:shadow-md transition-shadow ${stats.pendingAppointments > 0 ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
                        <Clock className={`h-4 w-4 ${stats.pendingAppointments > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.pendingAppointments > 0 ? 'text-yellow-600' : ''}`}>{stats.pendingAppointments}</div>
                        <Link href="/admin/appointments">
                            <p className="text-xs text-blue-500 hover:underline cursor-pointer">
                                {stats.pendingAppointments > 0 ? 'Click to review →' : 'All cleared ✓'}
                            </p>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Charts + Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-red-600" />
                            Blood Stock Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.stockByGroup}>
                                <XAxis dataKey="b_grp" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    formatter={(value) => [`${value} units`, 'Available']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #fee2e2' }}
                                />
                                <Bar dataKey="B_qnty" fill="#e11d48" radius={[4, 4, 0, 0]}
                                    label={{ position: 'top', fontSize: 10 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recentActivity.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-8">No recent activity yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {stats.recentActivity.map((a) => (
                                    <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm shrink-0">
                                            {a.donor?.D_bgrp || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{a.donor?.D_name || 'Unknown'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(a.date), 'dd MMM yyyy')}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === 'COMPLETED'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {a.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="pt-3 border-t mt-3">
                            <Link href="/admin/appointments">
                                <Button variant="ghost" size="sm" className="w-full text-red-600 hover:bg-red-50 text-xs">
                                    View All Appointments →
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Link href="/admin/appointments">
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            <Clock className="w-4 h-4 mr-2" /> Review Pending ({stats.pendingAppointments})
                        </Button>
                    </Link>
                    <Link href="/admin/stock">
                        <Button size="sm" variant="outline" className="border-red-300 text-red-600">
                            <Droplet className="w-4 h-4 mr-2" /> Manage Stock
                        </Button>
                    </Link>
                    <Link href="/admin/donors">
                        <Button size="sm" variant="outline">
                            <Users className="w-4 h-4 mr-2" /> View Donors
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
