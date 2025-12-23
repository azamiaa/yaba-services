'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Database } from '@/types/supabase'

type Service = Database['public']['Tables']['services']['Row']

function AppointmentForm() {
    const searchParams = useSearchParams()
    const preSelectedServiceId = searchParams.get('service')

    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        user_phone: '',
        service_id: preSelectedServiceId || '',
        requested_date: ''
    })

    useEffect(() => {
        const fetchServices = async () => {
            const { data } = await supabase.from('services').select('*').eq('is_active', true)
            if (data) setServices(data)
        }
        fetchServices()
    }, [])

    // Update service if URL param changes and services loaded
    useEffect(() => {
        if (preSelectedServiceId) {
            setFormData(prev => ({ ...prev, service_id: preSelectedServiceId }))
        }
    }, [preSelectedServiceId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const appointmentData: Database['public']['Tables']['appointments']['Insert'] = {
                user_name: formData.user_name,
                user_email: formData.user_email,
                user_phone: formData.user_phone,
                service_id: formData.service_id || null,
                requested_date: new Date(formData.requested_date).toISOString(),
                status: 'pending'
            }

            const { error } = await supabase.from('appointments').insert([appointmentData] as any)

            if (error) throw error
            setSuccess(true)
        } catch (error) {
            console.error('Error booking:', error)
            alert('Failed to book appointment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen pt-32 pb-20 container mx-auto px-6 text-center max-w-lg">
                <div className="mb-8 text-6xl">✅</div>
                <h2 className="text-4xl font-bold mb-4">Appointment Request Sent</h2>
                <p className="text-gray-500 mb-8">We have received your request. Our team will contact you shortly to confirm the time.</p>
                <Button onClick={() => setSuccess(false)} variant="outline">Book Another</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50">
            <div className="container mx-auto px-6 max-w-2xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
                <p className="text-gray-500 mb-8">Fill out the form below to schedule a consultation or service processing.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Full Name</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                placeholder="John Doe"
                                value={formData.user_name}
                                onChange={e => setFormData({ ...formData, user_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Phone Number</label>
                            <input
                                required
                                type="tel"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                placeholder="+1 (555) 000-0000"
                                value={formData.user_phone}
                                onChange={e => setFormData({ ...formData, user_phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                        <input
                            required
                            type="email"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                            placeholder="john@example.com"
                            value={formData.user_email}
                            onChange={e => setFormData({ ...formData, user_email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Select Service</label>
                        <select
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition bg-white"
                            value={formData.service_id}
                            onChange={e => setFormData({ ...formData, service_id: e.target.value })}
                        >
                            <option value="">General Consultation</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Preferred Date</label>
                        <input
                            required
                            type="datetime-local"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                            value={formData.requested_date}
                            onChange={e => setFormData({ ...formData, requested_date: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" size="lg" className="w-full bg-black text-white" disabled={loading}>
                            {loading ? 'Submitting...' : 'Confirm Appointment'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Wrap in Suspense for useSearchParams
export default function AppointmentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-32 text-center">Loading form...</div>}>
            <AppointmentForm />
        </Suspense>
    )
}
