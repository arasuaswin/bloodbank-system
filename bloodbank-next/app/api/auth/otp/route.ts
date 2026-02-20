import { NextResponse } from 'next/server'
import { EmailTemplates } from "@/lib/email-templates"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { signVerificationToken } from "@/lib/jwt"
import { z } from 'zod'

// Helper to generate 6 digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { action, email, otp } = body

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        if (action === 'send') {
            // 1. Generate OTP
            const code = generateOTP()
            const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

            // 2. Delete old tokens for this email, then create new one
            await prisma.verification_token.deleteMany({
                where: { identifier: email }
            })

            await prisma.verification_token.create({
                data: {
                    identifier: email,
                    token: code,
                    expires: expires
                }
            })

            // 3. Send Email
            await sendEmail(
                email,
                "Your Verification Code",
                EmailTemplates.otp(code)
            )

            return NextResponse.json({ message: "OTP sent" })
        }

        else if (action === 'verify') {
            if (!otp) return NextResponse.json({ error: "OTP is required" }, { status: 400 })

            // 1. Find Token
            const record = await prisma.verification_token.findFirst({
                where: {
                    identifier: email,
                    token: otp,
                    expires: { gt: new Date() }
                }
            })

            if (!record) {
                return NextResponse.json({ error: "Invalid or Expired OTP" }, { status: 400 })
            }

            // 2. Generate Registration Token (JWT)
            const token = signVerificationToken(email)

            // 3. Cleanup Used Token
            await prisma.verification_token.delete({
                where: { identifier_token: { identifier: email, token: otp } }
            })

            return NextResponse.json({ message: "Verified", token })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    } catch (error) {
        console.error("OTP Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
