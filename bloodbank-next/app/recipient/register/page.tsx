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

const recipientSchema = z.object({
    reci_name: z.string().min(2, "Name must be at least 2 characters"),
    reci_age: z.coerce.number().min(1, "Age required").max(120, "Invalid age"),
    reci_sex: z.enum(["Male", "Female", "Other"]),
    reci_phno: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    reci_bgrp: z.string().min(1, "Blood group required"),
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
                title: "Registration Successful!",
                description: `Your Recipient ID is ${data.reci_id}. Please save this for future blood requests.`,
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

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            <Card className="max-w-xl mx-auto shadow-lg border-t-4 border-t-red-600">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Recipient Registration</CardTitle>
                    <p className="text-center text-sm text-gray-500 mt-2">
                        Register to request blood. You will receive a Recipient ID to use for all future requests.
                    </p>
                </CardHeader>
                <CardContent>
                    {recipientId && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                            <p className="text-sm text-green-700 font-medium">Registration Successful!</p>
                            <p className="text-2xl font-bold text-green-800 mt-1">Your ID: {recipientId}</p>
                            <p className="text-xs text-green-600 mt-1">Save this ID to make blood requests.</p>
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="reci_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your full name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="reci_age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Age" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="reci_sex"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
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
                            </div>

                            <FormField
                                control={form.control}
                                name="reci_phno"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="10-digit phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reci_bgrp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blood Group Needed</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Blood Group" />
                                                </SelectTrigger>
                                            </FormControl>
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

                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                                Register as Recipient
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
