"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, Shield, Heart } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman & Nicobar", "Chandigarh", "Dadra & Nagar Haveli",
    "Daman & Diu", "Delhi", "Jammu & Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry",
]

const donorSchema = z.object({
    D_name: z.string().min(2, "Name must be at least 2 characters"),
    D_age: z.coerce.number().min(18, "Must be at least 18 (NBTC)").max(65, "Max age 65 for donation"),
    D_sex: z.enum(["Male", "Female", "Other"]),
    D_phno: z.string().length(10, "Phone number must be 10 digits"),
    D_bgrp: z.string().min(1, "Blood group is required"),
    D_weight: z.coerce.number().min(45, "Minimum 45 kg required (NBTC)").optional().or(z.literal('')),
    D_email: z.string().email("Invalid email address"),
    D_address: z.string().optional().or(z.literal('')),
    D_state: z.string().min(1, "State is required"),
    D_aadhaar: z.string().length(4, "Enter last 4 digits of Aadhaar").optional().or(z.literal('')),
    D_donation_type: z.string().default("Whole Blood"),
    last_donation: z.string().optional().or(z.literal('')),
    diseases: z.string().optional().or(z.literal('')),
    HLevel: z.string().optional().or(z.literal('')),
    BS: z.string().optional().or(z.literal('')),
    BP: z.string().optional().or(z.literal('')),
    password: z.string().min(6, "Password must be at least 6 characters")
})

type DonorFormValues = z.infer<typeof donorSchema>

export default function RegisterDonor() {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<DonorFormValues>({
        resolver: zodResolver(donorSchema) as any,
        defaultValues: {
            D_name: "",
            D_sex: "Male",
            D_phno: "",
            D_bgrp: "",
            D_age: undefined,
            D_weight: undefined,
            D_email: "",
            D_address: "",
            D_state: "",
            D_aadhaar: "",
            D_donation_type: "Whole Blood",
            last_donation: "",
            diseases: "",
            HLevel: "",
            BS: "",
            BP: "",
            password: ""
        },
    })

    async function onSubmit(values: DonorFormValues) {
        setLoading(true)
        try {
            const payload = {
                ...values,
                last_donation: values.last_donation ? new Date(values.last_donation) : null
            }

            const response = await fetch('/api/donors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to register")
            }

            toast({
                title: "Registration Successful! ✅",
                description: "You can now login as a donor. Thank you for choosing to save lives.",
                className: "bg-green-600 text-white"
            })

            form.reset()
            router.push('/login')

        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen bg-slate-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl"
            >
                <Card className="shadow-2xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
                        <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
                            <Heart className="w-8 h-8" fill="white" /> Become a Donor
                        </CardTitle>
                        <p className="text-center text-red-100 text-sm mt-2">
                            रक्त दान, महादान — Your one donation can save up to 3 lives
                        </p>
                    </CardHeader>
                    <CardContent className="p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Personal Details */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                                        👤 Personal Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="D_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder="e.g. Rajan Kumar" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="D_email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input type="email" placeholder="rajan@gmail.com" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="D_phno"
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
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Set Password <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input type="password" placeholder="Min 6 characters" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="D_age"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Age <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input type="number" placeholder="18-65" {...field} /></FormControl>
                                                    <p className="text-xs text-muted-foreground">NBTC: 18–65 years eligible</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="D_sex"
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
                                            name="D_bgrp"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Blood Group <span className="text-red-500">*</span></FormLabel>
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
                                            name="D_state"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>State / UT <span className="text-red-500">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {INDIAN_STATES.map(s => (
                                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Address & ID */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="D_address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl><Input placeholder="e.g. Anna Nagar, Chennai" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="D_aadhaar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Aadhaar (Last 4 Digits)</FormLabel>
                                                <FormControl><Input placeholder="e.g. 4321" maxLength={4} {...field} /></FormControl>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Shield className="w-3 h-3" /> Used for NBTC identity verification only
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Health Details */}
                                <div className="border-t pt-6 mt-2">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                                        🩺 Health Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="D_weight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Weight (kg)</FormLabel>
                                                    <FormControl><Input type="number" placeholder="Min 45 kg (NBTC)" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="D_donation_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Preferred Donation Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value || "Whole Blood"}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Whole Blood">Whole Blood (350-450ml)</SelectItem>
                                                            <SelectItem value="Platelets">Platelets (SDP/RDP)</SelectItem>
                                                            <SelectItem value="Plasma">Plasma (FFP)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-xs text-muted-foreground">NBTC: Whole blood every 90 days, Platelets every 14 days</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="HLevel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Haemoglobin Level</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="normal">Normal (≥12.5 g/dL)</SelectItem>
                                                            <SelectItem value="low">Low (&lt;12.5 g/dL)</SelectItem>
                                                            <SelectItem value="high">High (&gt;17 g/dL)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="BS"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Blood Sugar</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="normal">Normal (70-100 mg/dL)</SelectItem>
                                                            <SelectItem value="low">Low (&lt;70 mg/dL)</SelectItem>
                                                            <SelectItem value="high">High (&gt;140 mg/dL)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="BP"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Blood Pressure</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="normal">Normal (120/80 mmHg)</SelectItem>
                                                            <SelectItem value="low">Low (&lt;90/60 mmHg)</SelectItem>
                                                            <SelectItem value="high">High (&gt;140/90 mmHg)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="last_donation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Donation Date</FormLabel>
                                                    <FormControl><Input type="date" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="diseases"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Medical Conditions (if any)</FormLabel>
                                                    <FormControl><Input placeholder="e.g. None, Controlled Diabetes, Mild Anaemia" {...field} /></FormControl>
                                                    <p className="text-xs text-muted-foreground">HIV/Hepatitis/Malaria history will affect eligibility per NBTC rules</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* NBTC Note */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                    <p className="font-semibold mb-1">📋 NBTC Eligibility Summary</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Age: 18–65 years &nbsp;|&nbsp; Weight: ≥45 kg &nbsp;|&nbsp; Hb: ≥12.5 g/dL</li>
                                        <li>BP: Systolic 100-140, Diastolic 60-90 mmHg</li>
                                        <li>No HIV, Hepatitis B/C, or active Malaria</li>
                                        <li>Gap: 90 days (Whole Blood), 14 days (Platelets), 48 hrs (Plasma)</li>
                                    </ul>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Complete Registration
                                </Button>

                                <p className="text-center text-sm text-gray-500">
                                    Already registered? <Link href="/login" className="text-red-600 underline">Login here</Link>
                                </p>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
