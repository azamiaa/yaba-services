'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Plus, Edit, Trash2, MessageSquare, Check, X, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Testimonial = Database['public']['Tables']['testimonials']['Row']

export default function TestimonialsAdmin() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)

    const fetchTestimonials = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching testimonials:', error)
        if (data) setTestimonials(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchTestimonials()
    }, [])

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await (supabase.from('testimonials') as any)
            .update({ is_approved: !currentStatus })
            .eq('id', id)

        if (!error) {
            setTestimonials(testimonials.map(t => t.id === id ? { ...t, is_approved: !currentStatus } : t))
        }
    }

    const deleteTestimonial = async (id: string) => {
        if (!confirm('Are you sure?')) return

        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id)

        if (!error) {
            setTestimonials(testimonials.filter(t => t.id !== id))
        }
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight text-gray-900">Testimonials</h1>
                    <p className="text-sm text-gray-500">Manage customer reviews and feedback.</p>
                </div>
                <Link href="/admin/testimonials/create">
                    <Button className="bg-black text-white hover:bg-gray-800 gap-2 active-scale shadow-lg">
                        <Plus size={16} /> Add Testimonial
                    </Button>
                </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Author</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Content</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Rating</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase tracking-widest text-[10px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {testimonials.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={16} className="text-gray-400" />
                                        {t.author_name}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{t.role}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                                    {t.content}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <span className="font-bold text-black mr-1">{t.rating}</span>
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(t.id, t.is_approved || false)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${t.is_approved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {t.is_approved ? <Check size={12} /> : <X size={12} />}
                                        {t.is_approved ? 'Approved' : 'Pending'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <Link href={`/admin/testimonials/${t.id}`}>
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition active-scale">
                                            <Edit size={16} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => deleteTestimonial(t.id)}
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
                {testimonials.map((t) => (
                    <div key={t.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 active-scale tap-highlight-none">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">{t.author_name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{t.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                                <span className="text-xs font-bold">{t.rating}</span>
                                <Star size={12} fill="currentColor" />
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">"{t.content}"</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <button
                                onClick={() => toggleStatus(t.id, t.is_approved || false)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${t.is_approved ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                            >
                                {t.is_approved ? <Check size={14} /> : <X size={14} />}
                                {t.is_approved ? 'Approved' : 'Pending'}
                            </button>

                            <div className="flex gap-2">
                                <Link href={`/admin/testimonials/${t.id}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl active-scale">
                                    <Edit size={18} />
                                </Link>
                                <button
                                    onClick={() => deleteTestimonial(t.id)}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl active-scale"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {testimonials.length === 0 && (
                <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    No testimonials found.
                </div>
            )}
        </div>
    )
}
