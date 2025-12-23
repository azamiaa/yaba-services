'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { NoticeForm } from '../_components/NoticeForm'
import { Loader2 } from 'lucide-react'

type Notice = Database['public']['Tables']['notices']['Row']

export default function EditNotice() {
    const params = useParams()
    const id = params.id as string
    const [data, setData] = useState<Notice | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('notices')
                .select('*')
                .eq('id', id)
                .single()

            if (data) setData(data)
            setLoading(false)
        }
        if (id) fetchData()
    }, [id])

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>
    if (!data) return <div>Notice not found</div>

    return <NoticeForm initialData={data} />
}
