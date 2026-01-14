"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { LayoutDashboard, User, BookOpen, MessageCircle, Users as UsersIcon, Bell, LogOut, Cpu } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [userName, setUserName] = useState("Student");

    // Basic Auth Check & Profile Load
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/login');
                return;
            }

            // Fetch profile name
            const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single();
            if (data?.full_name) setUserName(data.full_name);
        };
        checkUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };

    const navItems = [
        { href: "/student/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/student/my-courses", label: "My Courses", icon: BookOpen },
        { href: "/student/messages", label: "Messages", icon: MessageCircle },
        { href: "/student/find-students", label: "Find Students", icon: UsersIcon },
        { href: "/student/notifications", label: "Notifications", icon: Bell },
        { href: "/student/ai-tools", label: "AI Tools", icon: Cpu },
        { href: "/student/profile", label: "Profile", icon: User },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
                    <span className="font-bold text-xl text-gray-800">Deedox</span>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                            {userName[0]}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{userName}</p>
                            <p className="text-xs text-gray-500">Student Account</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 text-sm font-medium hover:text-red-600 transition-colors">
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
