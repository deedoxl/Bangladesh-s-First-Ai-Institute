"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, User, Search, Circle } from "lucide-react";

export default function StudentMessages() {
    const supabase = createClient();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Init User & Fetch Student List
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);
                // Fetch all other users (students & admins)
                const { data } = await supabase.from('users').select('*').neq('id', user.id);
                if (data) setUsers(data);
            }
        };
        init();
    }, []);

    // 2. Fetch Messages when selecting a user
    useEffect(() => {
        if (!selectedUser || !currentUser) return;

        const fetchMessages = async () => {
            const { data } = await supabase.from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
                .order('sent_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages();

        // 3. Real-time Subscription for this chat
        const channel = supabase.channel('chat-room')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const msg = payload.new;
                // Only add if it belongs to this conversation
                if (
                    (msg.sender_id === currentUser.id && msg.receiver_id === selectedUser.id) ||
                    (msg.sender_id === selectedUser.id && msg.receiver_id === currentUser.id)
                ) {
                    setMessages(prev => [...prev, msg]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedUser, currentUser]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || !currentUser) return;

        const msgText = newMessage;
        setNewMessage(""); // Optimistic clear

        const { error } = await supabase.from('messages').insert({
            sender_id: currentUser.id,
            receiver_id: selectedUser.id,
            message_text: msgText,
            is_read: false
        });

        if (error) {
            console.error("Failed to send:", error);
            alert("Failed to send message");
        }
    };

    const filteredUsers = users.filter(u => u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!currentUser) return <div className="p-10 text-center">Loading chat...</div>;

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredUsers.map(user => (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 ${selectedUser?.id === user.id ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : ''}`}
                        >
                            <div className="relative">
                                {user.profile_image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={user.profile_image_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {user.full_name?.[0] || <User size={18} />}
                                    </div>
                                )}
                                {user.is_online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{user.full_name}</h4>
                                <p className="text-xs text-gray-500 truncate w-32">{user.role}</p>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No users found</div>}
                </div>
            </div>

            {/* Chat Window */}
            <div className="w-2/3 flex flex-col bg-white">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3 shadow-sm z-10">
                            {selectedUser.profile_image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={selectedUser.profile_image_url} alt={selectedUser.full_name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                    {selectedUser.full_name?.[0]}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-800">{selectedUser.full_name}</h3>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Circle size={8} className={selectedUser.is_online ? "text-green-500 fill-green-500" : "text-gray-300 fill-gray-300"} />
                                    {selectedUser.is_online ? "Online" : "Offline"}
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                            {messages.map(msg => {
                                const isMe = msg.sender_id === currentUser.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                                            {msg.message_text}
                                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <User size={40} className="text-gray-300" />
                        </div>
                        <p>Select a student to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
