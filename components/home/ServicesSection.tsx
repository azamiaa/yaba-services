'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { ArrowRight, FileText, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

type Service = Database['public']['Tables']['services']['Row']

export default function ServicesSection() {
    const [services, setServices] = useState<Service[]>([])

    useEffect(() => {
        const fetchServices = async () => {
            const { data } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true })
                .limit(6)

            if (data) setServices(data)
        }
        fetchServices()
    }, [])

    return (
        <section className="py-32 bg-white text-black relative z-20">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-5xl font-bold uppercase tracking-tighter mb-4">Our Services</h2>
                        <p className="text-gray-500 max-w-md">Comprehensive digital solutions tailored for your efficiency. Browse our catalog of services.</p>
                    </div>
                    <Link href="/services" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition">
                        View All Services <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.length > 0 ? (
                        services.map((service, idx) => (
                            <Link href={`/services/${service.slug}`} key={service.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group p-8 border border-gray-200 hover:bg-black hover:text-white transition-all duration-300 h-full flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="mb-6 opacity-50 group-hover:opacity-100 transition">
                                            <FileText size={32} strokeWidth={1} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                                        <p className="text-gray-500 group-hover:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                            {service.short_description || service.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100 group-hover:border-white/10">
                                        <span className="text-xs uppercase tracking-widest font-medium opacity-60">
                                            {service.processing_time || 'Service'}
                                        </span>
                                        <ArrowRight className="transform group-hover:translate-x-1 transition-transform" size={16} />
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    ) : (
                        // Fallback/Skeleton
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-gray-50 animate-pulse border border-gray-100" />
                        ))
                    )}
                </div>

                <div className="mt-12 md:hidden">
                    <Link href="/services" className="flex items-center justify-center gap-2 w-full py-4 border border-black text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition">
                        View All Services
                    </Link>
                </div>
            </div>
        </section>
    )
}
