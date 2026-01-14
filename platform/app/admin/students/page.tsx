
"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '../../../../lib/supabase/client';
import { Mail, Search, User, Calendar, Shield } from 'lucide-react';

export default function AdminStudents() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const supabase = createClient();

    const fetchStudents = async () => {
        setLoading(true);
        // Filter for Students specifically as requested
        const { data, error } = await supabase
            .from('users')
            .select('*')
            // .eq('role', 'Student') // Optional: Strict filtering if desired, but seeing all users is usually better for admins. 
            // The user said "Show only users where role = 'student'". I will apply client side filter or DB filter.
            // Let's filter on the query to be safe.
            .eq('role', 'Student')
            .order('created_at', { ascending: false });

        if (data) setStudents(data);
        if (error) {
            console.error("Error fetching students:", error);
            alert(`Error fetching students: ${error.message}. Check RLS policies.`);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStudents();

        // Realtime Subscription
        const channel = supabase.channel('admin_students')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
                // Determine if we should refresh based on event
                if (payload.new && (payload.new as any).role === 'Student') {
                    fetchStudents(); // Refresh data to maintain sort order and consistency
                } else if (payload.eventType === 'DELETE') {
                    fetchStudents();
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const filteredStudents = students.filter(s =>
        (s.email?.toLowerCase().includes(search.toLowerCase())) ||
        (s.name?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-8 text-white min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Enrolled Students</h1>
                    <p className="text-white/40 text-sm">Manage all registered users and their details.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 w-64">
                    <Search size={18} className="text-white/40" />
                    <input
                        type="text"
                        placeholder="Search email or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/20"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-white/50">Loading students...</div>
            ) : (
                <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-2 text-xs text-white/20 font-mono">
                        Debug: Found {students.length} students (DB Connection: OK)
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase font-bold text-white/40">
                            <tr>
                                <th className="p-6">User</th>
                                <th className="p-6">Email</th>
                                <th className="p-6">Role</th>
                                <th className="p-6">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-deedox-accent-primary uppercase overflow-hidden">
                                                {student.avatar_url ? (
                                                    <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    (student.name?.[0] || student.email?.[0] || '?')
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{student.name || 'Unnamed'}</p>
                                                <p className="text-[10px] text-white/40 md:hidden">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-white/70 font-mono text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-white/20" />
                                            {student.email}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${student.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                                            {student.role || 'Student'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-white/40 text-sm">
                                        {new Date(student.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-white/30">
                                        No students found matching "{search}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
