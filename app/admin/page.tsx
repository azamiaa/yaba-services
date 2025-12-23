'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Users, Calendar, FileText, Activity } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        appointments: 0,
        services: 0,
        inquiries: 0,
        active_users: 0
    })
    const [siteName, setSiteName] = useState('Yaba')

    useEffect(() => {
        const fetchData = async () => {
            // Parallel fetching for dashboard stats and settings
            const [
                { count: apptCount },
                { count: servCount },
                { count: inqCount },
                { count: usersCount },
                { data: settingsData }
            ] = await Promise.all([
                supabase.from('appointments').select('*', { count: 'exact', head: true }),
                supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('inquiries').select('*', { count: 'exact', head: true }),
                supabase.from('user_roles').select('*', { count: 'exact', head: true }),
                (supabase.from('site_settings') as any).select('value').eq('key', 'site_name').single()
            ])

            setStats({
                appointments: apptCount || 0,
                services: servCount || 0,
                inquiries: inqCount || 0,
                active_users: usersCount || 0
            })

            if (settingsData && settingsData.value) {
                const val = typeof settingsData.value === 'string' ? settingsData.value.replace(/^"|"$/g, '') : settingsData.value
                setSiteName(val)
            }
        }
        fetchData()
    }, [])

    const cards = [
        { label: 'Total Appointments', value: stats.appointments, icon: Calendar, color: 'bg-blue-500' },
        { label: 'Active Services', value: stats.services, icon: Activity, color: 'bg-green-500' },
        { label: 'Pending Inquiries', value: stats.inquiries, icon: FileText, color: 'bg-orange-500' },
        { label: 'System Users', value: stats.active_users, icon: Users, color: 'bg-indigo-500' },
    ]

    const quickActions = [
        { label: 'New Service', href: '/admin/services/create', icon: Activity, color: 'bg-black text-white' },
        { label: 'Add Notice', href: '/admin/notices/create', icon: FileText, color: 'bg-white text-black border border-gray-200' },
        { label: 'View Appointments', href: '/admin/appointments', icon: Calendar, color: 'bg-white text-black border border-gray-200' },
    ]

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-gray-500">Welcome back to {siteName} Admin Portal.</p>
            </div>

            {/* Quick Actions - App like grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                    <a
                        key={action.label}
                        href={action.href}
                        className={`p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all active-scale tap-highlight-none ${action.color} shadow-sm`}
                    >
                        <action.icon size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest">{action.label}</span>
                    </a>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition active-scale tap-highlight-none translate-z-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{card.label}</p>
                            <h3 className="text-2xl font-bold">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Recent Activity</h2>
                    <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition">Refresh</button>
                </div>
                <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                    Activity Graph Placeholder
                </div>
            </div>
        </div>
    )
}
