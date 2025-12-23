'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

type HeroService = Database['public']['Tables']['hero_services']['Row']

export default function HeroServicesAdmin() {
    const [slides, setSlides] = useState<HeroService[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchSlides = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('hero_services')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) console.error('Error fetching slides:', error)
        if (data) setSlides(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchSlides()
    }, [])

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await (supabase.from('hero_services') as any)
            .update({ active: !currentStatus })
            .eq('id', id)

        if (!error) {
            setSlides(slides.map(s => s.id === id ? { ...s, active: !currentStatus } : s))
        }
    }

    const deleteSlide = async (id: string) => {
        if (!confirm('Are you sure you want to delete this slide?')) return

        const { error } = await supabase
            .from('hero_services')
            .delete()
            .eq('id', id)

        if (!error) {
            setSlides(slides.filter(s => s.id !== id))
        }
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight text-gray-900">Hero Slides</h1>
                    <p className="text-sm text-gray-500">Manage cinematic scrolling sequences.</p>
                </div>
                <Link href="/admin/hero/create">
                    <Button className="bg-black text-white hover:bg-gray-800 gap-2 active-scale shadow-lg">
                        <Plus size={16} /> Add Slides
                    </Button>
                </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Order</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Title</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Folder URL</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase tracking-widest text-[10px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {slides.map((slide) => (
                            <tr key={slide.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-400">
                                    {String(slide.sort_order).padStart(2, '0')}
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {slide.title}
                                    {slide.description && <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{slide.description}</div>}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-gray-500 truncate max-w-[200px]">
                                    {slide.image_folder_url}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(slide.id, slide.active)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${slide.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {slide.active ? <Eye size={12} /> : <EyeOff size={12} />}
                                        {slide.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <Link href={`/admin/hero/${slide.id}`}>
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition active-scale">
                                            <Edit size={16} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => deleteSlide(slide.id)}
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
                {slides.map((slide) => (
                    <div key={slide.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 active-scale tap-highlight-none">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-mono text-xs shadow-inner">
                                    {String(slide.sort_order).padStart(2, '0')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">{slide.title}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1 truncate max-w-[150px]">{slide.image_folder_url}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleStatus(slide.id, slide.active)}
                                className={`p-2 rounded-lg transition-colors ${slide.active ? 'text-green-600 bg-green-50' : 'text-gray-300 bg-gray-50'}`}
                            >
                                {slide.active ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>

                        {slide.description && <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{slide.description}</p>}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${slide.active ? 'text-green-600' : 'text-gray-400'}`}>
                                {slide.active ? 'VISIBLE ON HERO' : 'HIDDEN FROM VIEW'}
                            </span>

                            <div className="flex gap-2">
                                <Link href={`/admin/hero/${slide.id}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl active-scale">
                                    <Edit size={18} />
                                </Link>
                                <button
                                    onClick={() => deleteSlide(slide.id)}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl active-scale"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {slides.length === 0 && (
                <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    No slides found.
                </div>
            )}
        </div>
    )
}
