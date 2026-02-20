"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Shield } from "lucide-react"

const profileSchema = z.object({
    D_name: z.string(),
    D_email: z.string(),
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
    // Use a ref to track if we've already fetched, preventing re-fetch loops
    const hasFetched = useRef(false)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as any,
        defaultValues: {
            D_name: "",
            D_email: "",
            D_phno: "",
            D_weight: undefined,
            D_address: "",
            diseases: "",
            D_bgrp: "",
            D_age: undefined,
        }
    })

    // Empty dependency array — runs once on mount only
    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        async function fetchProfile() {
            try {
                const res = await fetch('/api/donor/profile')
                if (!res.ok) throw new Error("Failed to fetch profile")
                const data = await res.json()
                form.reset({
                    D_name: data.D_name ?? "",
                    D_email: data.D_email ?? "",
                    D_phno: data.D_phno ?? "",
                    D_weight: data.D_weight ?? undefined,
                    D_address: data.D_address ?? "",
                    diseases: data.diseases ?? "",
                    D_bgrp: data.D_bgrp ?? "",
                    D_age: data.D_age ?? undefined,
                })
            } catch {
                toast({ title: "Error", description: "Could not load profile", variant: "destructive" })
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
            toast({ title: "Profile Updated ✅", description: "Your changes have been saved." })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 gap-4">
                <Loader2 className="animate-spin w-10 h-10 text-red-500" />
                <p className="text-muted-foreground text-sm">Loading your profile...</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <User className="w-6 h-6 text-red-600" /> My Profile
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Update your contact and health information. Name and email are locked for security.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Read-only section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <FormLabel>Full Name</FormLabel>
                                    <Input
                                        value={form.watch('D_name')}
                                        disabled
                                        className="bg-gray-100 dark:bg-zinc-800"
                                        readOnly
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Locked — contact admin to change
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>Email Address</FormLabel>
                                    <Input
                                        value={form.watch('D_email')}
                                        disabled
                                        className="bg-gray-100 dark:bg-zinc-800"
                                        readOnly
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="D_phno"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    placeholder="10-digit mobile number"
                                                    maxLength={10}
                                                />
                                            </FormControl>
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
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 25"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="D_weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (kg) <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 65 (min 45kg)"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                                />
                                            </FormControl>
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
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value ?? ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select blood group" />
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
                            </div>

                            <FormField
                                control={form.control}
                                name="D_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="e.g. Anna Nagar, Chennai, Tamil Nadu"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="diseases"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medical Conditions (if any)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="e.g. None, Mild Anaemia, Controlled Diabetes"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">This information helps assess your donation eligibility (NBTC guideline).</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 h-11 font-semibold"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : "Save Changes"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
