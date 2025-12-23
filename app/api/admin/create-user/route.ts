import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Database } from '@/types/supabase'

export async function POST(request: Request) {
    // Check for placeholder service role key
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey || serviceKey === 'your-service-role-key') {
        return NextResponse.json({
            error: 'Configuration Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. Please see the implementation plan for instructions.'
        }, { status: 500 })
    }

    try {
        const { email, password, role } = await request.json()

        // 1. Get the access token from Authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
        }
        const token = authHeader.split(' ')[1]

        // 2. Initialise a temporary client to verify the requester's identity
        const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 3. Verify that the requester is an admin in the user_roles table
        const { data: roleData, error: roleError } = await (supabaseAdmin
            .from('user_roles') as any)
            .select('role')
            .eq('user_id', user.id)
            .single()

        if (roleError) {
            return NextResponse.json({ error: `Forbidden: Could not verify permissions. ${roleError.message}` }, { status: 403 })
        }

        const currentRole = (roleData as any)?.role
        if (currentRole !== 'admin') {
            return NextResponse.json({
                error: `Forbidden: Admin access required. Your current role is '${currentRole || 'none'}'.`
            }, { status: 403 })
        }

        // 4. Create the user using Supabase Admin API
        const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm so they can login immediately
        })

        if (createUserError) throw createUserError

        if (authUser.user) {
            // Note: The SQL trigger 'on_auth_user_created' in public.user_roles 
            // will automatically create a row with role='user'.
            // However, we explicitly update it here to ensure email is synced 
            // and role is set immediately for the admin UI.
            const { error: updateError } = await (supabaseAdmin
                .from('user_roles') as any)
                .update({
                    email: authUser.user.email,
                    role: role || 'user'
                })
                .eq('user_id', authUser.user.id)

            if (updateError) {
                console.error('Error updating profile:', updateError)
            }
        }

        return NextResponse.json({
            success: true,
            user_id: authUser.user?.id,
            email: authUser.user?.email
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
