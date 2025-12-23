'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Save, Plus, X, Type, Image as ImageIcon, AlignLeft, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Page = Database['public']['Tables']['cms_pages']['Row']
type PageInsert = Database['public']['Tables']['cms_pages']['Insert']

type Block = {
    id: string
    type: 'header' | 'paragraph' | 'image'
    value: string
}

export function PageForm({ initialData }: { initialData?: Page }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<PageInsert>({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        seo_title: initialData?.seo_title || '',
        seo_description: initialData?.seo_description || '',
        is_published: initialData?.is_published ?? false,
        content: initialData?.content || []
    } as any)

    // content is generic JSONB, interpret as Block[]
    const [blocks, setBlocks] = useState<Block[]>((initialData?.content as any) || [])

    const addBlock = (type: Block['type']) => {
        setBlocks([...blocks, { id: crypto.randomUUID(), type, value: '' }])
    }

    const updateBlock = (id: string, value: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, value } : b))
    }

    const removeBlock = (index: number) => {
        const newBlocks = [...blocks]
        newBlocks.splice(index, 1)
        setBlocks(newBlocks)
    }

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === blocks.length - 1) return

        const newBlocks = [...blocks]
        const temp = newBlocks[index]
        newBlocks[index] = newBlocks[index + (direction === 'up' ? -1 : 1)]
        newBlocks[index + (direction === 'up' ? -1 : 1)] = temp
        setBlocks(newBlocks)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const finalData = { ...formData, content: blocks }

        try {
            if (initialData?.id) {
                const { error } = await (supabase.from('cms_pages') as any)
                    .update(finalData)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                const { error } = await (supabase.from('cms_pages') as any)
                    .insert([finalData])
                if (error) throw error
            }
            router.push('/admin/pages')
            router.refresh()
        } catch (error) {
            console.error('Error saving page:', error)
            alert('Failed to save page')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/admin/pages" className="flex items-center text-gray-500 hover:text-black transition">
                    <ChevronLeft size={16} /> Back to List
                </Link>
                <h1 className="text-2xl font-bold">{initialData ? 'Edit Page' : 'Create New Page'}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold border-b pb-4">Content Blocks</h2>

                        <div className="space-y-4 min-h-[200px]">
                            {blocks.map((block, idx) => (
                                <div key={block.id} className="group relative border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white hover:shadow-md transition">
                                    <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                                        <button type="button" onClick={() => moveBlock(idx, 'up')} className="p-1 text-gray-400 hover:text-black"><ArrowUp size={14} /></button>
                                        <button type="button" onClick={() => moveBlock(idx, 'down')} className="p-1 text-gray-400 hover:text-black"><ArrowDown size={14} /></button>
                                        <button type="button" onClick={() => removeBlock(idx)} className="p-1 text-red-400 hover:text-red-600 ml-2"><X size={14} /></button>
                                    </div>

                                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        {block.type === 'header' && <Type size={12} />}
                                        {block.type === 'paragraph' && <AlignLeft size={12} />}
                                        {block.type === 'image' && <ImageIcon size={12} />}
                                        {block.type.toUpperCase()}
                                    </div>

                                    {block.type === 'paragraph' ? (
                                        <textarea
                                            rows={3}
                                            className="w-full bg-transparent outline-none resize-none"
                                            placeholder="Write content here..."
                                            value={block.value}
                                            onChange={e => updateBlock(block.id, e.target.value)}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full bg-transparent outline-none font-medium"
                                            placeholder={block.type === 'image' ? 'Image URL...' : 'Heading Text...'}
                                            value={block.value}
                                            onChange={e => updateBlock(block.id, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}

                            {blocks.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    Start adding content blocks below.
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4 border-t">
                            <button type="button" onClick={() => addBlock('header')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
                                <Type size={16} /> Heading
                            </button>
                            <button type="button" onClick={() => addBlock('paragraph')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
                                <AlignLeft size={16} /> Paragraph
                            </button>
                            <button type="button" onClick={() => addBlock('image')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
                                <ImageIcon size={16} /> Image
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Page Title</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Slug</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition font-mono text-sm"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">SEO Title</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                value={formData.seo_title || ''}
                                onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">SEO Description</label>
                            <textarea
                                rows={3}
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition"
                                value={formData.seo_description || ''}
                                onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_published || false}
                                    onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <span className="text-sm font-medium">Published</span>
                            </label>
                        </div>

                        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Page'}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
