'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { AlertCircle, Bell } from 'lucide-react'

type Notice = Database['public']['Tables']['notices']['Row']

export default function NoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotices = async () => {
            const { data } = await supabase
                .from('notices')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (data) setNotices(data)
            setLoading(false)
        }
        fetchNotices()
    }, [])

    return (
        <div className="min-h-screen pt-32 pb-20 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-5xl font-bold mb-12 tracking-tighter uppercase">Important Notices</h1>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>)}
                    </div>
                ) : notices.length > 0 ? (
                    <div className="space-y-6">
                        {notices.map(notice => (
                            <div
                                key={notice.id}
                                className={`p-8 border rounded-2xl transition-all hover:shadow-lg ${notice.type === 'alert'
                                    ? 'border-red-100 bg-red-50/50'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${notice.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {notice.type === 'alert' ? <AlertCircle size={24} /> : <Bell size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">{notice.title}</h3>
                                            {notice.type === 'alert' && (
                                                <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">Urgent</span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                                        <p className="text-xs text-gray-400 mt-4">
                                            Posted on {new Date(notice.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <p>No active notices at this time.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
