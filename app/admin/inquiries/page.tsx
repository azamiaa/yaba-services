'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Loader2, Trash2, Mail, MessageSquare } from 'lucide-react'

type Inquiry = Database['public']['Tables']['inquiries']['Row']

export default function InquiriesAdmin() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([])
    const [loading, setLoading] = useState(true)

    const fetchInquiries = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching inquiries:', error)
        if (data) setInquiries(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchInquiries()
    }, [])

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await (supabase.from('inquiries') as any)
            .update({ status: newStatus })
            .eq('id', id)

        if (!error) {
            setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus as any } : i))
        }
    }

    const deleteInquiry = async (id: string) => {
        if (!confirm('Are you sure?')) return
        const { error } = await supabase.from('inquiries').delete().eq('id', id)
        if (!error) setInquiries(inquiries.filter(i => i.id !== id))
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight text-gray-900">Inquiries</h1>
                    <p className="text-sm text-gray-500">Messages from the contact form.</p>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">From</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Subject</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Date</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase tracking-widest text-[10px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inquiries.map((inq) => (
                            <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{inq.name}</div>
                                    <div className="text-xs text-gray-400 font-mono">{inq.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-700 mb-1">{inq.subject}</div>
                                    <div className="text-gray-400 text-xs truncate max-w-xs">{inq.message}</div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">
                                    {new Date(inq.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className={`text-[10px] uppercase tracking-widest font-bold border rounded-lg p-1.5 outline-none transition-all ${inq.status === 'new' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            inq.status === 'responded' ? 'bg-green-50 text-green-600 border-green-100' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}
                                        value={inq.status || 'new'}
                                        onChange={(e) => updateStatus(inq.id, e.target.value)}
                                    >
                                        <option value="new">New</option>
                                        <option value="responded">Responded</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => deleteInquiry(inq.id)}
                                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active-scale"
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
                {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 active-scale tap-highlight-none">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">{inq.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                                        {new Date(inq.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteInquiry(inq.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg transition-colors active-scale"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                            <h4 className="font-bold text-xs text-gray-700 uppercase tracking-widest">{inq.subject}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{inq.message}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <MessageSquare size={14} />
                                {inq.email}
                            </div>
                            <select
                                className={`text-[10px] uppercase tracking-widest font-bold border-none rounded-xl py-3 px-4 appearance-none text-center outline-none ${inq.status === 'new' ? 'bg-blue-50 text-blue-600' :
                                    inq.status === 'responded' ? 'bg-green-50 text-green-600' :
                                        'bg-gray-100 text-gray-600'
                                    }`}
                                value={inq.status || 'new'}
                                onChange={(e) => updateStatus(inq.id, e.target.value)}
                            >
                                <option value="new">New</option>
                                <option value="responded">Responded</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {inquiries.length === 0 && (
                <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    No inquiries found.
                </div>
            )}
        </div>
    )
}
