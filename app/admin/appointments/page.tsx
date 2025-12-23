'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Loader2, CheckCircle, XCircle, Clock, Calendar, Trash2 } from 'lucide-react'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
    services: { title: string } | null
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rescheduled: 'bg-orange-100 text-orange-800'
}

export default function AppointmentsAdmin() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAppointments = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('appointments')
            .select('*, services(title)')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching appointments:', error)
        if (data) setAppointments(data as any) // Cast for join type
        setLoading(false)
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await (supabase.from('appointments') as any)
            .update({ status: newStatus })
            .eq('id', id)

        if (!error) {
            setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } as any : a))
        }
    }

    const deleteAppointment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this appointment?')) return
        const { error } = await supabase.from('appointments').delete().eq('id', id)
        if (!error) setAppointments(appointments.filter(a => a.id !== id))
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Appointments</h1>
                    <p className="text-gray-500">Manage client bookings and status.</p>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Client</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Service</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Requested Date</th>
                            <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-500 text-right uppercase tracking-widest text-[10px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium">{appt.user_name}</div>
                                    <div className="text-xs text-gray-400">{appt.user_email}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-600">
                                    {appt.services?.title || 'General / Unknown'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(appt.requested_date).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${statusColors[appt.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
                                        {appt.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 items-center">
                                        {appt.status === 'pending' && (
                                            <button onClick={() => updateStatus(appt.id, 'confirmed')} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg active-scale">
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                        <select
                                            className="text-[10px] font-bold uppercase tracking-widest border border-gray-100 rounded-xl p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-black transition-all appearance-none cursor-pointer hover:bg-white min-w-[100px] text-center"
                                            value={appt.status || 'pending'}
                                            onChange={(e) => updateStatus(appt.id, e.target.value)}
                                        >
                                            <option value="pending">PENDING</option>
                                            <option value="confirmed">CONFIRMED</option>
                                            <option value="completed">COMPLETED</option>
                                            <option value="cancelled">CANCELLED</option>
                                        </select>
                                        <button
                                            onClick={() => deleteAppointment(appt.id)}
                                            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active-scale"
                                            title="Delete Appointment"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {appointments.map((appt) => (
                    <div key={appt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 active-scale tap-highlight-none">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                                    {appt.user_name?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">{appt.user_name}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{appt.services?.title}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${statusColors[appt.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
                                    {appt.status}
                                </span>
                                <button
                                    onClick={() => deleteAppointment(appt.id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-xl active-scale"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {new Date(appt.requested_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-400" />
                                {new Date(appt.requested_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2 w-full">
                                {appt.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => updateStatus(appt.id, 'confirmed')}
                                            className="flex-1 bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest active-scale"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => updateStatus(appt.id, 'cancelled')}
                                            className="bg-red-50 text-red-600 px-4 py-3 rounded-xl active-scale"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <select
                                        className="w-full bg-gray-100 border-none rounded-xl py-3 px-4 text-xs font-bold appearance-none text-center"
                                        value={appt.status || 'pending'}
                                        onChange={(e) => updateStatus(appt.id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {appointments.length === 0 && (
                <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    No appointments found.
                </div>
            )}
        </div>
    )
}
