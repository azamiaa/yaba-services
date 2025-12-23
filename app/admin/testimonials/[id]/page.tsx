'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/supabase'
import { TestimonialForm } from '../_components/TestimonialForm'
import { Loader2 } from 'lucide-react'

type Testimonial = Database['public']['Tables']['testimonials']['Row']

export default function EditTestimonial() {
    const params = useParams()
    const id = params.id as string
    const [data, setData] = useState<Testimonial | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('id', id)
                .single()

            if (data) setData(data)
            setLoading(false)
        }
        if (id) fetchData()
    }, [id])

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>
    if (!data) return <div>Testimonial not found</div>

    return <TestimonialForm initialData={data} />
}
