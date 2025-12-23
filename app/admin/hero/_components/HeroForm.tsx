'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

type HeroService = Database['public']['Tables']['hero_services']['Row']
type HeroServiceInsert = Database['public']['Tables']['hero_services']['Insert']

export function HeroForm({ initialData }: { initialData?: HeroService }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<HeroServiceInsert>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        image_folder_url: initialData?.image_folder_url || '',
        sort_order: initialData?.sort_order || 0,
        active: initialData?.active ?? true,
        cta_text: initialData?.cta_text || '',
        cta_link: initialData?.cta_link || '',
        theme_color: initialData?.theme_color || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (initialData?.id) {
                // Update
                const { error } = await (supabase.from('hero_services') as any)
                    .update(formData)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                // Create
                const { error } = await (supabase.from('hero_services') as any)
                    .insert([formData])
                if (error) throw error
            }
            router.push('/admin/hero')
            router.refresh()
        } catch (error) {
            console.error('Error saving slide:', error)
            alert('Failed to save slide')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/admin/hero" className="flex items-center text-gray-500 hover:text-black transition">
                    <ChevronLeft size={16} /> Back to List
                </Link>
                <h1 className="text-2xl font-bold">{initialData ? 'Edit Slide' : 'Create New Slide'}</h1>
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
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Description</label>
                    <textarea
                        rows={3}
                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Image Sequence URL</label>
                        <input
                            required
                            type="text"
                            placeholder="https://.../folder"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition font-mono text-sm"
                            value={formData.image_folder_url}
                            onChange={e => setFormData({ ...formData, image_folder_url: e.target.value })}
                        />
                        <p className="text-xs text-gray-400">Must contain frame_000.webp to frame_059.webp</p>
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
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">CTA Text</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                            value={formData.cta_text || ''}
                            onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">CTA Link</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                            value={formData.cta_link || ''}
                            onChange={e => setFormData({ ...formData, cta_link: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.active || false}
                            onChange={e => setFormData({ ...formData, active: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium">Active (Visible)</span>
                    </label>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                        {initialData ? 'Update Slide' : 'Create Slide'}
                    </Button>
                </div>
            </div>
        </form>
    )
}
