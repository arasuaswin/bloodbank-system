import jwt from 'jsonwebtoken'

function getSecret(): string {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) throw new Error("NEXTAUTH_SECRET environment variable is required")
    return secret
}

export function signVerificationToken(email: string) {
    return jwt.sign({ email, verified: true }, getSecret(), { expiresIn: '1h' })
}

export function verifyRegistrationToken(token: string) {
    try {
        const decoded = jwt.verify(token, getSecret()) as unknown as { email: string, verified: boolean }
        return decoded
    } catch (e) {
        return null
    }
}

