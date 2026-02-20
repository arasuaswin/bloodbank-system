"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Menu, X, Droplet } from "lucide-react"
import { cn } from "@/lib/utils"

const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Find Blood" },
    { href: "/request", label: "Request Blood" },
    { href: "/register", label: "Become a Donor" },
]

export default function Navbar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)

    // Hide navbar on admin and donor portal pages (they have their own sidebar)
    if (pathname.startsWith("/admin") || pathname.startsWith("/donor")) {
        return null
    }

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <Droplet className="h-6 w-6 text-red-600" />
                        <span><span className="text-red-600">Blood</span>Bank</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {publicLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-red-600",
                                    pathname === link.href
                                        ? "text-red-600"
                                        : "text-gray-600"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {session ? (
                            <Link
                                href={session.user.role === 'admin' ? '/admin/dashboard' : '/donor/dashboard'}
                                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 border-t mt-2 pt-4">
                        <div className="flex flex-col gap-3">
                            {publicLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium px-3 py-2 rounded-md transition-colors",
                                        pathname === link.href
                                            ? "bg-red-50 text-red-600"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {session ? (
                                <Link
                                    href={session.user.role === 'admin' ? '/admin/dashboard' : '/donor/dashboard'}
                                    className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
