import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const session = await auth()
    const isAuth = !!session
    const role = session?.user?.role

    const isAuthPage = request.nextUrl.pathname.startsWith('/login')
    const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
    const isDonorPage = request.nextUrl.pathname.startsWith('/donor')

    if (isAuthPage) {
        if (isAuth) {
            if (role === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url))
            } else if (role === 'donor') {
                return NextResponse.redirect(new URL('/donor/dashboard', request.url))
            }
        }
        return null
    }

    if (isAdminPage) {
        if (!isAuth) return NextResponse.redirect(new URL('/login', request.url))
        if (role !== 'admin') {
            // If logged in as donor but trying to access admin, redirect to donor dashboard
            return NextResponse.redirect(new URL('/donor/dashboard', request.url))
        }
    }

    if (isDonorPage) {
        if (!isAuth) return NextResponse.redirect(new URL('/login', request.url))
        if (role !== 'donor') {
            // If logged in as admin but trying to access donor, allow it? Or redirect?
            // Usually admins shouldn't see donor dashboard unless impersonating.
            // Let's redirect to admin dashboard to keep strict separation.
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
    }

    return null
}

export const config = {
    matcher: ['/admin/:path*', '/donor/:path*', '/login'],
}
