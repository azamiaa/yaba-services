export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            hero_services: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    subtitle: string | null
                    description: string | null
                    image_folder_url: string
                    sort_order: number
                    active: boolean
                    cta_text: string | null
                    cta_link: string | null
                    theme_color: string | null // Optional accent color override
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    subtitle?: string | null
                    description?: string | null
                    image_folder_url: string
                    sort_order: number
                    active?: boolean
                    cta_text?: string | null
                    cta_link?: string | null
                    theme_color?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    subtitle?: string | null
                    description?: string | null
                    image_folder_url?: string
                    sort_order?: number
                    active?: boolean
                    cta_text?: string | null
                    cta_link?: string | null
                    theme_color?: string | null
                }
            }
            services: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    slug: string
                    short_description: string | null
                    description: string | null
                    thumbnail_url: string | null
                    price: number | null
                    processing_time: string | null
                    category_id: string | null
                    requirements: string[] | null
                    is_active: boolean
                    is_featured: boolean
                    sort_order: number
                    seo_title: string | null
                    seo_description: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    slug: string
                    short_description?: string | null
                    description?: string | null
                    thumbnail_url?: string | null
                    price?: number | null
                    processing_time?: string | null
                    category_id?: string | null
                    requirements?: string[] | null
                    is_active?: boolean
                    is_featured?: boolean
                    sort_order?: number
                    seo_title?: string | null
                    seo_description?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    slug?: string
                    short_description?: string | null
                    description?: string | null
                    thumbnail_url?: string | null
                    price?: number | null
                    processing_time?: string | null
                    category_id?: string | null
                    requirements?: string[] | null
                    is_active?: boolean
                    is_featured?: boolean
                    sort_order?: number
                    seo_title?: string | null
                    seo_description?: string | null
                }
            }
            service_categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    icon: string | null
                    sort_order: number
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    icon?: string | null
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    icon?: string | null
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                }
            }
            notices: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    content: string
                    type: 'info' | 'alert' | 'warning' | 'success'
                    is_active: boolean
                    start_date: string
                    end_date: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    content: string
                    type?: 'info' | 'alert' | 'warning' | 'success'
                    is_active?: boolean
                    start_date?: string
                    end_date?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    content?: string
                    type?: 'info' | 'alert' | 'warning' | 'success'
                    is_active?: boolean
                    start_date?: string
                    end_date?: string | null
                }
            }
            inquiries: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    email: string
                    phone: string | null
                    subject: string
                    message: string
                    status: 'new' | 'responded' | 'closed' | 'read' | 'replied' | 'archived'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    email: string
                    phone?: string | null
                    subject: string
                    message: string
                    status?: 'new' | 'responded' | 'closed' | 'read' | 'replied' | 'archived'
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    email?: string
                    phone?: string | null
                    subject?: string
                    message?: string
                    status?: 'new' | 'responded' | 'closed' | 'read' | 'replied' | 'archived'
                }
            }
            appointments: {
                Row: {
                    id: string
                    created_at: string
                    user_name: string
                    user_email: string
                    user_phone: string
                    service_id: string | null
                    requested_date: string
                    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
                    admin_notes: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_name: string
                    user_email: string
                    user_phone: string
                    service_id?: string | null
                    requested_date: string
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
                    admin_notes?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_name?: string
                    user_email?: string
                    user_phone?: string
                    service_id?: string | null
                    requested_date?: string
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
                    admin_notes?: string | null
                }
            }
            cms_pages: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    slug: string
                    title: string
                    content: any // JSONB
                    seo_title: string | null
                    seo_description: string | null
                    is_published: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    slug: string
                    title: string
                    content?: any
                    seo_title?: string | null
                    seo_description?: string | null
                    is_published?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    slug?: string
                    title?: string
                    content?: any
                    seo_title?: string | null
                    seo_description?: string | null
                    is_published?: boolean
                }
            }
            testimonials: {
                Row: {
                    id: string
                    created_at: string
                    author_name: string
                    content: string
                    rating: number
                    role: string | null
                    is_approved: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    author_name: string
                    content: string
                    rating?: number
                    role?: string | null
                    is_approved?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    author_name?: string
                    content?: string
                    rating?: number
                    role?: string | null
                    is_approved?: boolean
                }
            }
            site_settings: {
                Row: {
                    id: string
                    key: string
                    value: any
                    label: string | null
                    description: string | null
                    group_name: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    value: any
                    label?: string | null
                    description?: string | null
                    group_name?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    key?: string
                    value?: any
                    label?: string | null
                    description?: string | null
                    group_name?: string | null
                    created_at?: string
                }
            }
            user_roles: {
                Row: {
                    id: string
                    user_id: string
                    email: string | null
                    role: 'admin' | 'editor' | 'staff' | 'user'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    email?: string | null
                    role: 'admin' | 'editor' | 'staff' | 'user'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    email?: string | null
                    role?: 'admin' | 'editor' | 'staff' | 'user'
                    created_at?: string
                }
            }
        }
    }
}
