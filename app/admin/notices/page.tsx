'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Plus, Edit, Trash2, Bell, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Notice = Database['public']['Tables']['notices']['Row']

export default function NoticesAdmin() {
    const [notices, setNotices] = useState<Notice[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotices = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching notices:', error)
        if (data) setNotices(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchNotices()
    }, [])

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await (supabase.from('notices') as any)
            .update({ is_active: !currentStatus })
            .eq('id', id)

        if (!error) {
            setNotices(notices.map(n => n.id === id ? { ...n, is_active: !currentStatus } : n))
        }
    }

    const deleteNotice = async (id: string) => {
        if (!confirm('Are you sure?')) return

        const { error } = await supabase
            .from('notices')
            .delete()
            .eq('id', id)

        if (!error) {
            setNotices(notices.filter(n => n.id !== id))
        }
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notices</h1>
                    <p className="text-gray-500">Manage site-wide alerts and announcements.</p>
                </div>
                <Link href="/admin/notices/create">
                    <Button className="bg-black text-white hover:bg-gray-800 gap-2 active-scale shadow-lg">
                        <Plus size={16} /> Add Notice
                    </Button>
                </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Title</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Priority</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Expires</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase tracking-widest text-[10px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {notices.map((notice) => (
                            <tr key={notice.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Bell size={16} className="text-gray-400" />
                                        {notice.title}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{notice.content}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${notice.type === 'alert' ? 'bg-red-100 text-red-700' :
                                        notice.type === 'success' ? 'bg-green-100 text-green-700' :
                                            notice.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {notice.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider font-bold">
                                    {notice.end_date ? new Date(notice.end_date).toLocaleDateString() : 'Indefinite'}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(notice.id, notice.is_active || false)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${notice.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {notice.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                                        {notice.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <Link href={`/admin/notices/${notice.id}`}>
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition active-scale">
                                            <Edit size={16} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => deleteNotice(notice.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition active-scale"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {notices.map((notice) => (
                    <div key={notice.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 active-scale tap-highlight-none">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notice.type === 'alert' ? 'bg-red-50 text-red-600' :
                                    notice.type === 'success' ? 'bg-green-50 text-green-600' :
                                        notice.type === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                                            'bg-blue-50 text-blue-600'
                                    }`}>
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">{notice.title}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{notice.type}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleStatus(notice.id, notice.is_active || false)}
                                className={`p-2 rounded-lg transition-colors ${notice.is_active ? 'text-green-600 bg-green-50' : 'text-gray-300 bg-gray-50'}`}
                            >
                                {notice.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2">{notice.content}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-0">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                EXPIRES: {notice.end_date ? new Date(notice.end_date).toLocaleDateString() : 'NEVER'}
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/admin/notices/${notice.id}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl active-scale">
                                    <Edit size={18} />
                                </Link>
                                <button
                                    onClick={() => deleteNotice(notice.id)}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl active-scale"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {notices.length === 0 && (
                <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    No notices found.
                </div>
            )}
        </div>
    )
}
