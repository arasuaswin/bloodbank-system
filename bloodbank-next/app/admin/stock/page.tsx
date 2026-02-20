"use client"

import { useEffect, useState } from "react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BloodStock } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Plus, Minus, Settings2, Droplet, AlertTriangle, Clock } from "lucide-react"

const NBTC_SHELF_LIFE: Record<string, string> = {
    'Whole Blood': '35 days (CPDA-1)',
    'Platelets': '5 days (20-24°C)',
    'Plasma (FFP)': '1 year (-30°C)',
    'PRBCs': '42 days (2-6°C)',
}

export default function StockPage() {
    const [stock, setStock] = useState<BloodStock[]>([])
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [customQty, setCustomQty] = useState<Record<number, string>>({})

    const fetchStock = () => {
        fetch('/api/stock')
            .then(res => res.json())
            .then(data => setStock(data))
    }

    useEffect(() => {
        fetchStock()
    }, [])

    const handleUpdate = async (b_grp: string, quantity: number, operation: 'add' | 'subtract' | 'set') => {
        setLoading(true)
        try {
            const res = await fetch('/api/stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ b_grp, quantity, operation })
            })
            if (!res.ok) throw new Error("Update failed")

            toast({ title: "Stock Updated", className: "bg-green-600 text-white" })
            fetchStock()
        } catch (error) {
            toast({ title: "Error", description: "Could not update stock", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const totalUnits = stock.reduce((sum, s) => sum + (s.B_qnty || 0), 0)
    const criticalGroups = stock.filter(s => (s.B_qnty || 0) <= 3)
    const lowGroups = stock.filter(s => (s.B_qnty || 0) > 3 && (s.B_qnty || 0) <= 8)

    const getRowClass = (qty: number) => {
        if (qty <= 3) return 'bg-red-50 dark:bg-red-950/30 border-l-4 border-l-red-500'
        if (qty <= 8) return 'bg-orange-50 dark:bg-orange-950/20 border-l-4 border-l-orange-400'
        return ''
    }

    const getStatusLabel = (qty: number) => {
        if (qty === 0) return <span className="text-red-700 font-bold flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Out of Stock</span>
        if (qty <= 3) return <span className="text-red-600 font-bold">🔴 Critical</span>
        if (qty <= 8) return <span className="text-orange-600 font-bold">🟠 Low</span>
        return <span className="text-green-600 font-bold">🟢 Available</span>
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Droplet className="w-8 h-8 text-red-600" /> Blood Stock Management
                </h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-t-4 border-t-blue-500">
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500">Total Units</p>
                        <p className="text-3xl font-bold text-blue-700">{totalUnits}</p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-t-red-500">
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500">Critical (≤3)</p>
                        <p className="text-3xl font-bold text-red-700">{criticalGroups.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-t-orange-400">
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500">Low (≤8)</p>
                        <p className="text-3xl font-bold text-orange-600">{lowGroups.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-t-green-500">
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500">Groups OK</p>
                        <p className="text-3xl font-bold text-green-700">{stock.length - criticalGroups.length - lowGroups.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* NBTC Shelf Life Reference */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> NBTC Shelf Life Reference
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(NBTC_SHELF_LIFE).map(([component, life]) => (
                            <div key={component} className="text-sm">
                                <span className="font-medium text-blue-700">{component}:</span>{' '}
                                <span className="text-blue-600">{life}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Stock Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Stock by Blood Group</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Blood Group</TableHead>
                                <TableHead>Quantity (Units)</TableHead>
                                <TableHead>Volume (approx.)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stock.map((item) => (
                                <TableRow key={item.stockid} className={getRowClass(item.B_qnty || 0)}>
                                    <TableCell className="font-bold text-lg">{item.b_grp}</TableCell>
                                    <TableCell className="text-lg font-semibold">{item.B_qnty}</TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        ~{((item.B_qnty || 0) * 450 / 1000).toFixed(1)} L
                                        <span className="text-xs text-gray-400 ml-1">(@ 450ml/unit)</span>
                                    </TableCell>
                                    <TableCell>{getStatusLabel(item.B_qnty || 0)}</TableCell>
                                    <TableCell className="text-right">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Settings2 className="w-4 h-4 mr-2" /> Manage
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80">
                                                <div className="grid gap-4">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium leading-none">Update Stock: {item.b_grp}</h4>
                                                        <p className="text-sm text-muted-foreground">Add or remove units.</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleUpdate(item.b_grp, 1, 'add')} className="flex-1 bg-green-600"><Plus className="w-4 h-4" /> 1</Button>
                                                        <Button size="sm" onClick={() => handleUpdate(item.b_grp, 5, 'add')} className="flex-1 bg-green-600"><Plus className="w-4 h-4" /> 5</Button>
                                                        <Button size="sm" onClick={() => handleUpdate(item.b_grp, 1, 'subtract')} className="flex-1 bg-red-600"><Minus className="w-4 h-4" /> 1</Button>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <Input
                                                            type="number"
                                                            placeholder="Custom Qty"
                                                            className="h-8"
                                                            value={customQty[item.stockid] || ''}
                                                            onChange={(e) => setCustomQty(prev => ({ ...prev, [item.stockid]: e.target.value }))}
                                                        />
                                                        <Button size="sm" onClick={() => {
                                                            const val = customQty[item.stockid]
                                                            if (val) {
                                                                handleUpdate(item.b_grp, parseInt(val), 'add')
                                                                setCustomQty(prev => ({ ...prev, [item.stockid]: '' }))
                                                            }
                                                        }}>Add</Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
