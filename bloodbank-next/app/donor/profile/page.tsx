"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const profileSchema = z.object({
    D_name: z.string(), // Read only
    D_email: z.string(), // Read only
    D_phno: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    D_weight: z.coerce.number().min(45, "Weight must be at least 45kg"),
    D_address: z.string().max(100).optional(),
    diseases: z.string().optional(),
    D_bgrp: z.string().min(1, "Blood group required"),
    D_age: z.coerce.number().min(18).max(65),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function DonorProfilePage() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as any,
    })

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch('/api/donor/profile')
                if (!res.ok) throw new Error("Failed to search profile")
                const data = await res.json()
                form.reset({
                    D_name: data.D_name || "",
                    D_email: data.D_email || "",
                    D_phno: data.D_phno || "",
                    D_weight: data.D_weight || undefined,
                    D_address: data.D_address || "",
                    diseases: data.diseases || "",
                    D_bgrp: data.D_bgrp || undefined,
                    D_age: data.D_age || undefined,
                })
            } catch (error) {
                toast({ title: "Error", description: "Could not load profile", variant: "destructive" })
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [form, toast])

    async function onSubmit(values: ProfileFormValues) {
        setIsSaving(true)
        try {
            const res = await fetch('/api/donor/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error?.[0]?.message || "Failed to update")
            }

            toast({ title: "Success", description: "Profile updated successfully" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <FormLabel>Name</FormLabel>
                                    <Input value={form.getValues('D_name') || ''} disabled className="bg-gray-100" />
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>Email</FormLabel>
                                    <Input value={form.getValues('D_email') || ''} disabled className="bg-gray-100" />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="D_phno"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="D_age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age</FormLabel>
                                            <FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="D_weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (kg)</FormLabel>
                                            <FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="D_bgrp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Blood Group</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
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

                            <FormField
                                control={form.control}
                                name="D_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
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
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
