'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/supabase'
import { Loader2, User, Shield, AlertTriangle, Plus, X, Search, Mail, Lock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@supabase/supabase-js'

type UserRole = Database['public']['Tables']['user_roles']['Row']

export default function UsersAdmin() {
    const [users, setUsers] = useState<UserRole[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [userRole, setUserRole] = useState<'admin' | 'editor' | 'user' | null>(null)
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user' as UserRole['role']
    })
    const [submitting, setSubmitting] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await fetch('/api/admin/list-users', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            const result = await response.json()
            if (result.users) {
                setUsers(result.users)
            } else if (result.error) {
                console.error('Error fetching users:', result.error)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const checkRole = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single()

            const role = (roleData as any)?.role
            setUserRole(role)

            if (role !== 'admin') {
                router.push('/admin')
                return
            }

            fetchUsers()
        }

        checkRole()
    }, [router])

    const updateRole = async (userId: string, newRole: 'admin' | 'editor' | 'user') => {
        if (!confirm(`Change role for user ${userId} to ${newRole}?`)) {
            fetchUsers() // Reset selects if cancelled
            return
        }

        const { error } = await (supabase.from('user_roles') as any)
            .update({ role: newRole })
            .eq('user_id', userId)

        if (!error) {
            setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u))
            alert('Role updated successfully')
        } else {
            console.error('Error updating role:', error)
            alert('Failed to update role. Please ensure you have sufficient permissions.')
            fetchUsers()
        }
    }

    const deleteUser = async (userId: string, userEmail: string | null) => {
        if (!confirm(`Are you absolutely sure you want to PERMANENTLY delete user ${userEmail || userId}? This action cannot be undone.`)) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                alert('Your session has expired. Please log in again.')
                return
            }

            const response = await fetch('/api/admin/delete-user', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ userId })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete user')
            }

            alert('User deleted successfully')
            fetchUsers()
        } catch (error: any) {
            console.error('Error deleting user:', error)
            alert(error.message || 'Failed to delete user')
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                alert('Your session has expired. Please log in again.')
                return
            }

            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create user')
            }

            // After successful creation, the role is set to 'user' by default via SQL trigger.
            // If a different role was selected, update it.
            if (formData.role !== 'user' && result.user_id) {
                const { error: roleError } = await (supabase.from('user_roles') as any)
                    .update({ role: formData.role })
                    .eq('user_id', result.user_id) // Use the user_id returned from the API

                if (roleError) {
                    console.error('Error setting specialized role:', roleError)
                    alert(`User created, but failed to set role to ${formData.role}: ${roleError.message}`)
                } else {
                    alert('User created and role set successfully!')
                }
            } else {
                alert('User created successfully!')
            }

            setIsModalOpen(false)
            setFormData({ email: '', password: '', role: 'user' })
            fetchUsers() // Re-fetch users to show the new user and their role
        } catch (error: any) {
            console.error('Error creating user:', error)
            // If the error message is from our API, it will be in result.error
            alert(error.message || 'Failed to create user. Please check the console for more details.')
        } finally {
            setSubmitting(false)
        }
    }

    const filteredUsers = users.filter(u =>
        (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        u.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight text-gray-900">Users & Roles</h1>
                    <p className="text-sm text-gray-500">Manage system access privileges.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-black text-white rounded-xl h-12 px-6 active-scale tap-highlight-none"
                >
                    <Plus size={20} />
                    <span>Add New User</span>
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by email or user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                />
            </div>

            <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-orange-600" size={20} />
                </div>
                <div>
                    <p className="text-sm text-orange-900 font-medium">Identity & Permissions</p>
                    <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                        User emails are synced from the authentication provider. If an email is missing, it will sync automatically on their next update.
                        Only authorized administrators should create new accounts or modify roles.
                    </p>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Identity</th>
                            <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Permission Level</th>
                            <th className="px-8 py-5 font-bold text-gray-400 text-right uppercase tracking-widest text-[10px]">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map((user) => (
                            <tr key={user.user_id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                            <User size={20} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{user.email || 'Mystery User'}</div>
                                            <div className="text-[10px] font-mono text-gray-400 mt-1">{user.user_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                        user.role === 'editor' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            user.role === 'staff' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                                'bg-gray-50 text-gray-700 border border-gray-100'
                                        }`}>
                                        <Shield size={12} />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <select
                                            className="text-[10px] uppercase tracking-widest font-bold border border-gray-100 rounded-xl p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-black transition-all appearance-none cursor-pointer hover:bg-white min-w-[120px] text-center"
                                            value={user.role}
                                            onChange={(e) => updateRole(user.user_id, e.target.value as any)}
                                        >
                                            <option value="user">USER Access</option>
                                            <option value="staff">STAFF Access</option>
                                            <option value="editor">EDITOR Access</option>
                                            <option value="admin">ADMIN Full</option>
                                        </select>
                                        <button
                                            onClick={() => deleteUser(user.user_id, user.email)}
                                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active-scale"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredUsers.map((user) => (
                    <div key={user.user_id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5 active-scale tap-highlight-none">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                                    <User className="text-gray-400" size={24} />
                                </div>
                                <div className="max-w-[180px]">
                                    <h3 className="font-bold text-gray-900 truncate">{user.email || 'Mystery User'}</h3>
                                    <p className="font-mono text-[10px] text-gray-400 mt-0.5 truncate">{user.user_id}</p>
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1 ${user.role === 'admin' ? 'text-purple-600' :
                                        user.role === 'editor' ? 'text-blue-600' :
                                            user.role === 'staff' ? 'text-orange-600' :
                                                'text-gray-500'
                                        }`}>
                                        <Shield size={10} />
                                        {user.role}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteUser(user.user_id, user.email)}
                                className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center active-scale"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <select
                                className="w-full text-[10px] uppercase tracking-widest font-bold border-none rounded-2xl py-4 px-6 bg-gray-50 outline-none appearance-none text-center active-scale shadow-inner"
                                value={user.role}
                                onChange={(e) => updateRole(user.user_id, e.target.value as any)}
                            >
                                <option value="user">ASSIGN USER ROLE</option>
                                <option value="staff">ASSIGN STAFF ROLE</option>
                                <option value="editor">ASSIGN EDITOR ROLE</option>
                                <option value="admin">ASSIGN ADMIN ROLE</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="py-20 text-center text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-200">
                    No users matching "{searchTerm}"
                </div>
            )}

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Create User</h2>
                                    <p className="text-sm text-gray-500 mt-1">Register new system access.</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="user@example.com"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-black/5 focus:ring-4 focus:ring-black/5 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Secure Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                required
                                                type="password"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-black/5 focus:ring-4 focus:ring-black/5 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Initial Role</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['user', 'staff', 'editor', 'admin'] as const).map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, role: role as any })}
                                                    className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.role === role
                                                        ? 'bg-black text-white shadow-lg shadow-black/20'
                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs active-scale transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Confirm Registration'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
