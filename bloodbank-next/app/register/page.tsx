"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, Mail } from "lucide-react"

const donorSchema = z.object({
    D_name: z.string().min(2, "Name must be at least 2 characters"),
    D_age: z.coerce.number().min(18, "Must be at least 18").max(65, "Must be under 65"),
    D_sex: z.enum(["Male", "Female", "Other"]),
    D_phno: z.string().regex(/^\d{10}$/, "Must be 10 digits"),
    D_bgrp: z.string().min(1, "Blood group is required"),
    D_weight: z.coerce.number().min(45, "Weight must be at least 45kg").optional(),
    D_email: z.string().email("Invalid email"),
    D_address: z.string().max(100).optional().or(z.literal('')),
    last_donation: z.string().optional().or(z.literal('')),
    diseases: z.string().optional().or(z.literal('')),
    HLevel: z.string().optional().or(z.literal('')),
    BS: z.string().optional().or(z.literal('')),
    BP: z.string().optional().or(z.literal('')),
    password: z.string().min(6, "Password must be at least 6 characters"),
    verificationToken: z.string().min(1, "Email must be verified")
})

type DonorFormValues = z.infer<typeof donorSchema>

export default function RegisterDonor() {
    const { toast } = useToast()
    const router = useRouter()

    // 0: Input Email, 1: Verify OTP, 2: Fill Details
    const [step, setStep] = useState(0)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [verificationToken, setVerificationToken] = useState("")
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
            password: "",
            verificationToken: ""
        },
    })

    // Step 1: Send OTP
    async function handleSendOtp() {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" })
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'send', email })
            })
            if (!res.ok) throw new Error("Failed to send OTP")
            toast({ title: "OTP Sent", description: "Check your email for the code." })
            setStep(1)
        } catch (error) {
            toast({ title: "Error", description: "Could not send OTP. Try again.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP
    async function handleVerifyOtp() {
        if (!otp) return
        setLoading(true)
        try {
            const res = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify', email, otp })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Invalid OTP")

            setVerificationToken(data.token)
            form.setValue('verificationToken', data.token)
            form.setValue('D_email', email)
            toast({ title: "Verified!", description: "Email verified successfully.", className: "bg-green-600 text-white" })
            setStep(2)
        } catch (error: any) {
            toast({ title: "Verification Failed", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    async function onSubmit(values: DonorFormValues) {
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
                        {step === 0 && (
                            <div className="space-y-6 max-w-md mx-auto text-center">
                                <h3 className="text-xl font-semibold">Step 1: Verify Email</h3>
                                <p className="text-gray-500">We need to verify your email before registration.</p>
                                <div className="space-y-4">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="text-center text-lg"
                                    />
                                    <Button onClick={handleSendOtp} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Mail className="mr-2 h-4 w-4" />}
                                        Send OTP
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-6 max-w-md mx-auto text-center">
                                <h3 className="text-xl font-semibold">Step 2: Enter OTP</h3>
                                <p className="text-gray-500">Enter the code sent to {email}</p>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="text-center text-2xl tracking-widest"
                                        maxLength={6}
                                    />
                                    <Button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        Verify OTP
                                    </Button>
                                    <Button variant="ghost" onClick={() => setStep(0)} className="text-sm">Change Email</Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="bg-green-50 p-4 rounded-lg flex items-center gap-2 text-green-700 mb-6">
                                        <CheckCircle className="h-5 w-5" />
                                        <span>Email Verified: <strong>{email}</strong></span>
                                    </div>

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

                                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4">
                                        Complete Registration
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
