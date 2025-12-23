'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Footer() {
    const [settings, setSettings] = useState<Record<string, string>>({
        contact_email: 'support@yabaservices.com',
        contact_phone: '+1 (555) 123-4567',
        office_address: 'Digital Plaza, Main Street',
        site_name: 'YabaServices',
    })

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await (supabase.from('site_settings') as any)
                .select('key, value')
                .in('key', ['contact_email', 'contact_phone', 'office_address', 'site_name'])

            if (data) {
                const newSettings = { ...settings };
                (data as any[]).forEach(s => {
                    try {
                        // Remove extra quotes if stored as stringified JSON in the DB
                        const val = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : s.value
                        newSettings[s.key] = val
                    } catch (e) {
                        newSettings[s.key] = s.value
                    }
                })
                setSettings(newSettings)
            }
        }
        fetchSettings()
    }, [])

    return (
        <footer className="bg-black text-white py-20 border-t border-gray-800">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-4">
                    <Link href="/" className="text-2xl font-bold uppercase tracking-tighter">
                        {settings.site_name.includes(' ') ? (
                            <>
                                {settings.site_name.split(' ')[0]}<span className="font-light">{settings.site_name.split(' ').slice(1).join(' ')}</span>
                            </>
                        ) : (
                            <>
                                {settings.site_name.slice(0, 4)}<span className="font-light">{settings.site_name.slice(4)}</span>
                            </>
                        )}
                    </Link>
                    <p className="text-gray-400 text-sm">
                        Premium digital services for the modern citizen. Fast, reliable, and secure.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold uppercase tracking-widest mb-6">Explore</h4>
                    <ul className="space-y-3 text-gray-400">
                        <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                        <li><Link href="/services" className="hover:text-white transition">All Services</Link></li>
                        <li><Link href="/notices" className="hover:text-white transition">Latest Notices</Link></li>
                        <li><Link href="/appointment" className="hover:text-white transition">Appointments</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold uppercase tracking-widest mb-6">Legal</h4>
                    <ul className="space-y-3 text-gray-400">
                        <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold uppercase tracking-widest mb-6">Contact</h4>
                    <ul className="space-y-3 text-gray-400">
                        <li>{settings.contact_email}</li>
                        <li>{settings.contact_phone}</li>
                        <li>{settings.office_address}</li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-6 mt-20 pt-8 border-t border-gray-900 text-center text-gray-600 text-sm">
                © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
            </div>
        </footer>
    )
}
