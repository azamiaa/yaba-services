'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import CinematicHero from '@/components/hero/CinematicHero'
import ServicesSection from '@/components/home/ServicesSection'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
    const [siteName, setSiteName] = useState('Yaba')

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await (supabase.from('site_settings') as any)
                .select('key, value')
                .eq('key', 'site_name')
                .single()

            if (data && data.value) {
                const val = typeof data.value === 'string' ? data.value.replace(/^"|"$/g, '') : data.value
                setSiteName(val)
            }
        }
        fetchSettings()
    }, [])

    return (
        <main className="bg-white">
            <CinematicHero />

            <ServicesSection />

            <section className="py-20 border-t border-gray-100 bg-black text-white">
                <div className="container mx-auto px-6 text-center max-w-3xl">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
                        Digital Services.<br />Simplified.
                    </h2>
                    <p className="text-lg text-gray-400 mb-10">
                        Join thousands of satisfied citizens who handle their documentation and services online with {siteName}.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link href="/appointment">
                            <Button size="lg" className="rounded-full w-full md:w-auto px-8 bg-white text-black hover:bg-gray-200">
                                Book an Appointment
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" size="lg" className="rounded-full w-full md:w-auto px-8 border-white/20 text-white hover:bg-white hover:text-black">
                                Contact Support
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
