'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Service = Database['public']['Tables']['services']['Row']

type ServiceWithCategory = Service & {
    service_categories: { name: string } | null
}

export default function ServicesAdmin() {
    const [services, setServices] = useState<ServiceWithCategory[]>([])
    const [loading, setLoading] = useState(true)

    const fetchServices = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('services')
            .select('*, service_categories(name)')
            .order('sort_order', { ascending: true })

        if (error) console.error('Error fetching services:', error)
        if (data) setServices(data as any)
        setLoading(false)
    }

    useEffect(() => {
        fetchServices()
    }, [])

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await (supabase.from('services') as any)
            .update({ is_active: !currentStatus })
            .eq('id', id)

        if (!error) {
            setServices(services.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s))
        }
    }

    const deleteService = async (id: string) => {
        if (!confirm('Are you sure? This will delete the service and all associated appointments.')) return

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id)

        if (!error) {
            setServices(services.filter(s => s.id !== id))
        }
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Services</h1>
                    <p className="text-gray-500">Manage service catalog, pricing, and requirements.</p>
                </div>
                <Link href="/admin/services/create">
                    <Button className="bg-black text-white hover:bg-gray-800 gap-2">
                        <Plus size={16} /> Add New Service
                    </Button>
                </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Title</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Category</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Price</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase tracking-widest text-[10px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        {service.title}
                                        {service.is_featured && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono mt-1">{service.slug}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {service.service_categories?.name || 'Uncategorized'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono font-medium">
                                    {service.price ? `₹${service.price}` : 'Free/Custom'}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(service.id, service.is_active)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {service.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                                        {service.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <Link href={`/admin/services/${service.id}`}>
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition active-scale">
                                            <Edit size={16} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => deleteService(service.id)}
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
                {services.map((service) => (
                    <div key={service.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 active-scale tap-highlight-none">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                                    {service.title}
                                    {service.is_featured && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                                </h3>
                                <p className="text-xs text-gray-400 font-mono mt-1">{service.slug}</p>
                            </div>
                            <span className="bg-black text-white px-2 py-1 rounded-lg text-[10px] font-bold font-mono">
                                ₹{service.price || 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <button
                                onClick={() => toggleStatus(service.id, service.is_active)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${service.is_active ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                {service.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                {service.is_active ? 'Active' : 'Inactive'}
                            </button>

                            <div className="flex gap-2">
                                <Link href={`/admin/services/${service.id}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl active-scale">
                                    <Edit size={18} />
                                </Link>
                                <button
                                    onClick={() => deleteService(service.id)}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl active-scale"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {services.length === 0 && (
                <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    No services found.
                </div>
            )}
        </div>
    )
}
