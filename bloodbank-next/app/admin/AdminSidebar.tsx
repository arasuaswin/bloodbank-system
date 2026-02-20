"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Droplets, FileText, CalendarCheck, UserCheck, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

const sidebarItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/donors", label: "Donors", icon: Users },
    { href: "/admin/stock", label: "Blood Stock", icon: Droplets },
    { href: "/admin/requests", label: "Requests", icon: FileText },
    { href: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
    { href: "/admin/recipients", label: "Recipients", icon: UserCheck },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle sidebar"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:static z-40 w-64 bg-white dark:bg-zinc-800 border-r min-h-screen flex flex-col transition-transform",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-red-600">Admin Panel</h2>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-red-50 text-red-600"
                                    : "text-gray-600 hover:bg-gray-100",
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-600 hover:bg-red-50"
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>
        </>
    )
}
