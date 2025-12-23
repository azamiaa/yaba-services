'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Menu } from 'lucide-react'

interface AdminHeaderProps {
    onMenuClick?: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
        })
    }, [])

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
                >
                    <Menu size={20} />
                </button>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider hidden sm:block">Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-bold text-black truncate max-w-[150px] sm:max-w-none">{user?.email}</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {user?.email?.[0].toUpperCase()}
                </div>
            </div>
        </header>
    )
}
