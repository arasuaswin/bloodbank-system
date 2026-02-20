"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, AlertTriangle, Droplet, Info } from "lucide-react"
import Footer from "@/components/Footer"

const schema = z.object({
    age: z.coerce.number().min(1, "Required"),
    weight: z.coerce.number().min(1, "Required"),
    lastDonation: z.string().optional(),
    haemoglobin: z.string().min(1, "Required"),
    bp: z.string().min(1, "Required"),
    diabetes: z.string().min(1, "Required"),
    malaria: z.string().min(1, "Required"),
    hiv: z.string().min(1, "Required"),
    pregnant: z.string().min(1, "Required"),
    tattoo: z.string().min(1, "Required"),
    surgery: z.string().min(1, "Required"),
})

type FormValues = z.infer<typeof schema>

interface EligibilityResult {
    eligible: boolean
    reasons: string[]
    tips: string[]
    waitDays?: number
}

function checkEligibility(values: FormValues): EligibilityResult {
    const reasons: string[] = []
    const tips: string[] = []

    if (values.age < 18) reasons.push("You must be at least 18 years old to donate blood (NBTC guideline).")
    if (values.age > 65) reasons.push("Donors above 65 years are not eligible as per NBTC guidelines.")
    if (values.weight < 45) reasons.push("Minimum weight required is 45 kg (ICMR standard).")
    if (values.haemoglobin === "low") reasons.push("Haemoglobin below 12.5 g/dL (women) / 13 g/dL (men) makes you ineligible. Eat iron-rich foods like spinach, jaggery, and lentils.")
    if (values.bp === "high") reasons.push("Uncontrolled high blood pressure (>180/100 mmHg) temporarily disqualifies you.")
    if (values.bp === "low") reasons.push("Very low blood pressure may be a temporary disqualification. Consult your doctor.")
    if (values.diabetes === "yes") reasons.push("Insulin-dependent diabetes disqualifies you. Oral medication diabetics may be eligible — consult blood bank doctor.")
    if (values.malaria === "yes") reasons.push("You must wait at least 3 months after recovering from malaria to donate.")
    if (values.hiv === "yes") reasons.push("HIV positive individuals are permanently deferred from donating blood.")
    if (values.pregnant === "yes") reasons.push("Pregnant women and those within 12 months of delivery / breastfeeding cannot donate.")
    if (values.tattoo === "yes") reasons.push("You must wait 12 months after getting a tattoo or piercing before donating.")
    if (values.surgery === "yes") reasons.push("You must wait 6–12 months after major surgery before donating (depends on procedure).")

    // Check last donation gap (90 days for whole blood — ICMR)
    let waitDays: number | undefined
    if (values.lastDonation) {
        const last = new Date(values.lastDonation)
        const today = new Date()
        const daysSince = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSince < 90) {
            waitDays = 90 - daysSince
            reasons.push(`You last donated ${daysSince} days ago. ICMR requires a 90-day gap for whole blood. Please wait ${waitDays} more days.`)
        }
    }

    if (reasons.length === 0) {
        tips.push("Drink 500ml of water before donation.")
        tips.push("Have a light meal 2–3 hours before going to the blood bank.")
        tips.push("Avoid alcohol for 24 hours before and after donation.")
        tips.push("After donation, rest for 15 minutes and have provided refreshments.")
        tips.push("Avoid riding motorcycles/scooters for 2 hours after donation (NBTC advice).")
        tips.push("Keep the bandage on for at least 4 hours post-donation.")
    }

    return { eligible: reasons.length === 0, reasons, tips, waitDays }
}

