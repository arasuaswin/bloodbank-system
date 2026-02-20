import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "./AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        redirect("/login")
    }

    // const pathname = usePathname() // Cannot use usePathname in Server Component. 
    // We need to move the sidebar to a Client Component or make this a Client Component.
    // However, making the layout async for auth() implies Server Component.
    // If we want to use usePathname, we should extract the Sidebar to a separate Client Component.

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-900">
            <AdminSidebar />
            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
