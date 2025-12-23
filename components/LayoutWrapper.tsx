'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Check if the current route is an admin or login page
    const isAdminPage = pathname?.startsWith('/admin')
    const isLoginPage = pathname?.startsWith('/login')

    // If it's an admin or login page, don't show the public navbar and footer
    if (isAdminPage || isLoginPage) {
        return <>{children}</>
    }

    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
