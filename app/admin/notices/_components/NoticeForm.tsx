'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Notice = Database['public']['Tables']['notices']['Row']
type NoticeInsert = Database['public']['Tables']['notices']['Insert']
type NoticeUpdate = Database['public']['Tables']['notices']['Update']

export function NoticeForm({ initialData }: { initialData?: Notice }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        type: initialData?.type || 'info',
        start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : '',
        end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : null,
        is_active: initialData?.is_active ?? true
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const finalData = {
            title: formData.title,
            content: formData.content,
            type: formData.type,
            is_active: formData.is_active,
            start_date: formData.start_date ? new Date(formData.start_date as string).toISOString() : null,
            end_date: formData.end_date ? new Date(formData.end_date as string).toISOString() : null
        }

        try {
            if (initialData?.id) {
                const { error } = await (supabase.from('notices') as any)
                    .update(finalData)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                const { error } = await (supabase.from('notices') as any)
                    .insert([finalData])
                if (error) throw error
            }
            router.push('/admin/notices')
            router.refresh()
        } catch (error) {
            console.error('Error saving notice:', error)
            alert('Failed to save notice')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/admin/notices" className="flex items-center text-gray-500 hover:text-black transition">
                    <ChevronLeft size={16} /> Back to List
                </Link>
                <h1 className="text-2xl font-bold">{initialData ? 'Edit Notice' : 'Create New Notice'}</h1>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Title</label>
                    <input
                        required
                        type="text"
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Content</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Type</label>
                    <select
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition bg-white"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value as 'info' | 'alert' | 'warning' | 'success' })}
                    >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="success">Success</option>
                        <option value="alert">Alert</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Start Date</label>
                        <input
                            type="datetime-local"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                            value={formData.start_date as string}
                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">End Date (Optional)</label>
                        <input
                            type="datetime-local"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                            value={formData.end_date as string || ''}
                            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_active || false}
                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium">Active</span>
                    </label>
                </div>

                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Notice'}
                </Button>
            </div>
        </form>
    )
}
