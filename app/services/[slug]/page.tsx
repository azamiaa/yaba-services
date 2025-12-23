import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Clock, CheckCircle, IndianRupee } from 'lucide-react'
import { Database } from '@/types/supabase'

type Props = {
    params: Promise<{ slug: string }>
}

export default async function ServiceDetail({ params }: Props) {
    const { slug } = await params

    const { data } = await supabase
        .from('services')
        .select('*, service_categories(name)')
        .eq('slug', slug)
        .maybeSingle()

    const service = data as (Database['public']['Tables']['services']['Row'] & {
        service_categories: { name: string } | null
    }) | null

    if (!service) {
        notFound()
    }

    return (
        <article className="min-h-screen pt-32 pb-20 bg-white">
            <div className="container mx-auto px-6">
                <Link href="/" className="inline-flex items-center text-sm font-bold uppercase tracking-widest mb-8 text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Home
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gray-100 mb-6">
                            {service.service_categories?.name || 'Uncategorized'}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter text-balance">
                            {service.title}
                        </h1>

                        <div className="prose prose-lg prose-neutral max-w-none">
                            <p className="text-xl leading-relaxed text-gray-600 mb-8 font-light">
                                {service.short_description}
                            </p>
                            <div className="border-t border-gray-100 py-8">
                                <h3 className="text-2xl font-bold mb-4">Description</h3>
                                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{service.description}</p>
                            </div>
                            {service.requirements && service.requirements.length > 0 && (
                                <div className="border-t border-gray-100 py-8">
                                    <h3 className="text-2xl font-bold mb-6">Required specific documents</h3>
                                    <ul className="space-y-4">
                                        {service.requirements.map((req: string, i: number) => (
                                            <li key={i} className="flex items-start p-4 bg-gray-50 rounded-lg">
                                                <CheckCircle className="mt-1 mr-3 text-black shrink-0" size={20} />
                                                <span className="font-medium">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 p-8 rounded-2xl sticky top-32 border border-gray-100">
                            <h3 className="text-xl font-bold mb-6 border-b border-gray-200 pb-4">Service Overview</h3>

                            <div className="space-y-6">
                                {service.processing_time && (
                                    <div className="flex items-center">
                                        <Clock className="mr-4 text-gray-400" size={24} />
                                        <div>
                                            <p className="text-xs uppercase text-gray-400 font-bold tracking-widest">Processing Time</p>
                                            <p className="font-semibold text-lg">{service.processing_time}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <IndianRupee className="mr-4 text-gray-400" size={24} />
                                    <div>
                                        <p className="text-xs uppercase text-gray-400 font-bold tracking-widest">Service Fee</p>
                                        <p className="text-2xl font-bold mb-0">
                                            {service.price ? `₹${service.price}` : 'Consult'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <Link href={`/appointment?service=${service.id}`}>
                                    <Button size="lg" className="w-full text-base py-6 bg-black text-white hover:bg-gray-800">
                                        Book Appointment
                                    </Button>
                                </Link>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    Secure handling • Fast processing
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}
