'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { PageForm } from '../_components/PageForm'
import { Loader2 } from 'lucide-react'

type Page = Database['public']['Tables']['cms_pages']['Row']

export default function EditPage() {
    const params = useParams()
    const id = params.id as string
    const [data, setData] = useState<Page | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('cms_pages')
                .select('*')
                .eq('id', id)
                .single()

            if (data) setData(data)
            setLoading(false)
        }
        if (id) fetchData()
    }, [id])

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>
    if (!data) return <div>Page not found</div>

    return <PageForm initialData={data} />
}
