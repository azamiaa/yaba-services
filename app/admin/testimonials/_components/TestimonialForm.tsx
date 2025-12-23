'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Save, Loader2, Star } from 'lucide-react'
import Link from 'next/link'

type Testimonial = Database['public']['Tables']['testimonials']['Row']
type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert']

export function TestimonialForm({ initialData }: { initialData?: Testimonial }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<TestimonialInsert>({
        author_name: initialData?.author_name || '',
        role: initialData?.role || '',
        content: initialData?.content || '',
        rating: initialData?.rating || 5,
        is_approved: initialData?.is_approved ?? false
    } as any)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (initialData?.id) {
                const { error } = await (supabase.from('testimonials') as any)
                    .update(formData)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                const { error } = await (supabase.from('testimonials') as any)
                    .insert([formData])
                if (error) throw error
            }
            router.push('/admin/testimonials')
            router.refresh()
        } catch (error) {
            console.error('Error saving testimonial:', error)
            alert('Failed to save testimonial')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/admin/testimonials" className="flex items-center text-gray-500 hover:text-black transition">
                    <ChevronLeft size={16} /> Back to List
                </Link>
                <h1 className="text-2xl font-bold">{initialData ? 'Edit Testimonial' : 'Create New Testimonial'}</h1>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Author Name</label>
                        <input
                            required
                            type="text"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                            value={formData.author_name}
                            onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Role / Company</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                            value={formData.role || ''}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        />
                    </div>
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

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Rating (1-5)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                max="5"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                value={formData.rating || 5}
                                onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                            />
                            <div className="flex text-yellow-500">
                                {[...Array(formData.rating || 0)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_approved || false}
                            onChange={e => setFormData({ ...formData, is_approved: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium">Approved (Visible)</span>
                    </label>
                </div>

                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Testimonial'}
                </Button>
            </div>
        </form>
    )
}
