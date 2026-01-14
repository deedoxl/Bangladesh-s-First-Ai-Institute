
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Zap, HelpCircle, Briefcase, MessageCircle, Send, Plus, Users, Hash, ImageIcon, Heart, MessageSquare, Loader2, X, Upload, MoreHorizontal, FileText, Check, LayoutDashboard, LogOut, Code, Bot, Bell, Search, Edit, CheckCircle, Compass, Trash2, Menu, Newspaper, ChevronRight, Database, Settings, Globe, Cpu } from 'lucide-react';
import { cn } from '../utils/cn';
import { Link, useNavigate } from 'react-router-dom';
import News from './News';
import DashboardHero from '../components/student/DashboardHero'; // [NEW] Hero Slider
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabaseClient';
import { uploadToCloudinary } from '../lib/cloudinary';
import { chatWithAI } from '../lib/aiHandler';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { settings, aiChatSettings, aiModels, currentUser, loadingAuth, programs } = useData(); // Use Global Auth (V24)

    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | community | partners | ai_suite
    const [aiMode, setAiMode] = useState('deedox_ai'); // deedox_ai | deedox_help | startup_discuss
    const messagesEndRef = useRef(null); // [NEW] Ref for Auto-Scrolling

    // --- Supabase State ---
    // const [currentUser, setCurrentUser] = useState(null); // REMOVED: Use Global
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [partners, setPartners] = useState([]);

    // --- Chat State ---
    const [communityMessages, setCommunityMessages] = useState([]);
    const [communityInput, setCommunityInput] = useState('');

    const [dmHistory, setDmHistory] = useState({});


    // --- Community Group State ---
    const [communities, setCommunities] = useState([]); // List of communities
    const [activeCommunityId, setActiveCommunityId] = useState(null); // null = Global Chat
    const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
    const [newCommunityName, setNewCommunityName] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showAllMembers, setShowAllMembers] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false); // [NEW] Mobile AI Sidebar Toggle // Toggle for member list
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // [NEW] Global Mobile Navigation Toggle

    // --- Navigation Config (Shared) ---
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', accent: 'text-[#a3e635]' },
        { id: 'community', icon: Users, label: 'Community' },
        { id: 'social', icon: Hash, label: 'Student Social Feed' },
        { id: 'partners', icon: Search, label: 'Co-Founder' },
        { id: 'connections', icon: Heart, label: 'My Connections' },
        { id: 'ai_suite', icon: MessageCircle, label: 'AI Chat' },
        { id: 'news', icon: Newspaper, label: 'AI News' },
        { id: 'programs', icon: Compass, label: 'Explore AI Programs' },
        { id: 'settings', icon: Settings, label: 'Settings', highlight: true }
    ];

    // Scroll Logic - Container Ref (More Robust)
    const communityChatContainerRef = useRef(null);
    const membersListRef = useRef(null); // Ref for scrolling members list
    const scrollToBottom = () => {
        if (communityChatContainerRef.current) {
            communityChatContainerRef.current.scrollTop = communityChatContainerRef.current.scrollHeight;
        }
    };





    // Auto-scroll logic (Instant Snap)
    useEffect(() => {
        if (activeTab === 'community' && communityMessages.length > 0) {
            // Aggressive scroll ensures we hit bottom even if layout shifts occur
            scrollToBottom();
            setTimeout(scrollToBottom, 100);
            setTimeout(scrollToBottom, 500); // Catch late renders
        }
    }, [communityMessages, activeTab]);

    // DEBUG: Monitor Auth State
    useEffect(() => {
        console.log("DASHBOARD STATE:", { currentUser, loadingAuth, loadingProfile, userProfile });
    }, [currentUser, loadingAuth, loadingProfile, userProfile]);

    // FAILSAFE: Force loading off after 3 seconds if stuck
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loadingProfile) {
                console.warn("⚠️ Force-disabling loading state due to timeout.");
                setLoadingProfile(false);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [loadingProfile]);

    // Check authentication and load profile
    useEffect(() => {
        if (loadingAuth) return;
        if (!currentUser) {
            navigate('/student/login');
            return;
        }

        const fetchProfileData = async () => {
            // [OPTIMIZATION] Load from cache first for instant UI
            const cached = localStorage.getItem(`profile_cache_${currentUser.id}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                setUserProfile(parsed);
                setTempProfile(parsed);
                setLoadingProfile(false); // Show UI immediately
            }

            if (!supabase) return;

            // [ARCH_FIX] Mock Profile Bypass for Local Admin
            if (currentUser.id === 'local-admin-id') {
                const mock = currentUser;
                setUserProfile(mock);
                setLoadingProfile(false);
                return;
            }

            // Fetch Profile from 'users' table
            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (profile) {
                setUserProfile(profile);
                setTempProfile(profile);
                // Update cache
                localStorage.setItem(`profile_cache_${currentUser.id}`, JSON.stringify(profile));
            } else {
                console.log("Profile not found immediately. Trigger delay?");
            }
            setLoadingProfile(false);

            // Fetch Partners (Only Listed)
            const { data: allUsers } = await supabase
                .from('users')
                .select('*')
                .eq('is_listed', true)
                .neq('id', currentUser.id);
            if (allUsers) setPartners(allUsers);
        };
        fetchProfileData();
    }, [currentUser, loadingAuth, navigate]);

    // --- Fetch Communities & Realtime Presence ---
    useEffect(() => {
        if (!currentUser) return;

        const fetchCommunities = async () => {
            const { data } = await supabase.from('communities').select('*').order('created_at', { ascending: false });
            if (data) {
                setCommunities(data);
                if (!activeCommunityId && data.length > 0) setActiveCommunityId(data[0].id);
            }
        };
        fetchCommunities();

        // Join Community Channel for Messages & Presence
        const channelId = activeCommunityId ? `community:${activeCommunityId}` : 'community_global';
        const channel = supabase.channel(channelId)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages', filter: activeCommunityId ? `community_id=eq.${activeCommunityId}` : undefined }, (payload) => {
                // Fetch full message details (with sender info)
                // Or better, just trigger a re-fetch since mapping sender is complex in pure payload
                if (activeCommunityId) fetchCommunityMessages(activeCommunityId);
            })
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const users = [];
                for (const id in newState) {
                    // Each user has an array of presences (for multiple tabs/devices)
                    users.push(newState[id][0]);
                }
                setOnlineUsers(users);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        online_at: new Date().toISOString(),
                        user_id: currentUser.id,
                        name: userProfile?.name || currentUser.email || 'Guest',
                        role: userProfile?.role || 'Member',
                        avatar_url: userProfile?.avatar_url
                    });
                }
            });

        return () => { supabase.removeChannel(channel); };
    }, [activeCommunityId, currentUser, userProfile]);


    // --- Realtime Subscriptions ---
    useEffect(() => {
        if (!currentUser) return;

        // Fetch initial messages for current view (Global or Specific Community)
        const fetchMessages = async () => {
            // 1. Fetch Community/Global Messages
            // 1. Fetch Community Messages
            if (activeCommunityId) {
                const { data: comMsgs } = await supabase
                    .from('community_messages')
                    .select('*, sender:users(name, role, avatar_url)')
                    .eq('community_id', activeCommunityId)
                    .order('created_at', { ascending: true });

                if (comMsgs) {
                    setCommunityMessages(comMsgs.map(m => ({
                        id: m.id,
                        user: m.sender?.name || 'Unknown',
                        role: m.sender?.role || 'Member',
                        text: m.content,
                        isMe: m.sender_id === currentUser.id,
                        avatarUrl: m.sender?.avatar_url
                    })));
                }
            }




            // 2. Fetch DMs
            try {
                console.log("Fetching DMs...");
                const { data: dmMsgs, error } = await supabase.from('messages').select('*').or('sender_id.eq.' + currentUser.id + ',receiver_id.eq.' + currentUser.id).order('created_at', { ascending: true });

                if (dmMsgs) {
                    const history = {};
                    const counts = {};
                    dmMsgs.forEach(msg => {
                        const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
                        if (!partnerId) return;
                        if (!history[partnerId]) history[partnerId] = [];
                        history[partnerId].push({
                            id: msg.id,
                            text: msg.text || msg.message_text,
                            image_url: msg.image_url,
                            isMe: msg.sender_id === currentUser.id,
                            createdAt: msg.created_at
                        });

                        // Count unread
                        if (msg.receiver_id === currentUser.id && msg.is_read === false) {
                            counts[partnerId] = (counts[partnerId] || 0) + 1;
                        }
                    });
                    setDmHistory(history);
                    setUnreadCounts(counts);
                }
            } catch (err) {
                console.error("Error fetching DMs:", err);
            }
        };

        fetchMessages();

        // Subscribe to NEW messages
        // Subscribe to NEW messages
        const channel = supabase.channel('realtime_chats')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages' }, async (payload) => {
                // Handle Community Message
                if (payload.new.community_id === activeCommunityId) {
                    const { data: sender } = await supabase.from('users').select('name, role, avatar_url').eq('id', payload.new.sender_id).single();
                    setCommunityMessages(prev => [...prev, {
                        id: payload.new.id,
                        user: sender?.name || 'Unknown',
                        role: sender?.role || 'Member',
                        text: payload.new.content,
                        isMe: payload.new.sender_id === currentUser.id,
                        avatarUrl: sender?.avatar_url
                    }]);
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                const newMsg = payload.new;
                // Handle DM Message
                if (newMsg.sender_id === currentUser.id || newMsg.receiver_id === currentUser.id) {
                    const partnerId = newMsg.sender_id === currentUser.id ? newMsg.receiver_id : newMsg.sender_id;

                    // Update History
                    setDmHistory(prev => {
                        const prevList = prev[partnerId] || [];
                        return {
                            ...prev,
                            [partnerId]: [...prevList, {
                                id: newMsg.id,
                                text: newMsg.text || newMsg.message_text,
                                image_url: newMsg.image_url,
                                isMe: newMsg.sender_id === currentUser.id,
                                createdAt: newMsg.created_at
                            }]
                        };
                    });

                    // Update Notification Count
                    if (newMsg.receiver_id === currentUser.id) {
                        if (activeChatPartner?.id !== newMsg.sender_id) {
                            setUnreadCounts(prev => ({
                                ...prev,
                                [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1
                            }));
                        } else {
                            // If chat is OPEN, mark as read immediately
                            await supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
                        }
                    }
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };

    }, [currentUser, activeCommunityId]);


    // --- Old Local Persistence (Chat with AI) ---
    const chatStorageKey = 'deedox_chat_' + (currentUser?.email || 'guest');
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(chatStorageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });
    useEffect(() => {
        if (messages.length > 0) localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    }, [messages, chatStorageKey]);


    // --- Mock Data constants ---
    const aiModes = {
        'deedox_ai': { name: 'Deedox AI', icon: Zap, color: 'text-yellow-400', Bg: 'bg-yellow-400/10', systemPrompt: "You are Deedox AI, a smart assistant for startup founders." },
        'deedox_help': { name: 'Support Bot', icon: HelpCircle, color: 'text-blue-400', Bg: 'bg-blue-400/10', systemPrompt: "You are a support bot for the Deedox platform." },
        'startup_discuss': { name: 'Startup Coach', icon: Briefcase, color: 'text-green-400', Bg: 'bg-green-400/10', systemPrompt: "You are a YC-level startup coach." }
    };

    // Helper for display name
    const getModelDisplayName = (id) => aiModels?.items?.find(m => m.id === id)?.display_name || id;

    // --- Profile State ---
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempProfile, setTempProfile] = useState(null);
    const avatarFileRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    // Messaging Modal State
    const [activeChatPartner, setActiveChatPartner] = useState(null);
    const [dmInput, setDmInput] = useState('');
    const [dmImage, setDmImage] = useState(null); // Added for Image Support
    const [unreadCounts, setUnreadCounts] = useState({});

    // --- Search & Follow State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [following, setFollowing] = useState([]); // Array of user IDs I follow

    // --- AI State ---
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingSeconds, setThinkingSeconds] = useState(0);

    // Timer Logic for AI Thinking
    useEffect(() => {
        let interval;
        if (isLoading) {
            setThinkingSeconds(0);
            interval = setInterval(() => {
                setThinkingSeconds(s => (parseFloat(s) + 0.1).toFixed(1));
            }, 100);
        } else {
            setThinkingSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isLoading]);
    const [selectedModel, setSelectedModel] = useState(() => {
        if (!aiModels?.items) return [];
        // V18: Filter by show_on_student_dashboard
        const defaults = aiModels.items.filter(m => m.is_default && m.enabled && m.show_on_student_dashboard).map(m => m.id);
        if (defaults.length > 0) return defaults;
        const firstEnabled = aiModels.items.find(m => m.enabled && m.show_on_student_dashboard);
        return firstEnabled ? [firstEnabled.id] : [];
    });
    const chatEndRef = useRef(null);
    const dmEndRef = useRef(null);

    // Sync defaults when data loads (Student)
    useEffect(() => {
        if (aiModels?.items?.length > 0 && (!selectedModel || selectedModel.length === 0)) {
            const defaults = aiModels.items.filter(m => m.is_default && m.enabled && m.show_on_student_dashboard).map(m => m.id);
            if (defaults.length > 0) {
                setSelectedModel(defaults);
            } else {
                const firstEnabled = aiModels.items.find(m => m.enabled && m.show_on_student_dashboard);
                if (firstEnabled) setSelectedModel([firstEnabled.id]);
            }
        }
    }, [aiModels?.items]);

    // Scroll handlers
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, communityMessages]);
    useEffect(() => { dmEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeChatPartner, dmHistory]);


    // Auto-scroll to bottom of chat
    const chatContainerRef = useRef(null);
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [communityMessages, dmHistory, activeTab, activeChatPartner, activeCommunityId]);

    // --- Fetch Following List ---
    useEffect(() => {
        const fetchFollowing = async () => {
            if (!currentUser) return;
            const { data } = await supabase.from('follows').select('following_id').eq('follower_id', currentUser.id);
            if (data) setFollowing(data.map(f => f.following_id));
        };
        fetchFollowing();
    }, [currentUser]);

    const handleFollow = async (partnerId) => {
        const isFollowing = following.includes(partnerId);
        if (isFollowing) {
            // Unfollow
            setFollowing(prev => prev.filter(id => id !== partnerId)); // Optimistic
            const response = await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', partnerId);
            if (response.error) console.error("Error unfollowing:", response.error);
        } else {
            // Follow
            setFollowing(prev => [...prev, partnerId]); // Optimistic
            const response = await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: partnerId });
            if (response.error) console.error("Error following:", response.error);
        }
    };

    // --- Delete Community Message ---
    const handleDeleteCommunityMessage = async (messageId) => {
        if (!confirm("Delete this message permanently?")) return;

        // Optimistic Update
        setCommunityMessages(prev => prev.filter(msg => msg.id !== messageId));

        const { error } = await supabase.from('community_messages').delete().eq('id', messageId);

        if (error) {
            console.error("Error deleting message:", error);
            alert("Failed to delete message. (Check permissions)");
            // Rollback (Simplistic: Reload chat to sync)
            setActiveCommunityId(prev => { const t = prev; setActiveCommunityId(null); setTimeout(() => setActiveCommunityId(t), 10); return prev; });
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    // Fallback loading state
    if (loadingProfile || !userProfile) return <div className="min-h-screen bg-[#020410] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> Loading Profile...</div>;


    const handleMessagePartner = async (partner) => {
        setActiveChatPartner(partner);

        // Mark as read locally and in DB
        if (unreadCounts[partner.id]) {
            setUnreadCounts(prev => ({ ...prev, [partner.id]: 0 }));
            await supabase.from('messages')
                .update({ is_read: true })
                .eq('sender_id', partner.id)
                .eq('receiver_id', currentUser.id);
        }
    };

    // --- Helper: Upload to Supabase ---
    const uploadToSupabase = async (file, bucket) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) {
            console.error(`Upload to ${bucket} failed:`, error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return publicUrl;
    };

    // --- Profile Handlers ---
    const saveProfile = async () => {
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: tempProfile.name,
                    role: tempProfile.title || tempProfile.role,
                    bio: tempProfile.bio,
                    is_listed: tempProfile.isListed || false
                })
                .eq('id', currentUser.id);

            if (error) throw error;
            setUserProfile(tempProfile);
            setIsEditingProfile(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('Failed to save profile: ' + error.message);
        }
    };

    const handleAvatarUpload = async (file) => {
        if (file) {
            setIsUploading(true);
            try {
                const url = await uploadToSupabase(file, 'avatars');
                if (url) {
                    setTempProfile(prev => ({ ...prev, avatar_url: url, avatarUrl: url }));
                    // Update DB immediately
                    const { error: updateError } = await supabase.from('users').update({ avatar_url: url }).eq('id', currentUser.id);
                    if (updateError) throw updateError;

                    console.log("Profile image updated successfully in DB");
                    setUserProfile(prev => ({ ...prev, avatar_url: url, avatarUrl: url }));
                }
            } catch (error) {
                console.error("Upload failed", error);
                alert("Upload failed: " + error.message);
            } finally {
                setIsUploading(false);
            }
        }
    };

    // --- AI Logic (Updated for Multi-Model) ---
    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        let currentModels = Array.isArray(selectedModel) ? selectedModel : [selectedModel];

        // [FIX] Auto-select default model if state is empty but models exist
        if (currentModels.length === 0 && aiModels?.items) {
            const defaults = aiModels.items.filter(m => m.is_default && m.enabled && m.show_on_student_dashboard).map(m => m.id);
            if (defaults.length > 0) {
                currentModels = defaults;
                setSelectedModel(defaults);
            } else {
                const first = aiModels.items.find(m => m.enabled && m.show_on_student_dashboard);
                if (first) {
                    currentModels = [first.id];
                    setSelectedModel([first.id]);
                }
            }
        }

        if (currentModels.length === 0) {
            alert("Please select at least one model.");
            if (selectedModel.length > 0) {
                // [CHANGE] Using APPEND logic + Thinking Logic
                const startTime = Date.now();
                const userMsgId = Date.now();

                const newUserMsg = {
                    id: userMsgId,
                    role: 'user',
                    content: input, // Changed from 'prompt' to 'input'
                    model: 'User',
                    startTime,
                    thoughtTime: null
                };

                setMessages(prev => [...prev, newUserMsg]);
                setInput(''); // Changed from 'setPrompt' to 'setInput'
                setThinkingSeconds(0);
                setIsLoading(true);

                // [FIX] Scroll to bottom immediately on send
                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);

                try {
                    // If multiple models selected, loop through them
                    // For simplicity in this edit, assuming single or handling array in UI
                    // Standardizing to chatWithAI single call per model
                    const modelId = selectedModel[0]; // Primary selected (changed from selectedModels)

                    const result = await chatWithAI({
                        modelId: modelId,
                        messages: [{ role: "user", content: input }], // Changed from 'prompt' to 'input'
                    });

                    const endTime = Date.now();
                    const duration = ((endTime - startTime) / 1000).toFixed(1);

                    // Update User Message with duration
                    setMessages(prev => prev.map(msg =>
                        msg.id === userMsgId ? { ...msg, thoughtTime: duration } : msg
                    ));

                    // Add AI Message
                    setMessages(prev => [...prev, { ...result, role: 'assistant', modelName: getModelDisplayName(modelId), id: Date.now() + 1 }]); // Changed role to 'assistant' and getModelName to getModelDisplayName

                } catch (error) {
                    console.error("Chat Error:", error);
                    setMessages(prev => [...prev, {
                        role: 'assistant', // Changed role to 'assistant'
                        content: "Error: " + (error.message || "Failed to get response"),
                        isError: true,
                        id: Date.now() + 1
                    }]);
                } finally {
                    setIsLoading(false);
                    // [FIX] Scroll to bottom on complete
                    setTimeout(() => {
                        if (messagesEndRef.current) {
                            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 100);
                }
            } else {
                // Handle no model selected
            }
            return; // Added return to exit if no model is selected and the premium logic is not triggered
        }

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // V25: Secure Backend Proxy via aiHandler (No Client Key)
            const fetchPromises = currentModels.map(async (modelId) => {
                // Prepare context
                const history = messages.map(m => ({ role: m.role, content: m.content }));
                const fullMessages = [
                    { "role": "system", "content": aiModes[aiMode].systemPrompt },
                    ...history,
                    userMsg
                ];

                // Call Secure Handler
                const result = await chatWithAI({ modelId, messages: fullMessages });

                if (result.error) {
                    return { role: 'assistant', content: 'Error: ' + result.content, isError: true, modelName: getModelDisplayName(modelId) };
                }
                return { role: 'assistant', content: result.content, modelName: getModelDisplayName(modelId) };
            });

            const results = await Promise.all(fetchPromises);
            setMessages(prev => [...prev, ...results]);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'System Error: ' + error.message, isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ... [existing community handlers] ... 

    // [SKIPPING LINES 589-1099 for brevity in this tool call, replacing mainly Logic + Layout in Render]
    /* NOTE: I cannot skip lines in replace_file_content like this. 
       I must target specific chunks. I will split this into two calls:
       1. Logic Fix (handleSendMessage)
       2. Layout Fix (Render Return)
    */

    // --- Handlers ---
    const handleCommunitySend = async (e) => {
        e?.preventDefault();
        if (!communityInput.trim()) return;

        const text = communityInput;
        setCommunityInput(''); // Optimistic clear

        // Send to Supabase
        const { error } = await supabase.from('community_messages').insert([{
            sender_id: currentUser.id,
            community_id: activeCommunityId,
            content: text
        }]);

        if (error) {
            console.error("Send failed:", error);
            alert("Failed to send message.");
        }
    };

    const handleCreateCommunity = async () => {
        if (!newCommunityName.trim()) return;

        const { data, error } = await supabase.from('communities').insert([{
            name: newCommunityName,
            created_by: currentUser.id
        }]).select().single();

        if (error) {
            alert("Failed to create community: " + error.message);
        } else {
            setCommunities(prev => [data, ...prev]);
            setIsCreatingCommunity(false);
            setNewCommunityName('');
            setActiveCommunityId(data.id); // Switch to new group
        }
    };

    // --- DM Logic ---
    const handleSendDM = async (e) => {
        e?.preventDefault();
        if ((!dmInput.trim() && !dmImage) || !activeChatPartner) return;

        const text = dmInput;
        setDmInput(''); // Optimistic update
        const imageFile = dmImage;
        setDmImage(null); // Clear image immediately

        let imageUrl = null;
        if (imageFile) {
            try {
                imageUrl = await uploadToSupabase(imageFile, 'chat_images');
            } catch (e) {
                alert("Failed to upload image.");
                return;
            }
        }

        const { error } = await supabase.from('messages').insert([{
            sender_id: currentUser.id,
            receiver_id: activeChatPartner.id,
            text: text,
            message_text: text, // LEGACY COMPATIBILITY for Not-Null Constraint
            image_url: imageUrl
        }]);

        if (error) {
            console.error("DM Error", error);
            alert("DM Failed: " + (error.message || JSON.stringify(error))); // DEBUG ALERT
        } else {
            // Notification Logic (Issue 6)
            await supabase.from('notifications').insert([{
                user_id: activeChatPartner.id,
                sender_id: currentUser.id,
                type: 'message',
                content: `Sent you a message: ${text ? text.substring(0, 30) : 'Photo'}${text && text.length > 30 ? '...' : ''}`,
                is_read: false
            }]);
        }
    };

    const handleDeleteDM = async (msgId) => {
        // Optimistic UI update could be done here, but Realtime subscription handles it
        const { error } = await supabase.from('messages').delete().eq('id', msgId);
        if (error) alert("Failed to delete message");
    };


    const displayedPartners = partners
        .filter(p => !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.role?.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(p => ({
            id: p.id,
            name: p.name || 'Student',
            role: p.role || 'Member',
            status: p.status || 'Active',
            desc: p.bio || p.desc || 'No bio',
            tags: p.tags || [],
            avatarUrl: p.avatar_url,
            isMe: false
        })).concat([{
            id: userProfile.id,
            name: userProfile.name,
            role: userProfile.role || userProfile.title,
            status: userProfile.status,
            desc: userProfile.bio || 'Me',
            tags: [],
            avatarUrl: userProfile.avatar_url || userProfile.avatarUrl,
            isMe: true
        }]).filter(p => !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase())); // Re-filter to include Me if searches match

    return (
        <div className={`min-h-screen bg-transparent flex text-white font-sans overflow-hidden ${settings.neonEffectEnabled ? 'neon-dashboard-active' : ''}`}>
            {/* Neon Visual Effect Styles */}
            {/* Neon Visual Effect Styles */}
            {settings.neonEffectEnabled && (
                <style>{`
                    .neon-dashboard-active .glass-card,
                    .neon-dashboard-active .bg-white\\/5,
                    .neon-dashboard-active .bg-black\\/20,
                    .neon-dashboard-active .bg-black\\/30,
                    .neon-dashboard-active .bg-black\\/40,
                    .neon-dashboard-active .bg-black\\/60,
                    .neon-dashboard-active .bg-black\\/80,
                    .neon-dashboard-active .bg-black\\/90,
                    .neon-dashboard-active .bg-\\[\\#0a0c16\\],
                    .neon-dashboard-active .bg-\\[\\#0f111a\\],
                    .neon-dashboard-active aside,
                    .neon-dashboard-active nav button.bg-deedox-accent-primary\\/10 {
                        box-shadow: 0 0 ${settings.neonSettings?.intensity === 'low' ? '5px' :
                        settings.neonSettings?.intensity === 'high' ? '20px' : '12px'
                    } rgba(112, 224, 0, ${settings.neonSettings?.intensity === 'low' ? '0.1' :
                        settings.neonSettings?.intensity === 'high' ? '0.5' : '0.3'
                    }), inset 0 0 ${settings.neonSettings?.softness === 'low' ? '0px' :
                        settings.neonSettings?.softness === 'high' ? '10px' : '5px'
                    } rgba(112, 224, 0, 0.1) !important;
                        border-color: rgba(112, 224, 0, 0.6) !important;
                        animation: neonPulse ${settings.neonSettings?.speed === 'slow' ? '4s' :
                        settings.neonSettings?.speed === 'fast' ? '1s' : '2s'
                    } infinite alternate ease-in-out;
                        background: rgba(5, 5, 5, 0.4) !important; /* Force translucency */
                        backdrop-filter: blur(10px);
                    }
                    
                    /* Specific overrides for containers */
                    .neon-dashboard-active .bg-\\[\\#0a0c16\\] { background: rgba(5, 5, 5, 0.4) !important; }
                    
                    .neon-dashboard-active {
                        background: radial-gradient(circle at 50% 50%, rgba(112, 224, 0, 0.05) 0%, #050505 80%) !important;
                    }
                    @keyframes neonPulse {
                        0% { box-shadow: 0 0 5px rgba(112, 224, 0, 0.2), inset 0 0 2px rgba(112, 224, 0, 0.05); border-color: rgba(112, 224, 0, 0.3); }
                        100% { box-shadow: 0 0 ${settings.neonSettings?.intensity === 'low' ? '10px' :
                        settings.neonSettings?.intensity === 'high' ? '30px' : '20px'
                    } rgba(112, 224, 0, 0.5), inset 0 0 ${settings.neonSettings?.softness === 'low' ? '2px' :
                        settings.neonSettings?.softness === 'high' ? '15px' : '8px'
                    } rgba(112, 224, 0, 0.2); border-color: #70E000; }
                    }
                `}</style>
            )}

            {/* Ensuring Global Background Visibility */
            /* The global component is behind this, so bg-transparent is crucial. */}

            {/* --- Mobile Navigation Overlay --- */}
            <AnimatePresence>
                {isMobileNavOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileNavOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
                        />

                        {/* Drawer - Apple Liquid Glass */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-black/30 backdrop-blur-2xl border-r border-white/10 z-[101] overflow-y-auto lg:hidden flex flex-col shadow-2xl"
                        >
                            {/* Mobile Logo */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <Link to="/">
                                    <img
                                        src={settings.logoUrl || logoDeedox}
                                        alt="DEEDOX"
                                        className="h-8 w-auto object-contain"
                                    />
                                </Link>
                                <button onClick={() => setIsMobileNavOpen(false)} className="text-white/50 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Mobile Nav Items */}
                            <div className="flex-grow py-4 px-4 space-y-2">
                                {navItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (item.id === 'settings') {
                                                setTempProfile(userProfile);
                                                setIsEditingProfile(true);
                                            } else {
                                                setActiveTab(item.id);
                                            }
                                            setIsMobileNavOpen(false); // Close drawer
                                        }}
                                        className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all duration-300
                                            ${activeTab === item.id
                                                ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(112,224,0,0.1)] font-semibold border border-white/10 backdrop-blur-md'
                                                : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <item.icon size={20} className={`${activeTab === item.id ? 'scale-105 text-[#70E000]' : ''} ${item.highlight && activeTab !== item.id ? 'text-[#a3e635]' : ''}`} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Mobile User & Logout */}
                            <div className="p-4 border-t border-white/5">
                                <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white/5" onClick={() => { setIsMobileNavOpen(false); setTempProfile(userProfile); setIsEditingProfile(true); }}>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a3e635] to-[#84cc16] p-[2px]">
                                        {userProfile?.avatar_url ? (
                                            <img src={userProfile.avatar_url} className="w-full h-full rounded-full object-cover border-2 border-black" />
                                        ) : (
                                            <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-bold text-[#a3e635]">
                                                {(userProfile?.name || 'U')[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-white truncate">{userProfile?.name}</p>
                                        {userProfile?.membership_type === 'pro' ? (
                                            <span className="text-[10px] text-[#a3e635] bg-[#a3e635]/10 px-1.5 py-0.5 rounded border border-[#a3e635]/20">Pro Member</span>
                                        ) : (
                                            <span className="text-[10px] text-[#2563eb] bg-[#2563eb]/10 px-1.5 py-0.5 rounded border border-[#2563eb]/20">Free Member</span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="flex items-center gap-3 text-[#9ca3af] hover:text-red-500 p-3 w-full rounded-xl hover:bg-red-500/10 transition-all">
                                    <LogOut size={20} />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- Sidebar (Premium Dark Gradient -> Apple Glass) --- */}
            <aside className="hidden lg:flex w-72 border-r border-white/5 flex-col fixed h-full bg-black/20 backdrop-blur-3xl z-50 transition-all font-sans">

                {/* LOGO SECTION */}
                <div className="p-6 border-b border-white/5 shadow-sm">
                    <Link to="/">
                        <img
                            src={settings.logoUrl || logoDeedox}
                            alt="DEEDOX"
                            className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
                        />
                    </Link>
                </div>

                {/* USER PROFILE CARD */}
                <div className="px-4 pt-6 pb-2">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg flex items-center gap-4 group cursor-pointer hover:border-[#a3e635]/30 transition-all hover:bg-white/10"
                        onClick={() => { setTempProfile(userProfile); setIsEditingProfile(true); }}>
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-[#a3e635] to-[#84cc16]">
                                {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} className="w-full h-full rounded-full object-cover border-2 border-[#18181b]" />
                                ) : (
                                    <div className="w-full h-full bg-[#18181b] rounded-full flex items-center justify-center font-bold text-[#a3e635]">
                                        {(userProfile?.name || 'U')[0]}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#a3e635] rounded-full border-2 border-[#18181b]" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate group-hover:text-[#a3e635] transition-colors">
                                {userProfile?.name || 'User'}
                            </p>
                            <p className="text-[11px] text-[#9ca3af] truncate mb-1">
                                {userProfile?.email || 'user@example.com'}
                            </p>
                            {userProfile?.membership_type === 'pro' ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20">
                                    Pro Member
                                </span>
                            ) : (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20">
                                    Free Member
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* NAVIGATION */}
                {/* Navigation (Desktop) */}
                <nav className="flex-grow px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'settings') {
                                    setTempProfile(userProfile);
                                    setIsEditingProfile(true);
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-all duration-300 group
                                ${activeTab === item.id
                                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(112,224,0,0.15)] font-semibold border border-white/10 backdrop-blur-md'
                                    : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-105 text-[#70E000]' : 'group-hover:scale-110'} ${item.highlight && activeTab !== item.id ? 'text-[#a3e635]' : ''}`} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-[#9ca3af] hover:text-red-500 p-3 w-full rounded-xl hover:bg-red-500/10 transition-all">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>


            {/* --- Main Content --- */}
            {/* --- Main Content (Pure Black with Dark Gradient) --- */}
            <main className="flex-grow ml-0 lg:ml-72 p-6 lg:p-10 relative bg-[#000000] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#000000] to-[#000000] min-h-screen text-white">

                {/* - Header & Profile - Apple Style Glass Sticky Bar (Ultra Transparent) */}
                <header className="sticky top-0 z-40 bg-white/[0.02] backdrop-blur-3xl border-b border-white/5 flex justify-between items-center mb-10 relative px-6 py-4 -mx-6 lg:-mx-10 lg:px-10 lg:-mt-10 lg:pt-10 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileNavOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-[#70E000]/50"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Title Container - Hidden on Mobile to make room for Logo */}
                        <div className="hidden md:block">
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 leading-tight">
                                {activeTab === 'dashboard' && 'Dashboard'}
                                {activeTab === 'community' && 'Exclusive Community'}
                                {activeTab === 'social' && 'Student Social Feed'}
                                {activeTab === 'news' && 'AI News Portal'}
                                {activeTab === 'partners' && 'Founder Directory'}
                                {activeTab === 'connections' && 'My Connections'}
                                {activeTab === 'ai_suite' && 'Intelligent Tools'}
                                {activeTab === 'programs' && 'Explore AI Programs'}
                                {activeTab === 'settings' && 'Account Settings'}
                            </h1>
                            <p className="text-white/40 text-sm">
                                {activeTab === 'dashboard' ? 'Welcome to Aaghaz AI - Start your learning journey for free!'
                                    : activeTab === 'connections' ? 'Build your professional network with fellow innovators.'
                                        : activeTab === 'news' ? 'Latest updates from the AI world.'
                                            : activeTab === 'programs' ? 'Master future skills with our comprehensive curriculums.'
                                                : activeTab === 'partners' ? 'Find your perfect co-founder.'
                                                    : (activeTab === 'ai_suite' ? 'Powered by advanced LLMs for your startup journey.' : 'Connect with the top 1% of AI builders.')}
                            </p>
                        </div>
                    </div>

                    {/* [NEW] Mobile Centered Logo */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:hidden z-10 pointer-events-none">
                        <Link to="/" className="pointer-events-auto block">
                            <img
                                src={settings.logoUrl || '/logo.png'}
                                alt="DEEDOX"
                                className="h-8 w-auto object-contain drop-shadow-md"
                            />
                        </Link>
                    </div>

                    <div className="hidden sm:block">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setTempProfile(userProfile); setIsEditingProfile(true); }}>
                            <p className="text-white text-sm font-bold leading-none">{userProfile.name}</p>
                            <Edit size={12} className="text-white/20 group-hover:text-white/80" />
                        </div>
                        <p className="text-[10px] text-deedox-accent-primary uppercase font-bold tracking-wider mt-0.5">{userProfile.status}</p>
                        <p className="text-[10px] text-white/30 font-mono mt-0.5">ID: {userProfile.student_id || 'PENDING'}</p>
                    </div>
                </header>

                {/* --- DASHBOARD TAB (NEW) --- */}
                {
                    activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-fade-in pb-20 overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
                            {/* HERO SECTION */}
                            <DashboardHero />

                            {/* GRID CARDS (Reference: AI Chat, Resources, Events) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Card 1: AI Chat */}
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-deedox-accent-primary/30 cursor-pointer" onClick={() => setActiveTab('ai_suite')}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-deedox-accent-primary/20 transition-colors">
                                        <MessageSquare size={24} className="text-deedox-accent-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">AI Chat Assistant</h3>
                                    <p className="text-white/50 text-sm mb-6">Chat with GPT-5 powered AI assistant</p>
                                    <span className="text-deedox-accent-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Explore <ChevronRight size={14} />
                                    </span>
                                </div>

                                {/* Card 2: Resources */}
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 cursor-pointer" onClick={() => setActiveTab('news')}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                        <Briefcase size={24} className="text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Free Resources</h3>
                                    <p className="text-white/50 text-sm mb-6">Watch free learning materials</p>
                                    <span className="text-blue-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Explore <ChevronRight size={14} />
                                    </span>
                                </div>

                                {/* Card 3: Events */}
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                                        <Users size={24} className="text-purple-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Free Events</h3>
                                    <p className="text-white/50 text-sm mb-6">Join webinars and workshops</p>
                                    <span className="text-purple-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Explore <ChevronRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- SOCIAL FEED TAB --- */}
                {
                    activeTab === 'social' && (
                        <div className="space-y-8 animate-fade-in">
                            <SocialFeed currentUser={currentUser} userProfile={userProfile} setActiveTab={setActiveTab} setSearchTerm={setSearchTerm} />
                        </div>
                    )
                }

                {/* --- CO-FOUNDER TAB --- */}
                {
                    activeTab === 'partners' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Find a Co-Founder</h3>
                                <p className="text-white/40">Browse profiles and find the perfect match for your startup.</p>
                                <Button variant="primary" className="mt-6 bg-deedox-accent-primary text-black hover:bg-white">Browse Candidates</Button>
                            </div>
                        </div>
                    )
                }

                {/* --- AI NEWS TAB --- */}
                {
                    activeTab === 'news' && (
                        <div className="h-full overflow-y-auto pb-20 custom-scrollbar rounded-3xl border border-white/5 overflow-hidden">
                            <News />
                        </div>
                    )
                }

                {/* --- EXPLORE AI PROGRAMS TAB --- */}
                {
                    activeTab === 'programs' && (
                        <div className="space-y-6 animate-fade-in pb-20">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(programs?.items || []).map((program) => (
                                    <div key={program.id} className="glass-card p-6 rounded-3xl border border-white/5 bg-black/40 hover:border-deedox-accent-primary/30 transition-all group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        <div className="h-40 rounded-xl bg-white/5 mb-4 overflow-hidden relative">
                                            {program.image ? (
                                                <img src={program.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={program.title} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white/20 font-bold tracking-widest">COURSE</div>
                                            )}
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10">
                                                {program.level || 'Beginner'}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-deedox-accent-primary transition-colors">{program.title}</h3>
                                        <p className="text-white/50 text-sm mb-4 line-clamp-2">{program.description}</p>
                                        <Button variant="outline" className="w-full hover:bg-deedox-accent-primary hover:text-black border-white/10">
                                            View Details
                                        </Button>
                                    </div>
                                ))}
                                {(programs?.items || []).length === 0 && (
                                    <div className="col-span-full py-20 text-center text-white/30 border border-white/5 border-dashed rounded-3xl">
                                        No programs available yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* --- MY CONNECTIONS TAB --- */}
                {
                    activeTab === 'connections' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                                    <Heart size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">My Connections</h3>
                                <p className="text-white/40">Connect with other students and founders here.</p>
                                <p className="text-xs text-white/20 mt-4 uppercase tracking-widest font-bold">Coming Soon</p>
                            </div>
                        </div>
                    )
                }

                {/* --- AI SUITE TAB --- */}
                {
                    activeTab === 'ai_suite' && (
                        <div className="md:h-[calc(100vh-140px)] h-auto flex gap-6 font-sans relative">

                            {/* AI Sidebar (Responsive Glass Drawer) */}
                            <div className={"flex-shrink-0 space-y-6 overflow-y-auto custom-scrollbar pr-2 transition-all duration-300 z-[30] " +
                                (showMobileSidebar
                                    ? "fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl p-6 w-full"
                                    : "hidden md:flex md:flex-col md:w-80")
                            }>
                                {/* Mobile Header for Sidebar */}
                                <div className="md:hidden flex justify-between items-center mb-6">
                                    <h3 className="text-white font-bold text-2xl tracking-tight">AI Tools</h3>
                                    <button onClick={() => setShowMobileSidebar(false)} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={20} /></button>
                                </div>

                                {/* Modes Selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest px-1">Select Assistant</label>
                                    {Object.entries(aiModes).map(([nodes, mode]) => (
                                        <button
                                            key={nodes}
                                            onClick={() => { setAiMode(nodes); setMessages([]); setShowMobileSidebar(false); }}
                                            className={cn(
                                                "w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 relative overflow-hidden group",
                                                aiMode === nodes
                                                    ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                                    : "bg-transparent border-transparent hover:bg-white/5"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-xl transition-all duration-300",
                                                aiMode === nodes ? "scale-110 " + mode.Bg : "bg-white/5"
                                            )}>
                                                <mode.icon size={20} className={cn("transition-colors", aiMode === nodes ? mode.color : "text-white/50")} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn("font-bold text-sm tracking-wide transition-colors", aiMode === nodes ? "text-white" : "text-white/60")}>{mode.name}</span>
                                                <span className="text-[10px] text-white/30 truncate max-w-[140px] opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-[4.5rem] md:static md:opacity-100 md:bottom-auto md:left-auto">
                                                    {nodes === 'deedox_ai' ? 'Smart Assistant' : nodes === 'deedox_help' ? 'Support Bot' : 'Startup Coach'}
                                                </span>
                                            </div>
                                            {aiMode === nodes && <div className={cn("absolute right-4 w-2 h-2 rounded-full shadow-[0_0_10px]", mode.color.replace('text-', 'bg-').replace('-400', '-500'))} />}
                                        </button>
                                    ))}
                                </div>

                                {/* Multi-Model Selection (Glass Panel) */}
                                <div className="mt-auto bg-black/20 p-5 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <label className="text-[10px] uppercase font-bold text-white/40 mb-4 block tracking-widest flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Zap size={12} className="text-deedox-accent-primary" /> Active Models</span>
                                        <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-[9px]">{(Array.isArray(selectedModel) ? selectedModel : [selectedModel]).length} Selected</span>
                                    </label>

                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                        {aiModels?.items?.filter(m => m.enabled && m.show_on_student_dashboard).map(m => {
                                            const isSelected = Array.isArray(selectedModel) ? selectedModel.includes(m.id) : selectedModel === m.id;
                                            return (
                                                <div
                                                    key={m.id}
                                                    onClick={() => {
                                                        const current = Array.isArray(selectedModel) ? selectedModel : [selectedModel];
                                                        const newSelection = current.includes(m.id)
                                                            ? current.filter(id => id !== m.id)
                                                            : [...current, m.id];
                                                        if (newSelection.length > 0) setSelectedModel(newSelection);
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border group/item relative overflow-hidden",
                                                        isSelected
                                                            ? "bg-deedox-accent-primary/10 border-deedox-accent-primary/30 shadow-[0_0_15px_rgba(112,224,0,0.1)]"
                                                            : "bg-black/20 border-transparent hover:bg-black/40"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-300",
                                                        isSelected ? "bg-deedox-accent-primary border-deedox-accent-primary scale-110" : "border-white/20 bg-black/40"
                                                    )}>
                                                        {isSelected && <Check size={12} className="text-black stroke-[4]" />}
                                                    </div>
                                                    <span className={cn("text-xs font-bold transition-colors", isSelected ? 'text-white' : 'text-white/50 group-hover/item:text-white/80')}>
                                                        {m.display_name || m.model_name}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Chat Board (Liquid Glass Container) */}
                            <div className={cn(
                                "flex-grow flex flex-col relative transition-all duration-500",
                                // Desktop Styles
                                "md:rounded-[2.5rem] md:border md:border-white/10 md:bg-[#050505]/80 md:backdrop-blur-3xl md:shadow-[0_25px_60px_rgba(0,0,0,0.6)] md:h-full md:overflow-hidden",
                                // Mobile Styles (Use 100dvh for safe mobile height)
                                // [FIX] Lowered z-index to 40 so Main Drawer (z-101) can overlay it.
                                "fixed inset-0 z-[40] bg-[#050505] h-[100dvh] md:relative md:inset-auto md:z-auto md:h-auto"
                            )}>

                                {/* Mobile Close Button */}
                                <button
                                    onClick={() => setActiveTab('community')}
                                    className="md:hidden absolute top-4 right-4 z-[210] p-3 bg-white/10 rounded-full text-white/50 hover:bg-white/20 hover:text-white transition-all backdrop-blur-md"
                                >
                                    <X size={20} />
                                </button>

                                {/* Dynamic Background Glow */}
                                {aiChatSettings?.backgroundVisible && (
                                    <div className={cn(
                                        "absolute inset-0 pointer-events-none transition-opacity duration-700",
                                        aiChatSettings.glowIntensity === 'high' ? 'opacity-40' : aiChatSettings.glowIntensity === 'low' ? 'opacity-10' : 'opacity-20'
                                    )}>
                                        <div className="absolute top-[20%] right-[20%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-screen" />
                                        <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-[#a3e635]/5 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen" />
                                    </div>
                                )}

                                {/* Glass Header */}
                                <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4 bg-white/[0.02] backdrop-blur-md sticky top-0 z-10">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsMobileNavOpen(true)}
                                            className="md:hidden p-2 bg-white/5 rounded-xl text-white border border-white/10 hover:bg-white/10"
                                        >
                                            <Menu size={20} />
                                        </button>
                                        <button
                                            onClick={() => setShowMobileSidebar(true)}
                                            className="md:hidden p-2 bg-white/5 rounded-xl text-white border border-white/10 hover:bg-white/10"
                                        >
                                            <Settings size={20} />
                                        </button>

                                        <div className={cn("p-2.5 rounded-2xl border border-white/10 shadow-lg backdrop-blur-sm", aiModes[aiMode].Bg)}>
                                            {React.createElement(aiModes[aiMode].icon, { className: aiModes[aiMode].color, size: 24 })}
                                        </div>

                                        <div>
                                            <h3 className="text-white font-bold text-lg tracking-tight flex items-center gap-3">
                                                {aiChatSettings?.assistantName || aiModes[aiMode].name}
                                                <span className="text-[10px] bg-[#a3e635]/10 text-[#a3e635] px-2 py-0.5 rounded-full font-mono border border-[#a3e635]/20 shadow-[0_0_10px_rgba(163,230,53,0.1)]">PRO</span>
                                            </h3>
                                            <p className="text-[11px] text-white/40 font-medium flex items-center gap-1.5 mt-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                {(Array.isArray(selectedModel) ? selectedModel : [selectedModel]).length} Models Active
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* [FIX] Mobile Multi-AI Selection (Horizontal Scroll) - visible only on mobile */}
                                <div className="md:hidden px-4 py-2 border-b border-white/5 bg-black/40 backdrop-blur-md overflow-x-auto custom-scrollbar flex gap-2 shrink-0">
                                    {aiModels?.items?.filter(m => m.enabled && m.show_on_student_dashboard).map(m => {
                                        const isSelected = Array.isArray(selectedModel) ? selectedModel.includes(m.id) : selectedModel === m.id;
                                        return (
                                            <div
                                                key={m.id}
                                                onClick={() => {
                                                    const current = Array.isArray(selectedModel) ? selectedModel : [selectedModel];
                                                    const newSelection = current.includes(m.id) ? current.filter(id => id !== m.id) : [...current, m.id];
                                                    if (newSelection.length > 0) setSelectedModel(newSelection);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-2 p-2 rounded-lg border transition-all whitespace-nowrap",
                                                    isSelected ? "bg-deedox-accent-primary/20 border-deedox-accent-primary/50" : "bg-white/5 border-white/10"
                                                )}
                                            >
                                                <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center", isSelected ? "bg-deedox-accent-primary border-deedox-accent-primary" : "border-white/30")} />
                                                <span className={cn("text-[10px] font-bold", isSelected ? "text-white" : "text-white/50")}>{m.display_name || m.model_name}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Chat Messages Area */}
                                <div className="flex-grow px-4 md:px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar scroll-smooth relative z-0 pb-32">
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center opacity-60 animate-fade-in">
                                            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-white/5 to-transparent border border-white/10 flex items-center justify-center mb-8 shadow-2xl backdrop-blur-xl group">
                                                <Bot size={40} className="text-white/80 group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">How can I help you?</h3>
                                            <p className="text-white/40 max-w-sm text-center font-light leading-relaxed">
                                                Select models from the sidebar and ask me anything.
                                            </p>
                                        </div>
                                    )}

                                    <AnimatePresence mode="popLayout">
                                        {messages.map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                className={cn(
                                                    "w-full flex",
                                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                {msg.role === 'user' ? (
                                                    <div className="flex justify-end items-center gap-4 w-full">
                                                        <div className="bg-[#a3e635]/90 backdrop-blur-xl text-black px-6 py-4 rounded-[2rem] rounded-tr-sm font-medium text-base shadow-[0_8px_32px_rgba(163,230,53,0.3)] max-w-[80%] leading-relaxed border border-[#a3e635]/50 relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />
                                                            <span className="relative z-10">{msg.content}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-start gap-2 w-full">
                                                        {/* Thought Time (Above AI Message if available) */}
                                                        {msg.thoughtTime && (
                                                            <span className="text-[10px] text-white/30 font-mono pl-4 mb-[-4px]">
                                                                Thought for <span className="text-[#a3e635]">{msg.thoughtTime}s</span>
                                                            </span>
                                                        )}

                                                        <div className={cn(
                                                            "glass-card px-8 py-6 rounded-[2rem] rounded-tl-sm text-sm leading-relaxed border shadow-xl backdrop-blur-2xl transition-all max-w-[90%] lg:max-w-[80%] bg-black/20",
                                                            msg.isError ? 'border-red-500/30 bg-red-500/5 text-white' : 'border-white/10 text-white/90'
                                                        )}
                                                            style={{
                                                                backgroundColor: msg.isError ? '' : (aiChatSettings?.bubbleColorAI ? (aiChatSettings.bubbleColorAI + '10') : 'rgba(255,255,255,0.03)'),
                                                                color: '#ffffff'
                                                            }}
                                                        >
                                                            <div className="prose prose-invert prose-lg max-w-none">
                                                                {msg.content}
                                                            </div>
                                                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold text-white/30 uppercase tracking-wider">
                                                                <Cpu size={12} /> {msg.modelName || 'AI Model'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Thinking State - Left Aligned (Like AI is typing) */}
                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start items-center gap-4 mb-6"
                                        >
                                            <div className="px-6 py-3 rounded-full flex items-center gap-3 border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-xl">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <span className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <span className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-bounce" />
                                                </div>
                                                <span className="text-white/60 text-xs font-medium font-mono tracking-widest uppercase">
                                                    Thinking <span className="text-[#a3e635]">{thinkingSeconds}s</span>
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Area (Floating Glass Bar) */}
                                <div className="fixed bottom-0 md:absolute left-0 right-0 w-full p-4 md:p-6 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                        className="relative max-w-3xl mx-auto w-full group"
                                    >
                                        <div className="glass p-1.5 rounded-[2rem] flex items-end gap-2 bg-black/50 backdrop-blur-[40px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all focus-within:border-white/20 focus-within:shadow-[0_20px_60px_rgba(0,0,0,0.8)] focus-within:bg-black/60">
                                            {/* Globe / Model Icon */}
                                            <div className="p-4 pl-5 text-white/30 hover:text-white transition-colors cursor-pointer hidden md:block">
                                                <Globe size={22} />
                                            </div>

                                            <textarea
                                                className="w-full bg-transparent border-none outline-none text-white px-4 py-4 min-h-[56px] max-h-[150px] resize-none text-base font-light placeholder:text-white/30 custom-scrollbar"
                                                placeholder={activeTab === 'ai_suite' ? "Ask anything..." : "Message AI..."}
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                            />

                                            <button
                                                type="submit"
                                                disabled={isLoading || !input.trim() || !selectedModel}
                                                className={cn(
                                                    "p-3.5 rounded-full flex items-center justify-center transition-all duration-300 transform mb-1 mr-1",
                                                    input.trim() && !isLoading
                                                        ? "bg-[#a3e635] text-black hover:scale-110 hover:shadow-[0_0_20px_#a3e635] hover:rotate-12"
                                                        : "bg-white/10 text-white/20 cursor-not-allowed"
                                                )}
                                            >
                                                <Send size={20} className={input.trim() ? "fill-black" : ""} />
                                            </button>
                                        </div>
                                        <div className="absolute -bottom-5 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <p className="text-[9px] text-white/20 font-medium tracking-wide">Deedox AI can make mistakes. Check important info.</p>
                                        </div>
                                    </form>
                                </div>
                            </div >
                        </div >
                    )
                }

                {/* --- COMMUNITY TAB --- */}
                {
                    activeTab === 'community' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[85vh]">
                            {/* Chat Area - Liquid Liquid Glass */}
                            <div className="lg:col-span-2 rounded-[2.5rem] border border-white/10 flex flex-col relative overflow-hidden bg-black/40 backdrop-blur-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] h-[600px] lg:h-full group/chat">
                                <div className="absolute inset-0 bg-white/2 pointer-events-none" />

                                <div ref={communityChatContainerRef} className="flex-grow p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar flex flex-col min-h-0 relative z-10">
                                    {/* Spacer to push messages down if few */}
                                    <div className="flex-grow" />
                                    <div className="text-center py-10 opacity-50">
                                        <div className="w-20 h-20 bg-gradient-to-tr from-white/10 to-transparent rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl border border-white/5 backdrop-blur-md">👋</div>
                                        <p className="text-white/60 font-light tracking-wide">Welcome to the inner circle.</p>
                                    </div>

                                    {communityMessages.map((msg, index) => (
                                        <div key={msg.id || index} className={"group flex gap-4 items-end " + (msg.isMe ? 'flex-row-reverse' : '')}>
                                            <div className={"w-8 h-8 rounded-xl border flex-shrink-0 flex items-center justify-center font-bold text-[10px] shadow-lg overflow-hidden transition-transform group-hover:scale-110 " + (msg.isMe ? 'bg-[#a3e635] text-black border-[#a3e635]' : 'bg-black/40 text-white border-white/10')}>
                                                {(msg.avatarUrl || msg.photoURL) ? (
                                                    <img src={msg.avatarUrl || msg.photoURL} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    (msg.user || '?')[0]
                                                )}
                                            </div>
                                            <div className={"p-4 px-6 rounded-[2rem] max-w-[85%] shadow-lg border text-sm leading-relaxed relative backdrop-blur-md transition-all " + (msg.isMe ? 'bg-[#a3e635] border-[#a3e635] text-black rounded-br-none shadow-[0_5px_20px_-5px_rgba(163,230,53,0.3)]' : 'bg-white/5 border-white/10 rounded-bl-none text-white/90 hover:bg-white/10')}>
                                                {/* Gloss Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none rounded-inherit" />
                                                <p className="relative z-10 font-medium">{msg.text}</p>
                                                <span className={"text-[9px] block mt-1 font-mono text-right relative z-10 opacity-60 " + (msg.isMe ? 'text-black' : 'text-white')}>{msg.role}</span>
                                            </div>
                                            {msg.isMe && (
                                                <button
                                                    onClick={() => handleDeleteCommunityMessage(msg.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 p-2"
                                                    title="Delete Message"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Floating Input Bar */}
                                <div className="p-6 relative z-20">
                                    <form onSubmit={handleCommunitySend} className="glass p-2 pl-6 rounded-full flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all focus-within:border-white/30 focus-within:bg-black/80 focus-within:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                                        <button type="button" className="text-white/30 hover:text-white transition-colors"><Zap size={18} /></button>
                                        <input
                                            type="text"
                                            placeholder="Share with the community..."
                                            value={communityInput}
                                            onChange={e => setCommunityInput(e.target.value)}
                                            className="flex-grow bg-transparent border-none outline-none text-white placeholder:text-white/30 py-2"
                                        />
                                        <Button variant="primary" className="rounded-full w-10 h-10 !p-0 flex items-center justify-center bg-[#a3e635] text-black hover:scale-110 hover:shadow-[0_0_15px_#a3e635] border-none transition-all">
                                            <Send size={16} className="ml-0.5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>

                            {/* Sidebar Info & Online Members (Merged) */}
                            <div className="flex flex-col gap-6 order-last lg:order-none">
                                {/* Trending Items */}
                                <div className="bg-gradient-to-br from-white/5 to-white/0 p-6 rounded-[2.5rem] border border-white/5 shadow-xl backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
                                    <div className="flex justify-between items-center mb-4 relative z-10">
                                        <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider"><Compass size={16} className="text-[#a3e635]" /> Trending</h3>
                                        <Button variant="outline" className="text-[10px] py-1 px-3 h-8 rounded-full border-white/10 hover:border-[#a3e635] hover:text-[#a3e635] transition-all" onClick={() => setIsCreatingCommunity(true)}><Plus size={12} /> Create</Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pb-2">
                                        {communities.map(comm => (
                                            <span
                                                key={comm.id}
                                                onClick={() => setActiveCommunityId(comm.id)}
                                                className={"px-4 py-1.5 rounded-full text-xs cursor-pointer transition-all border " + (activeCommunityId === comm.id ? 'bg-[#a3e635] text-black font-bold border-[#a3e635] shadow-[0_0_10px_#a3e635]' : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:border-white/20')}
                                            >
                                                #{comm.name.replace(/\s+/g, '_')}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Create Community Modal (Inline) */}
                                {isCreatingCommunity && (
                                    <div className="p-4 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 animate-fade-in shadow-xl mb-4">
                                        <h4 className="text-white text-xs font-bold mb-2 uppercase tracking-wide">New Community</h4>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Name (e.g. DeFi)"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#a3e635]/50 transition-colors"
                                                value={newCommunityName}
                                                onChange={e => setNewCommunityName(e.target.value)}
                                            />
                                            <button onClick={handleCreateCommunity} className="bg-[#a3e635] text-black px-3 rounded-lg font-bold text-xs hover:scale-105 transition-transform"><CheckCircle size={16} /></button>
                                            <button onClick={() => setIsCreatingCommunity(false)} className="text-white/40 hover:text-white px-2"><X size={16} /></button>
                                        </div>
                                    </div>
                                )}

                                {/* Online Members */}
                                <div className="bg-black/20 backdrop-blur-[40px] p-6 lg:p-8 rounded-[2.5rem] border border-white/10 flex-grow flex flex-col shadow-2xl min-h-[300px] lg:min-h-0 relative overflow-hidden group">
                                    {/* Glass Reflection */}
                                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />

                                    <h3 className="font-bold text-white mb-6 flex items-center gap-2 relative z-10 text-sm uppercase tracking-wider">
                                        <div className="w-2 h-2 rounded-full bg-[#a3e635] shadow-[0_0_10px_#a3e635] animate-pulse" />
                                        Online ({onlineUsers.length})
                                    </h3>
                                    <div ref={membersListRef} className={"space-y-3 overflow-y-auto custom-scrollbar flex-grow transition-all duration-500 relative z-10 pr-2 " + (showAllMembers ? "max-h-80" : "max-h-auto")}>
                                        {onlineUsers.length === 0 ? (
                                            <p className="text-white/30 text-xs italic">Waiting for members...</p>
                                        ) : (
                                            (showAllMembers ? onlineUsers : onlineUsers.slice(0, 3)).map((u, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-[#a3e635]/10 hover:border-[#a3e635]/30 transition-all cursor-pointer backdrop-blur-sm group/user">
                                                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shadow-inner group-hover/user:scale-105 transition-transform">
                                                        {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-white/50">{u.name?.[0]}</span>}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-white/90 font-bold leading-tight group-hover/user:text-white transition-colors">{u.name}</p>
                                                        <p className="text-[10px] text-white/40 group-hover/user:text-[#a3e635] transition-colors">{u.role}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {onlineUsers.length > 3 && (
                                            <button
                                                onClick={() => {
                                                    const newShowAll = !showAllMembers;
                                                    setShowAllMembers(newShowAll);
                                                    if (!newShowAll && membersListRef.current) {
                                                        membersListRef.current.scrollTop = 0;
                                                    }
                                                }}
                                                className="w-full py-3 text-xs text-[#a3e635] hover:bg-[#a3e635]/10 rounded-xl transition-all font-bold border border-transparent hover:border-[#a3e635]/20 mt-2 uppercase tracking-wide"
                                            >
                                                {showAllMembers ? 'Show Less' : `Show ${onlineUsers.length - 3} More`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- PARTNERS TAB --- */}
                {
                    activeTab === 'partners' && (
                        <div>
                            {/* Search Bar */}
                            <div className="mb-8 relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search founders by name or role..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-deedox-accent-primary/50 transition-all font-medium placeholder:text-white/20"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedPartners.map((partner, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={partner.id}
                                        className={"group relative overflow-hidden rounded-[2rem] border transition-all duration-300 backdrop-blur-xl hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(163,230,53,0.15)] " + (partner.isMe ? 'bg-[#a3e635]/10 border-[#a3e635]/30 shadow-[0_0_20px_rgba(163,230,53,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20')}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                        <div className="p-6 relative z-10 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={"w-16 h-16 rounded-2xl overflow-hidden border relative shadow-lg group-hover:scale-105 transition-transform " + (partner.isMe ? 'border-[#a3e635]' : 'border-white/10')}>
                                                    {partner.avatarUrl ? (
                                                        <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-black/40 flex items-center justify-center text-2xl font-bold text-white/30">
                                                            {partner.name ? partner.name[0] : '?'}
                                                        </div>
                                                    )}
                                                    {partner.isMe && (
                                                        <div className="absolute -top-2 -right-2 bg-deedox-accent-primary text-black text-[9px] font-bold px-2 py-0.5 rounded-full">YOU</div>
                                                    )}
                                                    {/* Unread Badge */}
                                                    {!partner.isMe && unreadCounts[partner.id] > 0 && (
                                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-bounce">
                                                            {unreadCounts[partner.id]}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="bg-deedox-accent-primary/10 text-deedox-accent-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{partner.status}</span>
                                            </div>

                                            <h4 className="text-lg font-bold text-white mb-1 group-hover:text-deedox-accent-primary transition-colors">{partner.name}</h4>
                                            <p className="text-white/40 text-xs mb-4">{partner.role}</p>

                                            <p className="text-white/70 text-sm mb-6 leading-relaxed line-clamp-2 flex-grow">{partner.desc}</p>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {partner.tags && partner.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] bg-white/5 text-white/60 px-2 py-1 rounded border border-white/5">{tag}</span>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-xs py-2 border-white/10 hover:border-white text-white/60"
                                                    onClick={() => handleMessagePartner(partner)}
                                                    disabled={partner.isMe}
                                                >
                                                    Message
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className={"w-full text-xs py-2 border-white/10 transition-colors " + (following.includes(partner.id) ? 'bg-white text-black hover:bg-white/90' : 'hover:border-deedox-accent-primary hover:text-deedox-accent-primary')}
                                                    disabled={partner.isMe}
                                                    onClick={() => handleFollow(partner.id)}
                                                >
                                                    {following.includes(partner.id) ? 'Following' : 'Follow'}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )
                }
                {/* --- CONNECTIONS TAB --- */}
                {
                    activeTab === 'news' && (
                        <div className="space-y-6">
                            <div className="mb-4">
                                <h2 className="text-2xl font-bold text-white mb-2">AI News Portal</h2>
                                <p className="text-white/40 text-sm">Latest updates from the world of AI.</p>
                            </div>
                            <News />
                        </div>
                    )
                }

                {
                    activeTab === 'connections' && (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-white mb-2">My Network ({following.length})</h2>
                                <p className="text-white/40 text-sm">Founders you are following.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedPartners.filter(p => !p.isMe && following.includes(p.id)).length === 0 ? (
                                    <div className="col-span-full py-20 text-center">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📭</div>
                                        <h3 className="text-white font-bold mb-2">No connections yet</h3>
                                        <p className="text-white/40 text-sm mb-6">Go to "Find Co-founder" to connect with people.</p>
                                        <button onClick={() => setActiveTab('partners')} className="bg-deedox-accent-primary text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform">Find Founders</button>
                                    </div>
                                ) : (
                                    displayedPartners.filter(p => !p.isMe && following.includes(p.id)).map((partner, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={partner.id}
                                            className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5 hover:border-deedox-accent-primary/20 flex flex-col"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black relative">
                                                    {partner.avatarUrl ? <img src={partner.avatarUrl} className="w-full h-full object-cover" /> : null}
                                                    {/* Unread Badge */}
                                                    {unreadCounts[partner.id] > 0 && (
                                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-bounce">
                                                            {unreadCounts[partner.id]}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Connected</span>
                                            </div>

                                            <h4 className="text-lg font-bold text-white mb-1">{partner.name}</h4>
                                            <p className="text-white/40 text-xs mb-4">{partner.role}</p>

                                            <div className="mt-auto grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-xs py-2 border-white/10 hover:border-white text-white/60"
                                                    onClick={() => handleMessagePartner(partner)}
                                                >
                                                    Message
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-xs py-2 border-white/10 hover:border-red-500/50 hover:text-red-400 text-white/40"
                                                    onClick={() => handleFollow(partner.id)}
                                                >
                                                    Unfollow
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )))}
                            </div>
                        </div>
                    )
                }
            </main >

            {/* --- EDIT PROFILE MODAL --- */}
            < AnimatePresence >
                {isEditingProfile && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditingProfile(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0f111a] p-8 rounded-3xl w-full max-w-md relative z-10 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
                            <div className="space-y-4">
                                {/* Profile Picture Upload */}
                                <div className="flex flex-col items-center gap-3 mb-4">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-deedox-accent-primary to-emerald-600 p-[2px]">
                                        {tempProfile.avatarUrl ? (
                                            <img src={tempProfile.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl font-bold text-deedox-accent-primary">{(tempProfile.name || '?')[0]}</div>
                                        )}
                                    </div>
                                    <input type="file" ref={avatarFileRef} accept="image/*" className="hidden" onChange={e => handleAvatarUpload(e.target.files[0])} />
                                    <Button variant="outline" className="text-xs py-2 px-4" onClick={() => avatarFileRef.current?.click()}><Upload size={14} className="mr-2" /> Upload Photo</Button>
                                </div>

                                <div>
                                    <label className="text-xs uppercase text-white/40 font-bold mb-1 block">Display Name</label>
                                    <input type="text" value={tempProfile.name || ''} onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-deedox-accent-primary" />
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-white/40 font-bold mb-1 block">Title / Role</label>
                                    <input type="text" value={tempProfile.title || ''} onChange={e => setTempProfile({ ...tempProfile, title: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-deedox-accent-primary" />
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-white/40 font-bold mb-1 block">Bio</label>
                                    <textarea value={tempProfile.bio || ''} onChange={e => setTempProfile({ ...tempProfile, bio: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-deedox-accent-primary h-24 resize-none" />
                                </div>

                                {/* Self Listing Toggle */}
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setTempProfile({ ...tempProfile, isListed: !tempProfile.isListed })}>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">List me as Co-founder</h4>
                                        <p className="text-[10px] text-white/50">Your profile will be visible in the 'Find Co-Founder' tab.</p>
                                    </div>
                                    <div className={"w-10 h-6 rounded-full p-1 transition-colors " + (tempProfile.isListed ? 'bg-deedox-accent-primary' : 'bg-white/20')}>
                                        <div className={"w-4 h-4 rounded-full bg-black shadow-sm transition-transform " + (tempProfile.isListed ? 'translate-x-4' : 'translate-x-0')} />
                                    </div>
                                </div>

                                <Button variant="primary" className="w-full justify-center py-3 mt-4" onClick={saveProfile}>Save Changes</Button>
                            </div>
                            <button className="absolute top-4 right-4 text-white/40 hover:text-white" onClick={() => setIsEditingProfile(false)}><X size={20} /></button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* --- MESSAGING MODAL --- */}
            < AnimatePresence >
                {activeChatPartner && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveChatPartner(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0f111a] rounded-3xl w-full max-w-lg h-[600px] flex flex-col relative z-10 border border-white/10 shadow-2xl">

                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                                        {activeChatPartner.avatarUrl ? (
                                            <img src={activeChatPartner.avatarUrl} alt={activeChatPartner.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/50">{(activeChatPartner.name || '?')[0]}</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{activeChatPartner.name}</h3>
                                        <p className="text-xs text-white/40">{activeChatPartner.role}</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveChatPartner(null)} className="text-white/40 hover:text-white"><X size={24} /></button>
                            </div>

                            {/* Messages */}
                            <div className="flex-grow p-6 overflow-y-auto space-y-4 custom-scrollbar bg-black/10">
                                {(!dmHistory[activeChatPartner.id] || dmHistory[activeChatPartner.id].length === 0) && (
                                    <div className="text-center py-10 opacity-30">
                                        <MessageCircle size={48} className="mx-auto mb-4" />
                                        <p>Start the conversation with {(activeChatPartner.name || 'User').split(' ')[0]}.</p>
                                    </div>
                                )}

                                {(dmHistory[activeChatPartner.id] || []).map(msg => (
                                    <div key={msg.id} className={"flex " + (msg.isMe ? 'justify-end' : 'justify-start')}>
                                        <div className={"relative group/msg p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed " + (msg.isMe ? 'bg-deedox-accent-primary text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none')}>
                                            {msg.image_url && (
                                                <div className="mb-2 rounded-lg overflow-hidden">
                                                    <img src={msg.image_url} alt="Shared" className="w-full max-w-[200px] object-cover" />
                                                </div>
                                            )}
                                            {msg.text && <p>{msg.text}</p>}

                                            {/* Delete Button */}
                                            {msg.isMe && (
                                                <button
                                                    onClick={() => handleDeleteDM(msg.id)}
                                                    className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover/msg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                                    title="Delete Message"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={dmEndRef} />
                            </div>

                            {/* Input */}
                            {/* Input */}
                            <form onSubmit={handleSendDM} className="p-4 border-t border-white/10 bg-black/20">
                                {dmImage && (
                                    <div className="flex items-center gap-2 mb-2 p-2 bg-white/5 rounded-lg">
                                        <span className="text-xs text-white/60">Image selected</span>
                                        <button type="button" onClick={() => setDmImage(null)} className="text-white hover:text-red-500"><X size={14} /></button>
                                    </div>
                                )}
                                <div className="flex gap-3 items-center">
                                    <label className="cursor-pointer text-white/40 hover:text-deedox-accent-primary transition-colors">
                                        <ImageIcon size={20} />
                                        <input type="file" className="hidden" accept="image/*" onChange={e => setDmImage(e.target.files[0])} />
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-deedox-accent-primary"
                                        value={dmInput}
                                        onChange={e => setDmInput(e.target.value)}
                                    />
                                    <Button variant="primary" className="rounded-xl w-12 flex items-center justify-center bg-deedox-accent-primary text-black hover:bg-white border-none">
                                        <Send size={18} />
                                    </Button>
                                </div>
                            </form>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence >

        </div >
    );
};

// --- Social Feed Component ---
const SocialFeed = ({ currentUser, userProfile, setActiveTab, setSearchTerm }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [uploading, setUploading] = useState(false);
    const [postImage, setPostImage] = useState('');
    const [feedSearchTerm, setFeedSearchTerm] = useState('');
    const [feedTab, setFeedTab] = useState('foryou'); // 'foryou' | 'following'
    const [myFollowing, setMyFollowing] = useState([]); // List of user IDs I follow
    const [showPostInput, setShowPostInput] = useState(false); // [NEW] Toggle Post Input

    useEffect(() => {
        // Fetch who I follow
        const fetchFollows = async () => {
            const { data } = await supabase.from('follows').select('following_id').eq('follower_id', currentUser.id);
            if (data) setMyFollowing(data.map(f => f.following_id));
        };
        fetchFollows();

        fetchPosts();

        const channel = supabase.channel('public_social')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => fetchPosts())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => fetchPosts())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [currentUser.id]);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*, user:users(name, avatar_url, role), post_likes(user_id), post_comments(id, content, created_at, user:users(name, avatar_url))')
            .order('created_at', { ascending: false });

        if (data) {
            setPosts(data.map(p => ({
                ...p,
                isLiked: p.post_likes && p.post_likes.some(l => l.user_id === currentUser.id),
                likeCount: p.post_likes ? p.post_likes.length : 0,
                comments: p.post_comments || []
            })));
        }
        setLoading(false);
    };

    // --- Helper: Upload to Supabase ---
    const uploadToSupabase = async (file, bucket) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) {
            console.error(`Upload to ${bucket} failed:`, error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return publicUrl;
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !postImage) return;
        setUploading(true);

        try {
            const newPost = {
                user_id: currentUser.id,
                content: newPostContent,
                image_url: postImage || null
            };

            const { error } = await supabase.from('posts').insert([newPost]);

            if (error) {
                console.error("Failed to post:", error);
                alert('Post failed: ' + error.message);
                return;
            }

            setNewPostContent('');
            setPostImage('');
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("Something went wrong.");
        } finally {
            setUploading(false);
        }
    };

    const handleLike = async (postId, isLiked) => {
        // 1. Optimistic Update (Immediate UI Change)
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isLiked: !isLiked,
                    likeCount: isLiked ? Math.max(0, p.likeCount - 1) : p.likeCount + 1
                };
            }
            return p;
        }));

        // 2. Perform Backend Operation
        try {
            if (isLiked) {
                await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', currentUser.id);
            } else {
                await supabase.from('post_likes').insert([{ post_id: postId, user_id: currentUser.id }]);
            }
        } catch (error) {
            console.error("Like failed:", error);
            // Revert on error (optional, but good practice)
            fetchPosts();
        }
    };

    const handleDeletePost = async (postId) => {
        // 1. Optimistic Update (Immediate Removal)
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

        // 2. Perform Backend Operation
        try {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete post.");
            fetchPosts(); // Revert
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadToSupabase(file, 'post_images');
            setPostImage(url);
        } catch (err) {
            alert("Image upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Filter Logic
    const filteredPosts = posts.filter(post => {
        const matchesSearch = !feedSearchTerm ||
            post.content?.toLowerCase().includes(feedSearchTerm.toLowerCase()) ||
            post.user?.name?.toLowerCase().includes(feedSearchTerm.toLowerCase());

        const isFollowing = feedTab === 'following' ? myFollowing.includes(post.user_id) : true;

        return matchesSearch && isFollowing;
    });

    const handleProfileClick = (name) => {
        setSearchTerm(name);
        setActiveTab('partners');
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Social Tabs */}
            <div className="flex gap-6 border-b border-white/10 mb-8">
                <button
                    onClick={() => setFeedTab('foryou')}
                    className={"pb-4 text-sm font-bold border-b-2 transition-all " + (feedTab === 'foryou' ? 'border-deedox-accent-primary text-white' : 'border-transparent text-white/40 hover:text-white')}
                >
                    For You
                </button>
                <button
                    onClick={() => setFeedTab('following')}
                    className={"pb-4 text-sm font-bold border-b-2 transition-all " + (feedTab === 'following' ? 'border-deedox-accent-primary text-white' : 'border-transparent text-white/40 hover:text-white')}
                >
                    Following
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
                <input
                    type="text"
                    placeholder="Search posts or people..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-deedox-accent-primary transition-colors"
                    value={feedSearchTerm}
                    onChange={(e) => setFeedSearchTerm(e.target.value)}
                />
            </div>

            {/* Create Post (Conditional) */}
            <AnimatePresence>
                {showPostInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, mb: 0 }}
                        animate={{ opacity: 1, height: 'auto', mb: 32 }}
                        exit={{ opacity: 0, height: 0, mb: 0 }}
                        className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden"
                    >
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-[2px] shrink-0">
                                {userProfile?.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full bg-black rounded-full" />}
                            </div>
                            <div className="flex-grow space-y-3">
                                <textarea
                                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/30 resize-none h-20"
                                    placeholder="What's on your mind?"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                />
                                {postImage && (
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-black/50">
                                        <img src={postImage} className="w-full h-full object-cover" />
                                        <button onClick={() => setPostImage('')} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"><X size={14} /></button>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                    <label className="cursor-pointer text-deedox-accent-primary hover:text-white transition-colors flex items-center gap-2">
                                        <ImageIcon size={18} />
                                        <span className="text-xs font-bold uppercase">Photo</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                    <Button variant="accent" onClick={handleCreatePost} disabled={uploading}>
                                        {uploading ? 'Posting...' : 'Post'} <Send size={14} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feed */}
            {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-white/30" /></div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center text-white/30 py-10">No posts found. Be the first to share!</div>
            ) : (
                <div className="space-y-6">
                    {filteredPosts.map(post => (
                        <FeedItem
                            key={post.id}
                            post={post}
                            currentUser={currentUser}
                            onLike={() => handleLike(post.id, post.isLiked)}
                            onDelete={() => handleDeletePost(post.id)}
                            onProfileClick={() => handleProfileClick(post.user?.name)}
                        />
                    ))}
                </div>
            )}

            {/* Floating Action Button (FAB) - "X" Style */}
            <button
                onClick={() => setShowPostInput(!showPostInput)}
                className={`fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 z-[100] ${showPostInput ? 'bg-white text-black rotate-45' : 'bg-deedox-accent-primary text-black'}`}
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

const FeedItem = ({ post, currentUser, onLike, onDelete, onProfileClick }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false); // 2-Step Delete State

    const handleComment = async () => {
        if (!commentText.trim()) return;
        await supabase.from('post_comments').insert([{ post_id: post.id, user_id: currentUser.id, content: commentText }]);
        setCommentText('');
    };

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm hover:border-white/20 transition-colors">
            <div className="p-4 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 shrink-0 overflow-hidden cursor-pointer" onClick={onProfileClick}>
                    {post.user?.avatar_url && <img src={post.user.avatar_url} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-white text-sm cursor-pointer hover:underline" onClick={onProfileClick}>{post.user?.name || 'Unknown User'}</h3>
                            <span className="text-xs text-white/30">{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        {post.user_id === currentUser.id && (
                            <div className="relative">
                                {deleteConfirm ? (
                                    <button
                                        onClick={onDelete}
                                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors animate-pulse"
                                        title="Confirm Delete"
                                        onMouseLeave={() => setDeleteConfirm(false)}
                                    >
                                        <CheckCircle size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirm(true)}
                                        className="text-white/20 hover:text-red-500 transition-colors"
                                        title="Delete Post"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-white/90 mt-2 whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-white/5">
                            <img src={post.image_url} className="w-full max-h-96 object-cover" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-4">
                        <button onClick={onLike} className={"flex items-center gap-2 text-sm font-bold transition-colors " + (post.isLiked ? 'text-pink-500' : 'text-white/40 hover:text-pink-400')}>
                            <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} /> {post.likeCount}
                        </button>
                        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors">
                            <MessageSquare size={18} /> {post.comments?.length || 0}
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="bg-black/20 p-4 border-t border-white/5">
                    <div className="space-y-4 mb-4">
                        {post.comments?.map(c => (
                            <div key={c.id} className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-gray-700 shrink-0 overflow-hidden">
                                    {c.user?.avatar_url && <img src={c.user.avatar_url} className="w-full h-full object-cover" />}
                                </div>
                                <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm">
                                    <span className="font-bold text-white block text-xs mb-1">{c.user?.name}</span>
                                    <span className="text-white/80">{c.content}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            className="flex-grow bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-deedox-accent-primary"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleComment()}
                        />
                        <button onClick={handleComment} className="p-2 bg-deedox-accent-primary rounded-full text-black"><Send size={14} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
