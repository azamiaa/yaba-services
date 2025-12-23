import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import { supabase } from '@/lib/supabaseClient'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export async function generateMetadata(): Promise<Metadata> {
    const { data } = await (supabase.from('site_settings') as any)
        .select('key, value')
        .in('key', ['site_name', 'site_description'])

    const settings: Record<string, string> = {}
    if (data) {
        (data as any[]).forEach(s => {
            settings[s.key] = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : s.value
        })
    }

    return {
        title: settings.site_name || 'Yaba Online Services',
        description: settings.site_description || 'Premium Digital Service Management Portal',
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
                <LayoutWrapper>
                    <main className="min-h-screen">
                        {children}
                    </main>
                </LayoutWrapper>
            </body>
        </html>
    )
}
