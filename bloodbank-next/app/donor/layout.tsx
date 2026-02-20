import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DonorSidebar from "./DonorSidebar"

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session || session.user.role !== 'donor') {
        redirect("/login")
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-900">
            <DonorSidebar />
            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
