'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Images,
    FileText,
    Users,
    Settings,
    Calendar,
    MessageSquare,
    Bell,
    Layers,
    LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const sidebarItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Hero Services', href: '/admin/hero', icon: Images },
    { name: 'Services', href: '/admin/services', icon: Layers },
    { name: 'CMS Pages', href: '/admin/pages', icon: FileText },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Notices', href: '/admin/notices', icon: Bell },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Site Settings', href: '/admin/settings', icon: Settings },
    { name: 'Users & Roles', href: '/admin/users', icon: Users },
]

interface AdminSidebarProps {
    isOpen: boolean
    onClose: () => void
    userRole: 'admin' | 'editor' | 'user'
}

export function AdminSidebar({ isOpen, onClose, userRole }: AdminSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
        })
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <div className={cn(
                "fixed inset-y-0 left-0 w-72 bg-black text-white flex flex-col z-[70] transition-transform duration-300 transform md:relative md:translate-x-0 md:w-64 md:z-auto border-r border-white/10",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tighter uppercase">Admin</h1>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest">SERVICE PORTAL</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 md:hidden text-gray-400 hover:text-white"
                    >
                        <LogOut className="rotate-180" size={20} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
                    {sidebarItems.map((item) => {
                        // Roles restriction: editors cannot see Users & Roles
                        if (item.name === 'Users & Roles' && userRole === 'editor') {
                            return null
                        }
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    if (window.innerWidth < 768) onClose()
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all active-scale tap-highlight-none",
                                    isActive
                                        ? "bg-white text-black shadow-xl"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon size={18} className="shrink-0" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Profile & Footer */}
                <div className="p-4 border-t border-white/10 space-y-4">
                    {user && (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold border border-white/5">
                                {user.email?.[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold truncate text-gray-100">{user.email}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Admin Portal</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors active-scale"
                    >
                        <LogOut size={16} />
                        SIGN OUT
                    </button>
                </div>
            </div>
        </>
    )
}
