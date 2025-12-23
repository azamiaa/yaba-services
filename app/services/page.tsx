'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { ArrowRight, FileText, Search } from 'lucide-react'
import { motion } from 'framer-motion'

type Service = Database['public']['Tables']['services']['Row']

type ServiceWithCategory = Service & {
    service_categories: { name: string } | null
}

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceWithCategory[]>([])
    const [filtered, setFiltered] = useState<ServiceWithCategory[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchServices = async () => {
            const { data } = await supabase
                .from('services')
                .select('*, service_categories(name)')
                .eq('is_active', true)
                .order('sort_order', { ascending: true })

            if (data) {
                setServices(data as any)
                setFiltered(data as any)
            }
            setLoading(false)
        }
        fetchServices()
    }, [])

    useEffect(() => {
        if (search === '') {
            setFiltered(services)
        } else {
            setFiltered(services.filter(s =>
                s.title.toLowerCase().includes(search.toLowerCase()) ||
                (s.short_description && s.short_description.toLowerCase().includes(search.toLowerCase())) ||
                (s.service_categories?.name.toLowerCase().includes(search.toLowerCase()))
            ))
        }
    }, [search, services])

    return (
        <div className="min-h-screen pt-32 pb-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h1 className="text-6xl font-bold uppercase tracking-tighter mb-4">All Services</h1>
                        <p className="text-gray-500 max-w-md">Browse our comprehensive list of digital services.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full p-4 pl-12 border border-gray-200 rounded-full focus:outline-none focus:border-black transition"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-gray-50 animate-pulse rounded-2xl" />
                        ))
                    ) : filtered.length > 0 ? (
                        filtered.map((service, idx) => (
                            <Link href={`/services/${service.slug}`} key={service.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group p-8 border border-gray-200 hover:bg-black hover:text-white transition-all duration-300 h-full flex flex-col justify-between rounded-xl"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="opacity-50 group-hover:opacity-100 transition">
                                                <FileText size={32} strokeWidth={1} />
                                            </div>
                                            <span className="text-xs uppercase tracking-widest font-bold opacity-40 border px-2 py-1 rounded">
                                                {service.service_categories?.name || 'Uncategorized'}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                                        <p className="text-gray-500 group-hover:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                            {service.short_description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100 group-hover:border-white/10">
                                        <span className="font-bold">
                                            {service.price ? `₹${service.price}` : 'Consult'}
                                        </span>
                                        <ArrowRight className="transform group-hover:translate-x-1 transition-transform" size={16} />
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-gray-500">
                            No services found matching "{search}".
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
