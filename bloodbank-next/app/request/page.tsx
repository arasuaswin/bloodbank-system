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

const requestSchema = z.object({
    reci_name: z.string().min(2, "Name required"),
    reci_id: z.coerce.number().min(1, "Recipient ID required"),
    reci_bgrp: z.string().min(1, "Blood group required"),
    reci_bqnty: z.coerce.number().min(1, "Quantity required"),
})

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
        },
    })

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
                title: "Request Submitted!",
                description: "We will process your request shortly.",
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
                    <CardTitle className="text-2xl text-center">Request Blood</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="reci_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recipient Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reci_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recipient ID</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter ID received during registration" {...field} />
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
                                        <FormLabel>Blood Group Required</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="reci_bqnty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity (Units)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                                Submit Request
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
