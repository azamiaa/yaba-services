'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Mail, Lock } from 'lucide-react'

function LoginForm() {
    const [siteName, setSiteName] = useState('Yaba Services')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams ? (searchParams.get('redirect') || '/') : '/'

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push(redirectTo)
            router.refresh()
        } catch (err: any) {
            let msg = err.message || 'Failed to sign in'
            if (msg.includes('Email not confirmed')) {
                msg = 'Please verify your email address. Check your inbox or spam folder.'
            }
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tighter mb-2">{siteName}</h1>
                    <p className="text-gray-500">Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-black text-white" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    Restricted Access. Authorized Personnel Only.
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
