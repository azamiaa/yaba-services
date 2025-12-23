'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { Save, Loader2, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Setting = Database['public']['Tables']['site_settings']['Row']

export default function SettingsAdmin() {
    const [settings, setSettings] = useState<Setting[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetchSettings = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .order('key', { ascending: true })

        if (error) console.error('Error fetching settings:', error)
        if (data) setSettings(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const handleChange = (id: string, newValue: string) => {
        setSettings(settings.map(s => s.id === id ? { ...s, value: newValue } : s))
    }

    const handleSave = async (id: string, value: string) => {
        setSaving(true)
        const { error } = await (supabase.from('site_settings') as any)
            .update({ value })
            .eq('id', id)

        if (error) {
            alert('Failed to save')
        }
        setSaving(false)
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Site Settings</h1>
                    <p className="text-gray-500">Global configuration variables.</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
                {settings.map((setting) => (
                    <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                        <div>
                            <div className="font-mono text-sm font-bold text-gray-700">{setting.key}</div>
                            <div className="text-xs text-gray-400 mt-1">{setting.description}</div>
                        </div>
                        <div className="md:col-span-2 flex gap-4">
                            <div className="flex-1">
                                {(setting.key.includes('json') || (setting.value?.length || 0) > 50) ? (
                                    <textarea
                                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition font-mono text-sm bg-gray-50"
                                        rows={3}
                                        value={setting.value || ''}
                                        onChange={e => handleChange(setting.id, e.target.value)}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition font-mono text-sm bg-gray-50"
                                        value={setting.value || ''}
                                        onChange={e => handleChange(setting.id, e.target.value)}
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => handleSave(setting.id, setting.value)}
                                disabled={saving}
                                className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 self-start"
                            >
                                <Save size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
