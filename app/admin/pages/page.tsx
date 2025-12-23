'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Plus, Edit, Trash2, Globe, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Page = Database['public']['Tables']['cms_pages']['Row']

export default function PagesAdmin() {
    const [pages, setPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPages = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('cms_pages')
            .select('*')
            .order('title', { ascending: true })

        if (error) console.error('Error fetching pages:', error)
        if (data) setPages(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchPages()
    }, [])

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await (supabase.from('cms_pages') as any)
            .update({ is_published: !currentStatus })
            .eq('id', id)

        if (!error) {
            setPages(pages.map(p => p.id === id ? { ...p, is_published: !currentStatus } : p))
        }
    }

    const deletePage = async (id: string) => {
        if (!confirm('Are you sure? This page will be lost.')) return

        const { error } = await supabase
            .from('cms_pages')
            .delete()
            .eq('id', id)

        if (!error) {
            setPages(pages.filter(p => p.id !== id))
        }
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight text-gray-900">CMS Pages</h1>
                    <p className="text-sm text-gray-500">Manage static content pages.</p>
                </div>
                <Link href="/admin/pages/create">
                    <Button className="bg-black text-white hover:bg-gray-800 gap-2 active-scale shadow-lg">
                        <Plus size={16} /> Create Page
                    </Button>
                </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Title</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Slug</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase tracking-widest text-[10px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-gray-400" />
                                        {page.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-600">
                                    /{page.slug}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(page.id, page.is_published || false)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${page.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {page.is_published ? <Globe size={12} /> : <FileText size={12} />}
                                        {page.is_published ? 'Published' : 'Draft'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <Link href={`/admin/pages/${page.id}`}>
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition active-scale">
                                            <Edit size={16} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => deletePage(page.id)}
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
                {pages.map((page) => (
                    <div key={page.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 active-scale tap-highlight-none">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">{page.title}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">/{page.slug}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleStatus(page.id, page.is_published || false)}
                                className={`p-2 rounded-lg transition-colors ${page.is_published ? 'text-green-600 bg-green-50' : 'text-gray-300 bg-gray-50'}`}
                            >
                                {page.is_published ? <Globe size={18} /> : <FileText size={18} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${page.is_published ? 'text-green-600' : 'text-gray-400'}`}>
                                {page.is_published ? 'LIVE ON SITE' : 'DRAFT MODE'}
                            </span>

                            <div className="flex gap-2">
                                <Link href={`/admin/pages/${page.id}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl active-scale">
                                    <Edit size={18} />
                                </Link>
                                <button
                                    onClick={() => deletePage(page.id)}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl active-scale"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {pages.length === 0 && (
                <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    No pages found.
                </div>
            )}
        </div>
    )
}
