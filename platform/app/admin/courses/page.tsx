"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit, Trash, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminCourses() {
    const supabase = createClient();
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
        if (data) setCourses(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const togglePublish = async (id: string, currentStatus: boolean) => {
        await supabase.from('courses').update({ is_published: !currentStatus }).eq('id', id);
        fetchCourses(); // Refresh
    };

    const deleteCourse = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await supabase.from('courses').delete().eq('id', id);
        fetchCourses();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
                <Link href="/admin/courses/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    <Plus size={18} /> Add New Course
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-sm font-bold text-gray-600">Title</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Instructor</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Status</th>
                                <th className="p-4 text-sm font-bold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{course.title}</td>
                                    <td className="p-4 text-gray-600">{course.instructor_name}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => togglePublish(course.id, course.is_published)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                            {course.is_published ? <><Eye size={12} /> Published</> : <><EyeOff size={12} /> Draft</>}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                        <button
                                            onClick={() => deleteCourse(course.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        ><Trash size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {courses.length === 0 && <div className="p-8 text-center text-gray-500">No courses found. Create one!</div>}
                </div>
            )}
        </div>
    );
}
