'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Save, Plus, X } from 'lucide-react'
import Link from 'next/link'

type Service = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type Category = Database['public']['Tables']['service_categories']['Row']

export function ServiceForm({ initialData }: { initialData?: Service }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [formData, setFormData] = useState<ServiceInsert>({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        category_id: initialData?.category_id || null, // Assuming I fixed the type or ignore TS for a moment
        price: initialData?.price || null,
        processing_time: initialData?.processing_time || '',
        short_description: initialData?.short_description || '',
        description: initialData?.description || '',
        requirements: initialData?.requirements || [],
        sort_order: initialData?.sort_order || 0,
        is_active: initialData?.is_active ?? true,
        is_featured: initialData?.is_featured ?? false,
        // icon: initialData?.icon || '' // Not in UI yet
    } as any) // Cast to any to avoid type mismatch on category_id until types fixed

    const [newReq, setNewReq] = useState('')

    useEffect(() => {
        const fetchCats = async () => {
            const { data } = await supabase.from('service_categories').select('*').eq('is_active', true)
            if (data) setCategories(data)
        }
        fetchCats()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (initialData?.id) {
                const { error } = await (supabase.from('services') as any)
                    .update(formData)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                const { error } = await (supabase.from('services') as any)
                    .insert([formData])
                if (error) throw error
            }
            router.push('/admin/services')
            router.refresh()
        } catch (error) {
            console.error('Error saving service:', error)
            alert('Failed to save service')
        } finally {
            setLoading(false)
        }
    }

    const addRequirement = () => {
        if (newReq.trim()) {
            setFormData({ ...formData, requirements: [...(formData.requirements || []), newReq] })
            setNewReq('')
        }
    }

    const removeRequirement = (index: number) => {
        const newReqs = [...(formData.requirements || [])]
        newReqs.splice(index, 1)
        setFormData({ ...formData, requirements: newReqs })
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/admin/services" className="flex items-center text-gray-500 hover:text-black transition">
                    <ChevronLeft size={16} /> Back to List
                </Link>
                <h1 className="text-2xl font-bold">{initialData ? 'Edit Service' : 'Create New Service'}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Service Title</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Slug (URL)</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition font-mono text-sm"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Short Description</label>
                            <textarea
                                rows={2}
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                value={formData.short_description || ''}
                                onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Full Description</label>
                            <textarea
                                rows={6}
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Requirements</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                    placeholder="Add a requirement..."
                                    value={newReq}
                                    onChange={e => setNewReq(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                />
                                <button type="button" onClick={addRequirement} className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <ul className="space-y-2 mt-4">
                                {formData.requirements?.map((req, idx) => (
                                    <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <span className="text-sm">{req}</span>
                                        <button type="button" onClick={() => removeRequirement(idx)} className="text-red-400 hover:text-red-600">
                                            <X size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Category</label>
                            <select
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition bg-white"
                                value={formData.category_id || ''}
                                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Price</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                value={formData.price || ''}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Processing Time</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                placeholder="e.g. 3-5 Days"
                                value={formData.processing_time || ''}
                                onChange={e => setFormData({ ...formData, processing_time: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Sort Order</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                value={formData.sort_order}
                                onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-50 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active || false}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <span className="text-sm font-medium">Active (Visible)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured || false}
                                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <span className="text-sm font-medium">Featured (Popular)</span>
                            </label>
                        </div>

                        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Service'}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
