"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BloodStock } from "@/types"
import { Search, Droplet } from "lucide-react"
import Link from "next/link"

export default function SearchBlood() {
    const [stock, setStock] = useState<BloodStock[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStock() {
            try {
                const res = await fetch('/api/stock')
                const data = await res.json()
                if (Array.isArray(data)) {
                    setStock(data)
                } else {
                    setStock([])
                    console.error("Stock data is not an array:", data)
                }
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

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-center"><span className="text-red-600">Blood</span> Availability</h1>

            <div className="max-w-md mx-auto mb-8 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                    className="pl-10"
                    placeholder="Search Blood Group (e.g. A+)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredStock.map((item) => (
                        <Card key={item.stockid} className="hover:shadow-lg transition-shadow border-t-4 border-t-red-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-2xl font-bold">{item.b_grp}</CardTitle>
                                <Droplet className={`h-6 w-6 ${(item.B_qnty || 0) > 0 ? 'text-red-600' : 'text-gray-300'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-medium text-gray-500">Available Units:</div>
                                <div className="text-3xl font-bold mb-4">{item.B_qnty}</div>

                                {(item.B_qnty || 0) > 0 ? (
                                    <Link href={`/request?bg=${encodeURIComponent(item.b_grp)}`}>
                                        <Button className="w-full bg-red-600 hover:bg-red-700">Request Now</Button>
                                    </Link>
                                ) : (
                                    <Button disabled className="w-full">Out of Stock</Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
