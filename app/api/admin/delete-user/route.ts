import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export async function DELETE(request: Request) {
    // Check for placeholder service role key
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey || serviceKey === 'your-service-role-key') {
        return NextResponse.json({
            error: 'Configuration Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.'
        }, { status: 500 })
    }

    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // 1. Get the access token from Authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
        }
        const token = authHeader.split(' ')[1]

        // 2. Verify that the requester is an admin in the user_roles table
        const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: roleData, error: roleError } = await (supabaseAdmin
            .from('user_roles') as any)
            .select('role')
            .eq('user_id', user.id)
            .single()

        if (roleError || (roleData as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
        }

        // 3. Prevent self-deletion
        if (user.id === userId) {
            return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
        }

        // 4. Delete the user using Supabase Admin API
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (deleteError) throw deleteError

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        })

    } catch (error: any) {
        console.error('Delete API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
