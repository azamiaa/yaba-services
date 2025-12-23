'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { ServiceForm } from '../_components/ServiceForm'
import { Loader2 } from 'lucide-react'

type Service = Database['public']['Tables']['services']['Row']

export default function EditServicePage() {
    const params = useParams()
    const id = params.id as string
    const [data, setData] = useState<Service | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single()

            if (data) setData(data)
            setLoading(false)
        }
        if (id) fetchData()
    }, [id])

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>
    if (!data) return <div>Service not found</div>

    return <ServiceForm initialData={data} />
}
