import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Database } from '@/types/supabase'

export async function GET(request: Request) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey || serviceKey === 'your-service-role-key') {
        return NextResponse.json({
            error: 'Configuration Error: SUPABASE_SERVICE_ROLE_KEY is not set.'
        }, { status: 500 })
    }

    try {
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

        // 3. Verify that the requester is an admin
        const { data: roleData, error: roleError } = await (supabaseAdmin
            .from('user_roles') as any)
            .select('role')
            .eq('user_id', user.id)
            .single()

        if (roleError || (roleData as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 })
        }

        // 4. Fetch all users from Supabase Auth
        const { data: { users: authUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        if (listError) throw listError

        // 5. Fetch all roles from user_roles table
        const { data: roles, error: rolesFetchError } = await (supabaseAdmin
            .from('user_roles') as any)
            .select('*')

        if (rolesFetchError) throw rolesFetchError

        // 6. Merge data
        const mergedUsers = authUsers.map(authUser => {
            const roleEntry = roles?.find((r: any) => r.user_id === authUser.id)
            return {
                user_id: authUser.id,
                email: authUser.email,
                role: roleEntry?.role || 'user',
                created_at: authUser.created_at,
                last_sign_in_at: authUser.last_sign_in_at
            }
        })

        return NextResponse.json({ users: mergedUsers })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
