'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [authorized, setAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [userRole, setUserRole] = useState<'admin' | 'editor' | 'user' | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    router.push('/login?redirect=admin')
                    return
                }

                const { data: roleData, error } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', session.user.id)
                    .single()

                if (error || !roleData) {
                    router.push('/')
                    return
                }

                const role = (roleData as any).role
                if (!['admin', 'editor'].includes(role)) {
                    router.push('/')
                    return
                }

                setUserRole(role)
                setAuthorized(true)
            } catch (e) {
                console.error('Auth check failed', e)
                router.push('/')
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [router])

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        )
    }

    if (!authorized) return null

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden text-black">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                userRole={userRole || 'admin'}
            />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
