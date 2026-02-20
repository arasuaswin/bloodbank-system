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
import { useState } from "react"
import { UserCheck, Hospital, AlertTriangle } from "lucide-react"
import Link from "next/link"

const recipientSchema = z.object({
    reci_name: z.string().min(2, "Name must be at least 2 characters"),
    reci_age: z.coerce.number().min(1, "Age required").max(120, "Invalid age"),
    reci_sex: z.enum(["Male", "Female", "Other"]),
    reci_phno: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    reci_bgrp: z.string().min(1, "Blood group required"),
    reci_hospital: z.string().min(2, "Hospital name required"),
    reci_doctor: z.string().optional().or(z.literal('')),
    reci_address: z.string().optional().or(z.literal('')),
    reci_urgency: z.string().default("Normal"),
    reci_purpose: z.string().min(1, "Purpose required"),
})

export default function RecipientRegister() {
    const { toast } = useToast()
    const [recipientId, setRecipientId] = useState<number | null>(null)

    const form = useForm<z.infer<typeof recipientSchema>>({
        resolver: zodResolver(recipientSchema) as any,
        defaultValues: {
            reci_name: "",
            reci_age: 0,
            reci_sex: undefined,
            reci_phno: "",
            reci_bgrp: "",
            reci_hospital: "",
            reci_doctor: "",
            reci_address: "",
            reci_urgency: "Normal",
            reci_purpose: "",
        },
    })

    async function onSubmit(values: z.infer<typeof recipientSchema>) {
        try {
            const response = await fetch('/api/recipient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Registration failed")
            }

            setRecipientId(data.reci_id)
            toast({
                title: "Registration Successful! ✅",
                description: `Your Recipient ID is ${data.reci_id}. Save this to make blood requests.`,
            })

            form.reset()
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const selectedUrgency = form.watch('reci_urgency')

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            <Card className="max-w-2xl mx-auto shadow-lg border-t-4 border-t-red-600">
                <CardHeader>
                    <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                        <UserCheck className="w-6 h-6 text-red-600" /> Recipient Registration
                    </CardTitle>
                    <p className="text-center text-sm text-gray-500 mt-2">
                        Register the patient/recipient to request blood. You will receive a Recipient ID for all future requests.
                    </p>
                </CardHeader>
                <CardContent>
                    {recipientId && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                            <p className="text-sm text-green-700 font-medium">Registration Successful!</p>
                            <p className="text-3xl font-bold text-green-800 mt-1">Your ID: {recipientId}</p>
                            <p className="text-xs text-green-600 mt-2">⚠️ Save this ID — you need it to request blood.</p>
                            <Link href={`/request?reci_id=${recipientId}`}>
                                <Button className="mt-3 bg-red-600 hover:bg-red-700" size="sm">
                                    Request Blood Now →
                                </Button>
                            </Link>
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Patient Details */}
                            <div>
                                <h3 className="text-base font-semibold mb-3 text-gray-700">👤 Patient Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="reci_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                                                <FormControl><Input placeholder="e.g. Priya Devi" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="reci_phno"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                                                <FormControl><Input placeholder="9876543210" maxLength={10} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="reci_age"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Age <span className="text-red-500">*</span></FormLabel>
                                                <FormControl><Input type="number" placeholder="Age" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="reci_sex"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Male">Male</SelectItem>
                                                        <SelectItem value="Female">Female</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="reci_bgrp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Blood Group Needed <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="reci_address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Patient Address</FormLabel>
                                                <FormControl><Input placeholder="e.g. T. Nagar, Chennai" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Hospital & Medical Details */}
                            <div className="border-t pt-6">
                                <h3 className="text-base font-semibold mb-3 text-gray-700 flex items-center gap-2">
                                    <Hospital className="w-4 h-4" /> Hospital & Medical Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="reci_hospital"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hospital Name <span className="text-red-500">*</span></FormLabel>
                                                <FormControl><Input placeholder="e.g. Apollo Hospital, Chennai" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="reci_doctor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Attending Doctor</FormLabel>
                                                <FormControl><Input placeholder="e.g. Dr. Suresh Kumar" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="reci_purpose"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Purpose <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Surgery">Surgery</SelectItem>
                                                        <SelectItem value="Accident">Accident / Trauma</SelectItem>
                                                        <SelectItem value="Thalassemia">Thalassemia</SelectItem>
                                                        <SelectItem value="Cancer">Cancer Treatment</SelectItem>
                                                        <SelectItem value="Pregnancy">Pregnancy / Delivery</SelectItem>
                                                        <SelectItem value="Anaemia">Severe Anaemia</SelectItem>
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
                                        name="reci_urgency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Urgency Level <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || "Normal"}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select urgency" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Normal">🟢 Normal (within 48 hrs)</SelectItem>
                                                        <SelectItem value="Urgent">🟡 Urgent (within 12 hrs)</SelectItem>
                                                        <SelectItem value="Critical">🔴 Critical (immediate)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Critical Warning */}
                            {selectedUrgency === "Critical" && (
                                <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-800">Critical Request</p>
                                        <p className="text-xs text-red-600">For life-threatening emergencies, also call <strong>104 (NBTC Toll-Free)</strong> or <strong>1800-180-1104</strong> immediately.</p>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                                Register as Recipient
                            </Button>

                            <p className="text-center text-sm text-gray-500">
                                Already have an ID? <Link href="/request" className="text-red-600 underline">Request Blood directly</Link>
                            </p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
