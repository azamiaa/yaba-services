'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function About() {
    const [siteName, setSiteName] = useState('Yaba Services')

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
        <div className="min-h-screen pt-32 pb-20 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-6xl font-bold mb-8 tracking-tighter uppercase">About {siteName}</h1>
                <p className="text-2xl text-gray-500 mb-12 font-light leading-relaxed">
                    We are dedicated to bridging the gap between citizens and essential digital services. Our mission is to simplify documentation, appointments, and applications through a seamless, premium online experience.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                    <div>
                        <h3 className="text-xl font-bold mb-4 border-b border-black pb-2">Our Mission</h3>
                        <p className="text-gray-600">To provide accessible, reliable, and secure e-services to every citizen, ensuring transparency and efficiency in every transaction.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4 border-b border-black pb-2">Our Vision</h3>
                        <p className="text-gray-600">A fully digital ecosystem where bureaucracy is minimized, and service delivery is instant and user-centric.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