export default function EligibilityPage() {
    const [result, setResult] = useState<EligibilityResult | null>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            age: undefined,
            weight: undefined,
            lastDonation: "",
            haemoglobin: "",
            bp: "",
            diabetes: "",
            malaria: "",
            hiv: "",
            pregnant: "",
            tattoo: "",
            surgery: "",
        },
    })

    function onSubmit(values: FormValues) {
        setResult(checkEligibility(values))
        window.scrollTo({ top: 9999, behavior: "smooth" })
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-4 text-center">
                <div className="container mx-auto max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
                        <Droplet className="w-4 h-4" /> NBTC / ICMR Guidelines Based
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Am I Eligible to Donate?</h1>
                    <p className="text-red-100 text-lg max-w-xl mx-auto">
                        Answer a few quick questions based on Indian blood donation standards to instantly find out if you can donate today. No login required.
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-3xl px-4 py-12">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="w-5 h-5 text-red-600" /> Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="age" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age (years) <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g. 25" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="weight" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight (kg) <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g. 60" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="lastDonation" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Blood Donation Date <span className="text-gray-400 text-xs">(optional)</span></FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🩺 Health Parameters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { name: "haemoglobin", label: "Haemoglobin Level", options: [{ value: "normal", label: "Normal (≥12.5 g/dL)" }, { value: "low", label: "Low (<12.5 g/dL)" }, { value: "unknown", label: "Not Sure" }] },
                                    { name: "bp", label: "Blood Pressure", options: [{ value: "normal", label: "Normal (120/80)" }, { value: "high", label: "High (>180/100)" }, { value: "low", label: "Low (<90/60)" }] },
                                    { name: "diabetes", label: "Diabetes (Insulin-dependent)?", options: [{ value: "no", label: "No" }, { value: "oral", label: "Yes, oral medications only" }, { value: "yes", label: "Yes, insulin injections" }] },
                                    { name: "malaria", label: "Malaria in last 3 months?", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
                                    { name: "hiv", label: "HIV Positive?", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
                                    { name: "pregnant", label: "Pregnant / Breastfeeding?", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
                                    { name: "tattoo", label: "Tattoo/Piercing in last 12 months?", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
                                    { name: "surgery", label: "Major surgery in last 6 months?", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
                                ].map(({ name, label, options }) => (
                                    <FormField key={name} control={form.control} name={name as any} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{label} <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                ))}
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 h-12 text-base font-semibold">
                            Check My Eligibility →
                        </Button>
                    </form>
                </Form>

                {/* Result */}
                {result && (
                    <div className="mt-10">
                        {result.eligible ? (
                            <Card className="border-green-300 bg-green-50 dark:bg-green-900/20">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                        <div>
                                            <h3 className="text-xl font-bold text-green-700">You are Eligible to Donate! 🎉</h3>
                                            <p className="text-green-600 text-sm">Based on NBTC / ICMR India guidelines. Visit your nearest blood bank.</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-green-200 pt-4">
                                        <h4 className="font-semibold text-green-800 mb-3">Tips Before You Go:</h4>
                                        <ul className="space-y-2">
                                            {result.tips.map((t, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                                                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />{t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <a href="/register">
                                            <Button className="bg-green-600 hover:bg-green-700">Register as Donor</Button>
                                        </a>
                                        <a href="/search">
                                            <Button variant="outline" className="border-green-400 text-green-700">Find Blood Bank</Button>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-red-300 bg-red-50 dark:bg-red-900/20">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <XCircle className="w-10 h-10 text-red-600" />
                                        <div>
                                            <h3 className="text-xl font-bold text-red-700">Not Eligible to Donate Right Now</h3>
                                            <p className="text-red-500 text-sm">Don't worry — many reasons are temporary. See details below.</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-red-200 pt-4">
                                        <h4 className="font-semibold text-red-800 mb-3">Reasons:</h4>
                                        <ul className="space-y-2">
                                            {result.reasons.map((r, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                                                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />{r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {result.waitDays && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                                            ⏳ You can donate again in approximately <strong>{result.waitDays} days</strong>.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        <p className="text-xs text-gray-400 mt-4 text-center">
                            This checker is based on NBTC / ICMR guidelines. For definitive assessment, visit a licensed blood bank doctor.
                        </p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
