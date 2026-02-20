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
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

// Define the validation schema matching the Prisma model (without token verification)
const donorSchema = z.object({
    D_name: z.string().min(2, "Name must be at least 2 characters"),
    D_age: z.coerce.number().min(18, "Must be at least 18"),
    D_sex: z.enum(["Male", "Female", "Other"]),
    D_phno: z.string().length(10, "Phone number must be 10 digits"),
    D_bgrp: z.string().min(1, "Blood group is required"),
    D_weight: z.coerce.number().optional().or(z.literal('')),
    D_email: z.string().email("Invalid email address"),
    D_address: z.string().optional().or(z.literal('')),
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

    // UI State
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
                title: "Registration Successful!",
                description: "You can now login as a donor.",
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
                            Become a Donor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Personal Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="D_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                                                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
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
                                                <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
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
                                                <FormControl><Input type="password" placeholder="******" {...field} /></FormControl>
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
                                                <FormControl><Input type="number" {...field} /></FormControl>
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
                                </div>

                                {/* Address */}
                                <FormField
                                    control={form.control}
                                    name="D_address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl><Input placeholder="City, State" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Health Details */}
                                <div className="border-t pt-6 mt-2">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Health Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="D_weight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Weight (kg)</FormLabel>
                                                    <FormControl><Input type="number" placeholder="e.g. 65" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="HLevel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Hemoglobin Level</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="normal">Normal</SelectItem>
                                                            <SelectItem value="low">Low</SelectItem>
                                                            <SelectItem value="high">High</SelectItem>
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
                                                            <SelectItem value="normal">Normal</SelectItem>
                                                            <SelectItem value="low">Low</SelectItem>
                                                            <SelectItem value="high">High</SelectItem>
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
                                                            <SelectItem value="normal">Normal</SelectItem>
                                                            <SelectItem value="low">Low</SelectItem>
                                                            <SelectItem value="high">High</SelectItem>
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
                                                <FormItem>
                                                    <FormLabel>Diseases (if any)</FormLabel>
                                                    <FormControl><Input placeholder="e.g. None, Diabetes" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Complete Registration
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
