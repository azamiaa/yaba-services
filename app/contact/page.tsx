'use client'

import { useEffect, useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabaseClient'

export default function ContactPage() {
    const [settings, setSettings] = useState<Record<string, string>>({
        contact_email: 'support@yabaservices.com',
        contact_phone: '+1 (555) 123-4567',
        office_address: '123, Digital Plaza, tech City, India',
    })

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await (supabase.from('site_settings') as any)
                .select('key, value')
                .in('key', ['contact_email', 'contact_phone', 'office_address'])

            if (data) {
                const newSettings = { ...settings };
                (data as any[]).forEach(s => {
                    const val = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : s.value
                    newSettings[s.key] = val
                })
                setSettings(newSettings)
            }
        }
        fetchSettings()
    }, [])

    return (
        <div className="min-h-screen pt-32 pb-20 bg-white">
            <div className="container mx-auto px-6">
                <h1 className="text-6xl font-bold mb-16 tracking-tighter uppercase">Contact Us</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div>
                        <p className="text-2xl text-gray-500 font-light mb-12">
                            Have questions? We are here to help. Reach out to our support team for any inquiries regarding our services.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6">
                                <MapPin size={32} className="mt-1" />
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Visit Us</h3>
                                    <p className="text-gray-600">
                                        {settings.office_address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <Phone size={32} className="mt-1" />
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Call Us</h3>
                                    <p className="text-gray-600">
                                        {settings.contact_phone}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <Mail size={32} className="mt-1" />
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Email</h3>
                                    <p className="text-gray-600">
                                        {settings.contact_email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-12 rounded-3xl border border-gray-100 flex flex-col justify-center items-center text-center">
                        <h3 className="text-3xl font-bold mb-4">Need Quick Assistance?</h3>
                        <p className="text-gray-500 mb-8 max-w-sm">
                            For faster resolution, you can directly message us on our official support channels or book an appointment.
                        </p>
                        <div className="space-y-4 w-full max-w-xs">
                            <a href={`mailto:${settings.contact_email}`} className="block w-full">
                                <Button size="lg" className="w-full bg-black text-white hover:bg-gray-800">Email Support</Button>
                            </a>
                            <a href="/appointment" className="block w-full">
                                <Button size="lg" variant="outline" className="w-full">Book Appointment</Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
