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
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BloodStock } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Plus, Minus, Settings2 } from "lucide-react"

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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Blood Stock Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Group</TableHead>
                            <TableHead>Quantity (Units)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stock.map((item) => (
                            <TableRow key={item.stockid}>
                                <TableCell className="font-bold text-lg">{item.b_grp}</TableCell>
                                <TableCell className="text-lg">{item.B_qnty}</TableCell>
                                <TableCell>
                                    {(item.B_qnty || 0) < 5 ? (
                                        <span className="text-red-600 font-bold">Low Stock</span>
                                    ) : (
                                        <span className="text-green-600 font-bold">Available</span>
                                    )}
                                </TableCell>
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
                                                    <Button size="sm" onClick={() => handleUpdate(item.b_grp, 1, 'subtract')} className="flex-1 bg-red-600"><Minus className="w-4 h-4" /> 1</Button>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <Input
                                                        type="number"
                                                        placeholder="Qty"
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
                                                    }}>Add Custom</Button>
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
    )
}
