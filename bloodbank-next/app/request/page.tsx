"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Droplet, AlertTriangle, Hospital } from "lucide-react"

const requestSchema = z.object({
    reci_name: z.string().min(2, "Name required"),
    reci_id: z.coerce.number().min(1, "Recipient ID required"),
    reci_bgrp: z.string().min(1, "Blood group required"),
    reci_bqnty: z.coerce.number().min(1, "At least 1 unit required").max(10, "Max 10 units per request"),
    urgency: z.string().default("Normal"),
    purpose: z.string().optional().or(z.literal('')),
    hospital: z.string().optional().or(z.literal('')),
})

const bloodCompatibilityInfo: Record<string, string> = {
    'O-': 'Universal Donor — can give to all groups',
    'O+': 'Can receive from O+, O-',
    'A+': 'Can receive from A+, A-, O+, O-',
    'A-': 'Can receive from A-, O-',
    'B+': 'Can receive from B+, B-, O+, O-',
    'B-': 'Can receive from B-, O-',
    'AB+': 'Universal Recipient — can receive from all',
    'AB-': 'Can receive from AB-, A-, B-, O-',
}

function RequestForm() {
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const preFilledBg = searchParams.get('bg') || ""

    const form = useForm<z.infer<typeof requestSchema>>({
        resolver: zodResolver(requestSchema) as any,
        defaultValues: {
            reci_name: "",
            reci_id: 0,
            reci_bgrp: preFilledBg,
            reci_bqnty: 1,
            urgency: "Normal",
            purpose: "",
            hospital: "",
        },
    })

    const selectedBg = form.watch('reci_bgrp')
    const selectedUrgency = form.watch('urgency')

    async function onSubmit(values: z.infer<typeof requestSchema>) {
        try {
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit request")
            }

            toast({
                title: "Request Submitted! ✅",
                description: `Your request for ${values.reci_bqnty} unit(s) of ${values.reci_bgrp} has been registered.`,
                variant: "default",
            })

            form.reset()
            router.push('/')

        } catch (error: any) {
            toast({
                title: "Submission Failed",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="max-w-xl mx-auto shadow-lg border-t-4 border-t-red-600">
                <CardHeader>
                    <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                        <Droplet className="w-6 h-6 text-red-600" /> Request Blood
                    </CardTitle>
                    <p className="text-center text-sm text-gray-500 mt-2">
                        Submit a blood request for a registered recipient. Stock will be deducted upon admin approval.
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="reci_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Recipient Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl><Input placeholder="Exact name used during registration" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reci_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Recipient ID <span className="text-red-500">*</span></FormLabel>
                                            <FormControl><Input type="number" placeholder="ID from registration" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="reci_bgrp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blood Group Required <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedBg && (
                                            <p className="text-xs text-blue-600 mt-1">ℹ️ {bloodCompatibilityInfo[selectedBg]}</p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="reci_bqnty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity (Units) <span className="text-red-500">*</span></FormLabel>
                                            <FormControl><Input type="number" min="1" max="10" {...field} /></FormControl>
                                            <p className="text-xs text-muted-foreground">1 unit = 350–450 ml (NBTC standard)</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="urgency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Urgency <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "Normal"}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Normal">🟢 Normal (48 hrs)</SelectItem>
                                                    <SelectItem value="Urgent">🟡 Urgent (12 hrs)</SelectItem>
                                                    <SelectItem value="Critical">🔴 Critical (immediate)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="purpose"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Purpose</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Surgery">Surgery</SelectItem>
                                                    <SelectItem value="Accident">Accident / Trauma</SelectItem>
                                                    <SelectItem value="Thalassemia">Thalassemia</SelectItem>
                                                    <SelectItem value="Cancer">Cancer Treatment</SelectItem>
                                                    <SelectItem value="Pregnancy">Pregnancy / Delivery</SelectItem>
                                                    <SelectItem value="Dengue">Dengue / Platelet Drop</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hospital"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hospital</FormLabel>
                                            <FormControl><Input placeholder="e.g. AIIMS, Apollo" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {selectedUrgency === "Critical" && (
                                <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-800">🚨 Critical Request</p>
                                        <p className="text-xs text-red-600">Also call <strong>104 (NBTC)</strong> or <strong>1800-180-1104</strong> for immediate blood availability.</p>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                                Submit Blood Request
                            </Button>

                            <div className="text-center text-sm text-gray-500 mt-4">
                                Don't have a Recipient ID? <Link href="/recipient/register" className="text-red-600 underline">Register Here</Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function RequestPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RequestForm />
        </Suspense>
    )
}
