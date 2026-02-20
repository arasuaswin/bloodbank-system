import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

interface UserWithRole {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: "admin" | "donor"
}

async function getUser(email: string): Promise<UserWithRole | null> {
    try {
        // 1. Check Admin Table
        const admin = await prisma.users.findFirst({
            where: { email: email }
        })
        if (admin) {
            return {
                id: admin.id.toString(),
                name: admin.name,
                email: admin.email,
                password: admin.password,
                role: "admin"
            }
        }

        // 2. Check Donor Table
        const donor = await prisma.donor.findFirst({
            where: {
                D_email: email
            }
        })
        if (donor) {
            return {
                id: donor.D_id.toString(),
                name: donor.D_name,
                email: donor.D_email,
                password: donor.password,
                role: "donor"
            }
        }

        return null
    } catch (error) {
        console.error('Failed to fetch user:', error)
        return null
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user = await getUser(email)
                    if (!user) return null
                    if (!user.password) return null

                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        }
                    }
                }
                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.role) {
                session.user.role = token.role as "admin" | "donor"
                session.user.id = token.id as string
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
    },
    trustHost: true,
})
