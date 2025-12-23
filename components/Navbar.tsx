'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'

// ... (keep constants)

const NAV_LINKS = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Notices', href: '/notices' },
    { name: 'Contact', href: '/contact' },
]

export default function Navbar() {
    const pathname = usePathname()
    const isHome = pathname === '/'

    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [siteName, setSiteName] = useState('YabaServices')
    const [user, setUser] = useState<any>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const { scrollY } = useScroll()

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

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single()

                if (roleData) setUserRole((roleData as any).role)
            }
        }

        fetchSettings()
        fetchUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
            if (!session) setUserRole(null)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [mobileMenuOpen])

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50)
    })

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/' // Force fresh state
    }

    // Force scrolled style if not on homepage
    const effectiveScrolled = !isHome || isScrolled

    // Dynamic text color class
    const textColorClass = effectiveScrolled ? "text-black" : "text-white mix-blend-difference"
    const logoColorClass = mobileMenuOpen ? "text-white" : (effectiveScrolled ? "text-black" : "text-white mix-blend-difference")
    const toggleColorClass = mobileMenuOpen ? "text-white" : (effectiveScrolled ? "text-black" : "text-white mix-blend-difference")

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-transparent",
                effectiveScrolled ? "bg-white/80 backdrop-blur-md border-gray-200 py-4 shadow-sm" : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className={cn("text-2xl font-bold tracking-tighter uppercase relative z-50 transition-colors duration-300", logoColorClass)}>
                    {siteName.includes(' ') ? (
                        <>
                            {siteName.split(' ')[0]}<span className="font-light">{siteName.split(' ').slice(1).join(' ')}</span>
                        </>
                    ) : (
                        <>
                            {siteName.slice(0, 4)}<span className="font-light">{siteName.slice(4)}</span>
                        </>
                    )}
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium hover:opacity-70 transition-all uppercase tracking-widest",
                                textColorClass
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link href="/appointment">
                        <Button
                            variant={effectiveScrolled ? "primary" : "secondary"} // Ensure contrast: primary (black) on white scroll, secondary (white) on dark hero
                            className={cn("rounded-full transition-colors",
                                !effectiveScrolled && "bg-white text-black hover:bg-gray-200 border-transparent"
                            )}
                        >
                            Book Now
                        </Button>
                    </Link>

                    {user && (
                        <div className="flex items-center gap-4">
                            {['admin', 'editor'].includes(userRole || '') && (
                                <Link href="/admin">
                                    <button className={cn("p-2 rounded-full hover:bg-gray-100/10 transition-colors", textColorClass)} title="Dashboard">
                                        <LayoutDashboard size={20} />
                                    </button>
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className={cn("p-2 rounded-full hover:bg-gray-100/10 transition-colors", textColorClass)}
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className={cn("md:hidden relative z-50 transition-colors duration-300", toggleColorClass)}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-0 bg-black text-white z-40 flex flex-col items-center justify-center space-y-8 h-screen w-screen"
                >
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-3xl font-light uppercase tracking-widest hover:text-gray-400"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link href="/appointment" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="secondary" size="lg" className="rounded-full mt-4 bg-white text-black hover:bg-gray-200">
                            Book Appointment
                        </Button>
                    </Link>

                    {user ? (
                        <div className="flex flex-col items-center gap-6 pt-8">
                            {['admin', 'editor'].includes(userRole || '') && (
                                <Link
                                    href="/admin"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-xl font-light uppercase tracking-widest text-blue-400"
                                >
                                    Admin Dashboard
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="text-xl font-light uppercase tracking-widest text-red-400"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            <span className="text-xl font-light uppercase tracking-widest hover:text-gray-400">Sign In</span>
                        </Link>
                    )}
                </motion.div>
            )}
        </nav>
    )
}
