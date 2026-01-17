import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { uploadToCloudinary } from '../lib/uploadImage';
import Button from '../components/ui/Button';
import { Lock, Key, Save, Shield, LayoutDashboard, Users, FileText, Link as LinkIcon, Edit, Trash, Plus, Upload, Image as ImageIcon, Type, Globe, Share2, Briefcase, Zap, Bot, Database, Layers, Compass, Sun, CheckCircle, HelpCircle, LogOut, ChevronRight, Settings, Sparkles, MessageSquare, Newspaper, Cpu, Mail, Target, Quote } from 'lucide-react';
import { handleImageUpload, InputGroup, TextAreaGroup, ImageUploader } from '../components/admin/AdminHelpers';
import { supabase } from '../lib/supabaseClient';
import { Helmet } from 'react-helmet-async';

const Admin = () => {
    const {
        settings, updateSettings,
        heroContent, updateHero,
        socials, updateSocials,
        programs, resources, testimonials,
        students,
        carousel, missionContent, updateMission,
        heroImages,
        heroImagesTable, slideImagesTable, // NEW TABLES
        heroSettings, updateHeroSettings, // [FIX] Added Hero Settings
        slideSettings, updateSlideSettings, // [FIX] Added Slide Settings (Missing ref)
        headerSettings,    // AI Data (for AI Studio Tab)
        aiTools, aiChatSettings, adminPassword, updateHeaderSettings, heroLayers, config: adminConfig,
        setPreviewSettings,
        updateAiChatSettings, aiModels, capabilities, apiKeyMasked,
        workshopPopupConfig, updateWorkshopPopup,
        dashboardSlides, dashboardSlidesActions, // [NEW] From Context
        saveAllContent // [FIX] Added missing export
    } = useData();

    // Local states for forms
    const [localPassword, setLocalPassword] = useState(adminPassword);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [localKey, setLocalKey] = useState('');
    const [localBrandName, setLocalBrandName] = useState(settings.brandName || 'DEEDOX');
    const [localAiPageTitle, setLocalAiPageTitle] = useState(settings.aiPageTitle || 'DEEDOX & AI');
    const [localGlobalVisuals, setLocalGlobalVisuals] = useState(settings.globalVisuals || { enabled: true, intensity: 'medium' });
    const [localNeonEffect, setLocalNeonEffect] = useState(settings.neonEffectEnabled || false);
    const [localNeonSettings, setLocalNeonSettings] = useState(settings.neonSettings || { intensity: 'medium', speed: 'normal', softness: 'medium' }); // [NEW] Neon Settings
    const [localWorkshopPopup, setLocalWorkshopPopup] = useState(workshopPopupConfig || {});
    const [activeTab, setActiveTab] = useState('general'); // Added for Tab Navigation
    const [keyInputs, setKeyInputs] = useState({}); // Stores temporary API key inputs per model row
    const [gmailUsers, setGmailUsers] = useState([]); // [NEW] Stores fetched Gmail users
    const [loadingGmailUsers, setLoadingGmailUsers] = useState(false); // [NEW] Loading state
    // [NEW] Membership Management State
    const [usersList, setUsersList] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    // --- Supabase Client (Lazy import or from context if available, but importing here for safety) ---
    // Assuming context has supabase or we import it.
    // We need to import supabase directly.

    // --- Auth Logic ---
    // --- Secure Auth Logic ---
    const [loading, setLoading] = useState(false);

    // Auto-check session on mount
    React.useEffect(() => {
        const checkSession = () => {
            // 1. Check for legacy session first, if valid, upgrade or maintain
            const savedToken = localStorage.getItem('deedox_admin_token');
            if (savedToken) {
                setIsAuthenticated(true);
                // Sync local settings
                if (settings.brandName) setLocalBrandName(settings.brandName);
                if (settings.aiPageTitle) setLocalAiPageTitle(settings.aiPageTitle);
                if (settings.globalVisuals) setLocalGlobalVisuals(settings.globalVisuals);
            }
        };
        checkSession();
    }, [settings]);

    // [FIX] Sync Masked Key to Local State
    React.useEffect(() => {
        if (apiKeyMasked) {
            setLocalKey(apiKeyMasked);
        }
    }, [apiKeyMasked]);

    // Hashing Function (SHA-256)
    const hashPassword = async (password) => {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { supabase } = await import('../lib/supabaseClient');

            // 1. Hash the entered password
            const hashedPassword = await hashPassword(creds.password);

            // 2. Call RPC to verify
            const { data: isValid, error } = await supabase.rpc('verify_admin_credentials', {
                p_username: creds.username,
                p_hash: hashedPassword
            });

            if (error) throw error;

            if (isValid) {
                // Success!
                setIsAuthenticated(true);
                // Set simple session token (Not highly secure, but prevents refresh logout)
                localStorage.setItem('deedox_admin_token', 'valid_session_' + Date.now());

                // Store username for "Update Config" purposes
                localStorage.setItem('deedox_admin_user', creds.username);

                // Load Settings
                setLocalBrandName(settings.brandName);
                // ... other syncs handled by useEffect
            } else {
                alert("Invalid Username or Password.");
            }

        } catch (error) {
            console.error("Login Error:", error);
            alert("Login Failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('deedox_admin_token');
        localStorage.removeItem('deedox_admin_user');
        window.location.reload();
    };

    // --- Membership Management Functions ---
    const fetchUsers = async () => {
        setLoadingUsers(true);
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsersList(data || []);
        }
        setLoadingUsers(false);
    };

    const updateMembership = async (userId, newType) => {
        if (!confirm(`Change user membership to ${newType}?`)) return;

        const { error } = await supabase
            .from('users')
            .update({ membership_type: newType })
            .eq('id', userId);

        if (error) {
            alert('Error updating membership: ' + error.message);
        } else {
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, membership_type: newType } : u));
        }
    };

    const fetchGmailUsers = async () => {
        setLoadingGmailUsers(true);
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching gmail users:', error);
        } else {
            setGmailUsers(data || []);
        }
        setLoadingGmailUsers(false);
    };

    // Auto-fetch users when tab is active
    React.useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const handleSaveSettings = () => {

        // SAVE API KEY (Backend Persistence) - DEPRECATED (Moved to Env Vars)
        // if (localKey && localKey !== apiKeyMasked && !localKey.includes('........')) {
        //     aiModels.saveGlobalKey(localKey);
        // }

        // 1. Update General JSON Settings
        updateSettings({
            brandName: localBrandName,
            aiPageTitle: localAiPageTitle,
            globalVisuals: localGlobalVisuals,
            neonEffectEnabled: localNeonEffect,
            neonSettings: localNeonSettings // Save Neon Settings
        });

        // 2. [NEW] Update Workshop Popup (Dedicated Table)
        if (updateWorkshopPopup) {
            updateWorkshopPopup(localWorkshopPopup);
        }

        setPreviewSettings(null); // Clear preview as it matches saved now
        alert("System Settings Saved!");
    };

    // --- FORCE SAVE HELPER (সব ডাটা সেভ করার ফাংশন) ---
    // এই ফাংশনটি 'Save Changes' বাটনে ক্লিক করলে কল হয় এবং সব ডাটাবেসে পাঠায়
    const handleForceSave = async (e) => {
        const btn = e.currentTarget;
        const originalText = btn.innerText;
        btn.innerText = "Saving..."; // বাটন টেক্সট পরিবর্তন
        try {
            await saveAllContent(); // DataContext থেকে সেভ ফাংশন কল করা হচ্ছে
            alert("Success! All Settings Synced to Database.");
        } catch (err) {
            alert("Save Failed: " + err.message);
        } finally {
            btn.innerText = originalText; // বাটন আগের অবস্থায় ফিরিয়ে আনা
        }
    };


    // --- TABLE CRUD HELPERS ---
    const TableManager = ({ title, data, onAdd, onUpdate, onDelete, fields }) => {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <Button variant="primary" className="py-2 text-sm" onClick={onAdd}><Plus size={16} /> Add New</Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {data.items.map(item => (
                        <div key={item.id} className="bg-black/20 p-6 rounded-xl border border-white/5 relative group space-y-4">
                            <button onClick={() => onDelete(item.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded"><Trash size={18} /></button>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                {/* Image Preview & Upload */}
                                <div className="md:col-span-3">
                                    <ImageUploader
                                        label="Image"
                                        value={item.image_url}
                                        onChange={v => onUpdate(item.id, { image_url: v })}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fields.map(field => {
                                        if (field.type === 'text') return (
                                            <InputGroup key={field.key} label={field.label} value={item[field.key] || ''} onChange={v => onUpdate(item.id, { [field.key]: v })} />
                                        );
                                        if (field.type === 'slider') return (
                                            <div key={field.key} className="space-y-2">
                                                <label className="text-xs text-deedox-text-muted uppercase font-bold flex justify-between">
                                                    {field.label} <span>{item[field.key] || 0}{field.unit}</span>
                                                </label>
                                                <input
                                                    type="range" min={field.min} max={field.max} step={field.step || 1}
                                                    value={item[field.key] !== undefined ? item[field.key] : field.default}
                                                    onChange={e => onUpdate(item.id, { [field.key]: parseInt(e.target.value) })}
                                                    className="w-full accent-deedox-accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        );
                                        if (field.type === 'toggle') return (
                                            <div key={field.key} className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/10 h-max self-end">
                                                <input
                                                    type="checkbox"
                                                    checked={item[field.key] || false}
                                                    onChange={e => onUpdate(item.id, { [field.key]: e.target.checked })}
                                                    className="w-5 h-5 accent-deedox-accent-primary cursor-pointer"
                                                />
                                                <span className="text-sm text-white font-bold">{field.label}</span>
                                            </div>
                                        );
                                        if (field.type === 'textarea') return (
                                            <TextAreaGroup key={field.key} label={field.label} value={item[field.key] || ''} onChange={v => onUpdate(item.id, { [field.key]: v })} />
                                        );
                                        return null;
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.items.length === 0 && <p className="text-white/30 text-center py-10">No items found.</p>}
                </div>
            </div>
        );
    };


    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/000000/000000')] opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-deedox-accent-primary/5 rounded-full blur-[100px]" />
                <div className="glass-card p-10 rounded-3xl w-full max-w-md relative z-10 border-t border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Admin Access</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-deedox-accent-primary transition-all"
                            value={creds.username}
                            onChange={e => setCreds({ ...creds, username: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-deedox-accent-primary transition-all"
                            value={creds.password}
                            onChange={e => setCreds({ ...creds, password: e.target.value })}
                            required
                        />

                        <Button variant="accent" className="w-full justify-center py-3 mt-4" disabled={loading}>
                            {loading ? 'Processing...' : 'Login'}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // --- News Manager Logic ---
    const NewsManager = () => {
        const [newsItems, setNewsItems] = useState([]);
        const [editing, setEditing] = useState(null); // null = list mode, { } = create/edit mode
        const [loadingNews, setLoadingNews] = useState(false);

        // Fetch on mount of this component (when tab active)
        React.useEffect(() => {
            fetchNews();
        }, []);

        const fetchNews = async () => {
            setLoadingNews(true);
            const { supabase } = await import('../lib/supabaseClient');
            const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
            if (data) setNewsItems(data);
            setLoadingNews(false);
        };

        const handleSave = async (doc) => {
            // alert("Step 1: Save Process Started"); // TRACE 1 - Removed
            console.log("Save clicked", doc);

            if (!doc.title) {
                alert("Error: Title is missing!");
                return;
            }

            try {
                // DIRECT USE (No dynamic import inside function to prevent stalling)
                // const { supabase } = await import('../lib/supabaseClient'); // Commented out to test regular import

                alert("Step 2: Supabase Client Loaded"); // TRACE 2

                if (!supabase) {
                    alert("Critical Error: Supabase not initialized!");
                    return;
                }

                console.log("Supabase loaded, saving..."); // DEBUG

                let result;
                if (doc.id) {
                    result = await supabase.from('news').update({
                        title: doc.title,
                        description: doc.description,
                        content: doc.content,
                        image_url: doc.image_url,
                        is_published: doc.is_published
                    }).eq('id', doc.id);
                } else {
                    alert("Step 3: Inserting new record..."); // TRACE 3
                    result = await supabase.from('news').insert([{
                        ...doc,
                        content: doc.content || '',
                        is_published: doc.is_published !== undefined ? doc.is_published : true
                    }]);
                }

                alert("Step 4: Database Operation Finished"); // TRACE 4
                console.log("Save result:", result); // DEBUG

                if (result.error) throw result.error;

                setEditing(null);
                fetchNews();
                alert("News saved successfully!");
            } catch (err) {
                console.error("News Save Error:", err);
                alert("Failed to save news: " + err.message);
            }
        };

        const handleDelete = async (id) => {
            if (!window.confirm("Delete this news item?")) return;
            const { supabase } = await import('../lib/supabaseClient');
            const { error } = await supabase.from('news').delete().eq('id', id);
            if (error) {
                alert("Failed to delete: " + error.message);
            } else {
                fetchNews();
            }
        };

        const togglePublish = async (item) => {
            const newValue = !item.is_published;
            // Optimistic update
            setNewsItems(prev => prev.map(n => n.id === item.id ? { ...n, is_published: newValue } : n));

            const { supabase } = await import('../lib/supabaseClient');
            const { error } = await supabase.from('news').update({ is_published: newValue }).eq('id', item.id);

            if (error) {
                console.error("Toggle Error:", error);
                alert("Failed to update status: " + error.message);
                fetchNews(); // Revert
            }
        };

        if (editing) {
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-bold text-white">{editing.id ? 'Edit News' : 'Add News'}</h2>
                        <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                    </div>
                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                        <InputGroup label="Title" value={editing.title || ''} onChange={v => setEditing({ ...editing, title: v })} />

                        <div className="space-y-1">
                            <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Summary (Excerpt)</label>
                            <textarea
                                value={editing.description || ''}
                                onChange={e => setEditing({ ...editing, description: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-deedox-accent-primary outline-none h-24 resize-none"
                                placeholder="Short summary for the card..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Full Article Content</label>
                            <textarea
                                value={editing.content || ''}
                                onChange={e => setEditing({ ...editing, content: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-deedox-accent-primary outline-none h-64 resize-none font-mono text-sm"
                                placeholder="Full HTML or Markdown content..."
                            />
                        </div>

                        <ImageUploader label="News Image" value={editing.image_url || ''} onChange={v => setEditing({ ...editing, image_url: v })} />

                        <div
                            className="flex items-center gap-3 bg-black/40 p-4 rounded-lg border border-white/10 cursor-pointer hover:bg-black/60 transition-colors"
                            onClick={() => setEditing({ ...editing, is_published: !(editing.is_published !== undefined ? editing.is_published : true) })}
                        >
                            <input
                                type="checkbox"
                                checked={editing.is_published !== undefined ? editing.is_published : true}
                                onChange={() => { }} // Handle click on parent div
                                className="w-5 h-5 accent-deedox-accent-primary cursor-pointer pointer-events-none" // Prevent double firing
                            />
                            <span className={`font-bold ${editing.is_published !== false ? 'text-white' : 'text-white/50'}`}>
                                {editing.is_published !== false ? 'Published' : 'Draft'}
                            </span>
                        </div>

                        {/* DEBUG: Using standard button to force click event */}
                        {/* DEBUG: Force Click Handler */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                alert("DEBUG: Button Clicked! Starting save process..."); // UNCOMMENTED
                                handleSave(editing);
                            }}
                            className="w-full py-3 rounded-full font-bold bg-deedox-accent-primary text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(112,224,0,0.3)] z-50 relative"
                        >
                            Save Article
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-white">AI News</h2>
                    <Button variant="primary" className="py-2 text-sm" onClick={() => setEditing({ is_published: true })}><Plus size={16} /> Add Article</Button>
                </div>
                {loadingNews ? (
                    <div className="text-white/50">Loading news...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {newsItems.map(item => (
                            <div key={item.id} className="bg-black/20 p-4 rounded-xl border border-white/5 flex gap-4 items-center group">
                                <div className="w-16 h-16 rounded bg-black/50 overflow-hidden shrink-0">
                                    {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <Newspaper className="m-auto mt-4 text-white/20" />}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-white">{item.title}</h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); togglePublish(item); }}
                                        className={`mt-2 text-[10px] uppercase font-bold px-2 py-1 rounded border flex items-center gap-2 w-max transition-all ${item.is_published ? 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20'}`}
                                    >
                                        {item.is_published ? <CheckCircle size={10} /> : <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />}
                                        {item.is_published ? 'Published' : 'Draft'}
                                    </button>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditing(item)} className="p-2 bg-white/10 rounded hover:bg-white/20 text-white"><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 rounded hover:bg-red-500/20 text-red-500"><Trash size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {newsItems.length === 0 && <p className="text-white/30 text-center py-10">No news found.</p>}
                    </div>
                )}
            </div>
        );
    };

    // --- Subscriber Manager Logic ---
    const SubscriberManager = () => {
        const [subscribers, setSubscribers] = useState([]);
        const [loadingSubs, setLoadingSubs] = useState(false);

        React.useEffect(() => {
            fetchSubs();
        }, []);

        const fetchSubs = async () => {
            setLoadingSubs(true);
            const { supabase } = await import('../lib/supabaseClient');
            const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
            if (data) setSubscribers(data);
            setLoadingSubs(false);
        };

        const handleCopyAll = () => {
            const emails = subscribers.map(s => s.email).join(', ');
            navigator.clipboard.writeText(emails);
            alert('All emails copied to clipboard!');
        };

        const handleDeleteSub = async (id) => {
            if (!window.confirm("Remove this subscriber?")) return;
            const { supabase } = await import('../lib/supabaseClient');
            await supabase.from('newsletter_subscribers').delete().eq('id', id);
            fetchSubs();
        }

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-white">Newsletter Subscribers ({subscribers.length})</h2>
                    <Button variant="outline" className="py-2 text-sm" onClick={handleCopyAll}><Share2 size={16} /> Copy All Emails</Button>
                </div>
                {loadingSubs ? (
                    <div className="text-white/50">Loading subscribers...</div>
                ) : (
                    <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-xs text-deedox-text-muted uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-white/10">Email</th>
                                    <th className="p-4 font-bold border-b border-white/10">Joined Date</th>
                                    <th className="p-4 font-bold border-b border-white/10 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map((sub, i) => (
                                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-white font-medium">{sub.email}</td>
                                        <td className="p-4 text-white/50 text-sm">{new Date(sub.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDeleteSub(sub.id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {subscribers.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-white/30">No subscribers yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-10 px-4 pb-20">
            <Helmet>
                <title>Admin Panel - DEEDOX</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            <div className="container mx-auto max-w-7xl">
                <div className="glass-card p-4 md:p-8 rounded-3xl border border-white/10 min-h-[85vh] flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 space-y-2 shrink-0 border-r border-white/5 pr-6">
                        <h1 className="text-2xl font-bold text-white mb-8 pl-2 flex items-center gap-2">
                            {settings.logoUrl ? (
                                <img
                                    src={settings.logoUrl}
                                    alt="Logo"
                                    className="h-8 w-auto object-contain !bg-transparent bg-transparent border-none shadow-none outline-none ring-0 backdrop-filter-none"
                                    style={{ background: 'transparent', backgroundColor: 'transparent', boxShadow: 'none' }}
                                />
                            ) : (
                                <span className="text-deedox-accent-primary">{settings.brandName || "DEEDOX"}</span>
                            )}
                            Admin
                        </h1>
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w - full text - left p - 3 rounded - lg capitalize font - medium flex items - center gap - 3 transition - all ${activeTab === 'general' ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'} `}
                        >
                            <Settings size={18} /> General Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('header')}
                            className={`w - full text - left p - 3 rounded - lg capitalize font - medium flex items - center gap - 3 transition - all ${activeTab === 'header' ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'} `}
                        >
                            <LayoutDashboard size={18} /> Header & Navigation
                        </button>
                        <button
                            onClick={() => setActiveTab('ai_studio')}
                            className={`w - full text - left p - 3 rounded - lg capitalize font - medium flex items - center gap - 3 transition - all ${activeTab === 'ai_studio' ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'} `}
                        >
                            <Bot size={18} /> AI Studio
                        </button>

                        <button
                            onClick={() => setActiveTab('dashboard_hero')}
                            className={`w-full text-left p-3 rounded-lg capitalize font-medium flex items-center gap-3 transition-all ${activeTab === 'dashboard_hero' ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'} `}
                        >
                            <Sparkles size={18} /> Dashboard Hero
                        </button>
                        <button
                            onClick={() => setActiveTab('ai_chat_config')}
                            className={`w-full text-left p-3 rounded-lg capitalize font-medium flex items-center gap-3 transition-all ${activeTab === 'ai_chat_config' ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'} `}
                        >
                            <MessageSquare size={18} /> AI Chat Config
                        </button>
                        <button
                            onClick={() => setActiveTab('hero_manager')}
                            className={`w - full text - left p - 3 rounded - lg capitalize font - medium flex items - center gap - 3 transition - all ${activeTab === 'hero_manager' ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'} `}
                        >
                            <ImageIcon size={18} /> Hero Backgrounds
                        </button>
                        <button
                            onClick={() => setActiveTab('workshop_popup')}
                            className={`w-full text-left p-3 rounded-lg capitalize font-medium flex items-center gap-3 transition-all ${activeTab === 'workshop_popup' ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'}`}
                        >
                            <Sparkles size={18} /> Workshop Popup
                        </button>
                        <button
                            onClick={() => setActiveTab('slide_manager')}
                            className={`w - full text - left p - 3 rounded - lg capitalize font - medium flex items - center gap - 3 transition - all ${activeTab === 'slide_manager' ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'} `}
                        >
                            <Layers size={18} /> Sliding Cards
                        </button>
                        <button
                            onClick={() => setActiveTab('students_gmail')}
                            className={`w-full text-left p-3 rounded-lg capitalize font-medium flex items-center gap-3 transition-all ${activeTab === 'students_gmail' ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'}`}
                        >
                            <Users size={18} /> Students (Gmail)
                        </button>
                        {['users', 'students', 'news', 'subscribers', 'content', 'mission', 'programs', 'resources', 'socials', 'testimonials'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w - full text - left p - 3 rounded - lg capitalize font - medium flex items - center gap - 3 transition - all ${activeTab === tab ? 'bg-deedox-accent-primary text-black font-bold shadow-[0_0_15px_rgba(112,224,0,0.3)]' : 'text-deedox-text-secondary hover:bg-white/5'} `}
                            >
                                {tab === 'users' && <Users size={18} />}
                                {tab === 'students' && <Users size={18} />}
                                {tab === 'news' && <Newspaper size={18} />}
                                {tab === 'content' && <FileText size={18} />}
                                {tab === 'mission' && <Globe size={18} />}
                                {tab === 'programs' && <Compass size={18} />}
                                {tab === 'resources' && <LinkIcon size={18} />}
                                {tab === 'socials' && <LinkIcon size={18} />}
                                {tab === 'subscribers' && <Mail size={18} />}
                                {tab === 'testimonials' && <Quote size={18} />}
                                {tab === 'users' ? 'Enrolled Emails' : tab === 'students' ? 'Student Co-Founders' : tab === 'news' ? 'AI News Manager' : tab === 'subscribers' ? 'Newsletter Subscribers' : tab === 'content' ? 'Homepage Content' : tab === 'mission' ? 'Mission Section' : tab === 'programs' ? 'Programs' : tab === 'resources' ? 'Resources' : tab === 'socials' ? 'Social Links' : tab === 'testimonials' ? 'Student Stories' : tab}
                            </button>
                        ))}
                        <div className="mt-10">
                            <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="w-full justify-center">Logout</Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow space-y-8 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">General Settings</h2>
                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                    <h3 className="text-lg text-white font-bold flex items-center gap-2"><Type size={18} /> Branding</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                        <div className="space-y-4">
                                            <InputGroup label="Website Name (Brand)" value={localBrandName} onChange={setLocalBrandName} />
                                            <InputGroup label="AI Page Title" value={localAiPageTitle} onChange={setLocalAiPageTitle} />
                                        </div>
                                        <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                                            <ImageUploader
                                                label="Website Logo (Replaces Text)"
                                                value={settings.logoUrl}
                                                onChange={url => updateSettings({ logoUrl: url })}
                                            />
                                            {settings.logoUrl && (
                                                <button
                                                    onClick={() => updateSettings({ logoUrl: '' })}
                                                    className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                                                >
                                                    Remove Logo (Use Text)
                                                </button>
                                            )}

                                            {settings.logoUrl && (
                                                <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                                                    <div>
                                                        <label className="text-xs text-deedox-text-muted uppercase font-bold flex justify-between">
                                                            Logo Width <span>{headerSettings?.logoWidth || 120}px</span>
                                                        </label>
                                                        <input
                                                            type="range" min="40" max="220" step="5"
                                                            value={headerSettings?.logoWidth || 120}
                                                            onChange={e => updateHeaderSettings({ logoWidth: parseInt(e.target.value) })}
                                                            className="w-full mt-2 accent-deedox-accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>

                                                    {/* Forced Background Toggle - Locked */}
                                                    <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                                                        <label className="text-xs text-deedox-text-muted uppercase font-bold flex items-center gap-2">
                                                            <Lock size={12} /> Transparent Background
                                                        </label>
                                                        <div className="bg-deedox-accent-primary/20 text-deedox-accent-primary text-[10px] font-bold px-2 py-1 rounded border border-deedox-accent-primary/50">
                                                            FORCED ON
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Credentials Management */}
                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                    <h3 className="text-lg text-white font-bold flex items-center gap-2"><Lock size={18} className="text-deedox-accent-primary" /> Admin Credentials</h3>
                                    <p className="text-sm text-white/50 mb-4">Update your admin username and password here. Changes apply immediately.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <InputGroup
                                                label="New Username"
                                                value={creds.newUsername || ''}
                                                onChange={v => setCreds({ ...creds, newUsername: v })}
                                                placeholder="Enter new username"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-deedox-accent-primary transition-all"
                                                    value={creds.newPassword || ''}
                                                    onChange={e => setCreds({ ...creds, newPassword: e.target.value })}
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg mt-2">
                                        <h4 className="text-red-400 text-xs font-bold uppercase mb-2">Confirm Current Password to Save Changes</h4>
                                        <input
                                            type="password"
                                            className="w-full bg-black/40 border border-red-500/20 p-3 rounded-lg text-white outline-none focus:border-red-500 transition-all"
                                            value={creds.currentPasswordConfirm || ''}
                                            onChange={e => setCreds({ ...creds, currentPasswordConfirm: e.target.value })}
                                            placeholder="Current Password is required"
                                        />
                                    </div>

                                    <Button
                                        variant="primary"
                                        className="w-full mt-2"
                                        onClick={async () => {
                                            if (!creds.newUsername || !creds.newPassword || !creds.currentPasswordConfirm) {
                                                alert("All fields are required to update credentials.");
                                                return;
                                            }
                                            if (creds.newPassword.length < 6) {
                                                alert("Password must be at least 6 characters.");
                                                return;
                                            }

                                            try {
                                                const { supabase } = await import('../lib/supabaseClient');
                                                const oldUser = localStorage.getItem('deedox_admin_user') || 'admin';

                                                // Hash both current (for verify) and new
                                                const oldHash = await hashPassword(creds.currentPasswordConfirm);
                                                const newHash = await hashPassword(creds.newPassword);

                                                const { data: success, error } = await supabase.rpc('update_admin_credentials', {
                                                    p_old_username: oldUser,
                                                    p_old_hash: oldHash,
                                                    p_new_username: creds.newUsername,
                                                    p_new_hash: newHash
                                                });

                                                if (success) {
                                                    alert("Credentials Updated! Please log in again.");
                                                    handleLogout();
                                                } else {
                                                    alert("Failed! Incorrect current password.");
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert("Update Error: " + e.message);
                                            }
                                        }}
                                    >
                                        Update Credentials
                                    </Button>
                                </div>

                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                    <h3 className="text-lg text-white font-bold flex items-center gap-2"><Sparkles size={18} className="text-deedox-accent-primary" /> Global Background</h3>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-300">Enable Neon Glow</label>
                                        <input
                                            type="checkbox"
                                            checked={localGlobalVisuals.enabled}
                                            onChange={e => {
                                                const newVal = { ...localGlobalVisuals, enabled: e.target.checked };
                                                setLocalGlobalVisuals(newVal);
                                                setPreviewSettings({ globalVisuals: newVal });
                                            }}
                                            className="w-5 h-5 accent-deedox-accent-primary cursor-pointer"
                                        />
                                    </div>

                                    {/* Neon Dashboard Toggle */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                        <div>
                                            <label className="text-sm text-deedox-accent-primary font-bold">Enable Neon Dashboard Effect</label>
                                            <p className="text-xs text-white/50">Adds animated green borders and shadows to the student dashboard.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={localNeonEffect}
                                            onChange={e => setLocalNeonEffect(e.target.checked)}
                                            className="w-5 h-5 accent-deedox-accent-primary cursor-pointer"
                                        />
                                    </div>

                                    {/* Neon Dashboard Settings */}
                                    {localNeonEffect && (
                                        <div className="bg-deedox-accent-primary/5 p-4 rounded-lg border border-deedox-accent-primary/10 space-y-4 mt-2 mb-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-deedox-text-muted uppercase font-bold">Intensity/Glow</label>
                                                    <select
                                                        value={localNeonSettings.intensity || 'medium'}
                                                        onChange={e => setLocalNeonSettings({ ...localNeonSettings, intensity: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 px-2 py-1.5 rounded text-xs text-white outline-none focus:border-deedox-accent-primary"
                                                    >
                                                        <option value="low">Low (Subtle)</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High (Strong)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-deedox-text-muted uppercase font-bold">Animation Speed</label>
                                                    <select
                                                        value={localNeonSettings.speed || 'normal'}
                                                        onChange={e => setLocalNeonSettings({ ...localNeonSettings, speed: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 px-2 py-1.5 rounded text-xs text-white outline-none focus:border-deedox-accent-primary"
                                                    >
                                                        <option value="slow">Slow</option>
                                                        <option value="normal">Normal</option>
                                                        <option value="fast">Fast</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-deedox-text-muted uppercase font-bold">Softness/Blur</label>
                                                    <select
                                                        value={localNeonSettings.softness || 'medium'}
                                                        onChange={e => setLocalNeonSettings({ ...localNeonSettings, softness: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 px-2 py-1.5 rounded text-xs text-white outline-none focus:border-deedox-accent-primary"
                                                    >
                                                        <option value="low">Sharp</option>
                                                        <option value="medium">Balanced</option>
                                                        <option value="high">Soft</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {localGlobalVisuals.enabled && (
                                        <div className="space-y-6 border-t border-white/5 pt-4">
                                            <div className="space-y-2">
                                                <label className="text-xs text-deedox-text-muted uppercase font-bold">Glow Intensity (Presets)</label>
                                                <div className="flex gap-2">
                                                    {['low', 'medium', 'high'].map(level => (
                                                        <button
                                                            key={level}
                                                            onClick={() => {
                                                                const newVal = { ...localGlobalVisuals, intensity: level, opacity: level === 'high' ? 0.4 : level === 'low' ? 0.1 : 0.2, blur: level === 'high' ? 150 : 120 };
                                                                setLocalGlobalVisuals(newVal);
                                                                setPreviewSettings({ globalVisuals: newVal });
                                                            }}
                                                            className={`px - 4 py - 2 rounded - lg text - xs font - bold capitalize transition - all border ${localGlobalVisuals.intensity === level ? 'bg-deedox-accent-primary text-black border-deedox-accent-primary' : 'bg-transparent text-white border-white/20 hover:border-white'} `}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs text-deedox-text-muted uppercase font-bold">Glow Color</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={localGlobalVisuals.color || '#70E000'}
                                                        onChange={e => {
                                                            const newVal = { ...localGlobalVisuals, color: e.target.value };
                                                            setLocalGlobalVisuals(newVal);
                                                            setPreviewSettings({ globalVisuals: newVal });
                                                        }}
                                                        className="w-10 h-10 rounded border-none bg-transparent cursor-pointer"
                                                    />
                                                    <span className="text-white font-mono text-sm">{localGlobalVisuals.color || '#70E000'}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-deedox-text-muted uppercase font-bold flex justify-between">
                                                        Hero Opacity <span>{adminConfig.heroConfig?.background_opacity || 50}%</span>
                                                    </label>
                                                    <input
                                                        type="range" min="0" max="100" step="5"
                                                        value={adminConfig.heroConfig?.background_opacity || 50}
                                                        onChange={e => adminConfig.updateHeroOpacity(parseInt(e.target.value))}
                                                        className="w-full accent-deedox-accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-deedox-text-muted uppercase font-bold flex justify-between">
                                                        Carousel Blur Effect
                                                    </label>
                                                    <div className="flex items-center gap-3 h-10">
                                                        <span className="text-sm text-white">Enable Blur</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={adminConfig.imageEffects?.find(e => e.section_name === 'carousel_blur')?.is_enabled || false}
                                                            onChange={e => adminConfig.toggleBlur('carousel_blur', e.target.checked)}
                                                            className="w-5 h-5 accent-deedox-accent-primary cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <ImageUploader
                                                    label="Custom Texture / Image Overlay"
                                                    value={localGlobalVisuals.texture}
                                                    onChange={v => {
                                                        const newVal = { ...localGlobalVisuals, texture: v };
                                                        setLocalGlobalVisuals(newVal);
                                                        setPreviewSettings({ globalVisuals: newVal });
                                                    }}
                                                />
                                                {localGlobalVisuals.texture && (
                                                    <button
                                                        onClick={() => {
                                                            const newVal = { ...localGlobalVisuals, texture: '' };
                                                            setLocalGlobalVisuals(newVal);
                                                            setPreviewSettings({ globalVisuals: newVal });
                                                        }}
                                                        className="text-xs text-red-400 hover:text-red-300 underline"
                                                    >
                                                        Remove Texture
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                                    <h3 className="text-lg text-white font-bold mb-4 flex items-center gap-2"><Key size={18} /> API Configuration</h3>
                                    <div className="space-y-4">
                                        <InputGroup label="OpenRouter API Key" value={localKey} onChange={setLocalKey} type="password" />
                                        <Button variant="accent" onClick={handleSaveSettings}>Save Settings</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WORKSHOP POPUP TAB */}
                        {activeTab === 'workshop_popup' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <h2 className="text-2xl font-bold text-white">Workshop Popup Settings</h2>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-300 font-bold">Show Popup</label>
                                        <input
                                            type="checkbox"
                                            checked={localWorkshopPopup.enabled || false}
                                            onChange={e => setLocalWorkshopPopup({ ...localWorkshopPopup, enabled: e.target.checked })}
                                            className="w-5 h-5 accent-deedox-accent-primary cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column: Form */}
                                        <div className="space-y-4">
                                            <InputGroup label="Main Title" value={localWorkshopPopup.title || ''} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, title: v })} />
                                            <InputGroup label="Highlight Word (Green Text)" value={localWorkshopPopup.highlightWord || ''} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, highlightWord: v })} />
                                            <div className="space-y-1">
                                                <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Subtitle / Description</label>
                                                <textarea
                                                    value={localWorkshopPopup.subtitle || ''}
                                                    onChange={e => setLocalWorkshopPopup({ ...localWorkshopPopup, subtitle: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-deedox-accent-primary outline-none h-24 resize-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <InputGroup label="Date" value={localWorkshopPopup.date || 'January 15, 2026'} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, date: v })} />
                                                <InputGroup label="Time" value={localWorkshopPopup.time || '4:00 PM PKT'} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, time: v })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputGroup label="Enrolled Count" value={localWorkshopPopup.enrolledCount || '1000+'} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, enrolledCount: v })} />
                                                <InputGroup label="Seats Left Text (Green Badge)" value={localWorkshopPopup.seatsLeftText || ''} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, seatsLeftText: v })} />
                                            </div>

                                            <div className="border-t border-white/5 pt-4 space-y-4">
                                                <ImageUploader
                                                    label="Thumbnail Image URL"
                                                    value={localWorkshopPopup.thumbnailUrl || ''}
                                                    onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, thumbnailUrl: v })}
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column: CTA & Pricing */}
                                        <div className="space-y-4">
                                            <InputGroup label="Price Text (Footer)" value={localWorkshopPopup.priceText || ''} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, priceText: v })} />

                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                                                <h4 className="text-white font-bold text-sm uppercase">Buttons</h4>
                                                <InputGroup label="Primary Button Text" value={localWorkshopPopup.primaryBtnText || 'Join Now'} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, primaryBtnText: v })} />
                                                <InputGroup label="Primary Button Link" value={localWorkshopPopup.primaryBtnLink || '#'} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, primaryBtnLink: v })} />
                                                <InputGroup label="Secondary Button Text" value={localWorkshopPopup.secondaryBtnText || 'Maybe Later'} onChange={v => setLocalWorkshopPopup({ ...localWorkshopPopup, secondaryBtnText: v })} />
                                            </div>

                                            <div className="bg-deedox-accent-primary/10 p-4 rounded-xl border border-deedox-accent-primary/20">
                                                <p className="text-deedox-accent-primary text-xs font-bold mb-2">PREVIEW HINT</p>
                                                <p className="text-white/60 text-xs">
                                                    Ensure the "Highlight Word" exist exactly within the "Main Title" text if you want it to be colored green. If it's separate, just type it normally.
                                                    <br /><br />
                                                    The popup will appear centered on the screen with a blurred backdrop.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-white/10">
                                        <Button variant="accent" onClick={handleSaveSettings}><Save size={16} /> Save Popup Settings</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'header' && (
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <LayoutDashboard className="text-deedox-accent-primary" /> Header Customization
                                    </h2>
                                    <Button variant="accent" onClick={handleForceSave}><Save size={16} /> Save Changes</Button>
                                </div>

                                <div className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Brand Name</label>
                                        <div className="relative">
                                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                            <input
                                                type="text"
                                                value={settings.brandName}
                                                onChange={e => updateSettings({ brandName: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-3 rounded-lg text-white focus:border-deedox-accent-primary outline-none focus:shadow-[0_0_15px_rgba(112,224,0,0.1)] transition-all"
                                                placeholder="e.g. DEEDOX"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Logo Icon Color</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={headerSettings?.iconColor || '#70E000'}
                                                    onChange={e => updateHeaderSettings({ iconColor: e.target.value })}
                                                    className="w-10 h-10 rounded border-none bg-transparent cursor-pointer"
                                                />
                                                <span className="text-white font-mono text-sm">{headerSettings?.iconColor}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Glow Intensity</label>
                                            <select
                                                value={headerSettings?.glowIntensity || 'medium'}
                                                onChange={e => updateHeaderSettings({ glowIntensity: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-lg text-white appearance-none outline-none focus:border-deedox-accent-primary"
                                            >
                                                <option value="low">Low (Subtle)</option>
                                                <option value="medium">Medium (Premium)</option>
                                                <option value="high">High (Neon)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide flex justify-between">
                                            Glass Opacity <span>{Math.round((headerSettings?.glassOpacity || 0.9) * 100)}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.05"
                                            value={headerSettings?.glassOpacity || 0.9}
                                            onChange={e => updateHeaderSettings({ glassOpacity: parseFloat(e.target.value) })}
                                            className="w-full accent-deedox-accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* USERS TAB (Enrolled) */}

                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <h2 className="text-2xl font-bold text-white">User Membership Manager</h2>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Search email or name..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            className="bg-black/40 border border-white/10 px-3 py-2 rounded-lg text-xs text-white outline-none focus:border-deedox-accent-primary"
                                        />
                                        <Button variant="outline" onClick={fetchUsers} disabled={loadingUsers}>
                                            {loadingUsers ? 'Refreshing...' : 'Refresh'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 bg-white/5">
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase">User</th>
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase">Role</th>
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase">Membership Status</th>
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase">Join Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loadingUsers ? (
                                                    <tr><td colSpan="4" className="p-8 text-center text-white/30 italic">Loading users...</td></tr>
                                                ) : usersList.filter(u => !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.name?.toLowerCase().includes(userSearch.toLowerCase())).length > 0 ? (
                                                    usersList
                                                        .filter(u => !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.name?.toLowerCase().includes(userSearch.toLowerCase()))
                                                        .map(user => (
                                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                                <td className="p-4 flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                                                        {user.avatar_url ? (
                                                                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-white/50 text-[10px] font-bold">{user.name?.[0]}</div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-white font-medium text-sm">{user.name || 'No Name'}</div>
                                                                        <div className="text-white/40 text-[10px]">{user.email}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-xs text-white/60">{user.role}</td>
                                                                <td className="p-4">
                                                                    <select
                                                                        value={user.membership_type || 'free'}
                                                                        onChange={(e) => updateMembership(user.id, e.target.value)}
                                                                        className={`px-2 py-1 rounded text-xs font-bold border outline-none cursor-pointer transition-all ${(user.membership_type === 'pro')
                                                                            ? 'bg-[#a3e635]/10 text-[#a3e635] border-[#a3e635]/30 hover:bg-[#a3e635]/20'
                                                                            : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                                                                            }`}
                                                                    >
                                                                        <option value="free">Free Member</option>
                                                                        <option value="pro">Pro Member</option>
                                                                    </select>
                                                                </td>
                                                                <td className="p-4 text-xs text-white/40">
                                                                    {new Date(user.created_at).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                        ))
                                                ) : (
                                                    <tr><td colSpan="4" className="p-8 text-center text-white/30 italic">No users found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'news' && (
                            <NewsManager />
                        )}

                        {/* SUBSCRIBERS TAB */}
                        {activeTab === 'subscribers' && (
                            <SubscriberManager />
                        )}

                        {/* NEW HERO MANAGER TAB with Global Settings */}
                        {activeTab === 'hero_manager' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Global Hero Configuration */}
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Settings size={20} className="text-deedox-accent-primary" /> Global Slider Controls
                                        </h2>
                                        <Button variant="accent" onClick={async (e) => {
                                            const btn = e.currentTarget;
                                            const originalText = btn.innerText;
                                            btn.innerText = "Saving...";
                                            try { await saveAllContent(); alert("Hero Settings Saved!"); }
                                            catch (err) { alert(err.message); }
                                            finally { btn.innerText = originalText; }
                                        }}><Save size={16} /> Save Settings</Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Slider Toggle */}
                                        <div className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-white/10">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Enable Slider Animation</h4>
                                                <p className="text-xs text-white/50">Show the moving image marquee behind content.</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold uppercase ${heroSettings?.sliderEnabled !== false ? 'text-green-500' : 'text-red-500'}`}>
                                                    {heroSettings?.sliderEnabled !== false ? 'Active' : 'Hidden'}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={heroSettings?.sliderEnabled !== false}
                                                    onChange={e => updateHeroSettings({ sliderEnabled: e.target.checked })}
                                                    className="w-6 h-6 accent-deedox-accent-primary cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Blur Toggle */}
                                        <div className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-white/10">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Enable Blur Effect</h4>
                                                <p className="text-xs text-white/50">Apply a glass-blur to the image cards.</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold uppercase ${heroSettings?.blurEnabled !== false ? 'text-blue-400' : 'text-gray-500'}`}>
                                                    {heroSettings?.blurEnabled !== false ? 'Blurred' : 'Clear'}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={heroSettings?.blurEnabled !== false}
                                                    onChange={e => updateHeroSettings({ blurEnabled: e.target.checked })}
                                                    className="w-6 h-6 accent-deedox-accent-primary cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <TableManager
                                    title="Hero Background Images"
                                    data={heroImagesTable}
                                    onAdd={() => heroImagesTable.add({ image_url: '', enabled: true, blur_level: 0, opacity_level: 50 })}
                                    onUpdate={heroImagesTable.update}
                                    onDelete={heroImagesTable.remove}
                                    fields={[
                                        { label: 'Visible', key: 'enabled', type: 'toggle' },
                                        { label: 'Opacity', key: 'opacity_level', type: 'slider', min: 0, max: 100, unit: '%', default: 50 },
                                        { label: 'Blur', key: 'blur_level', type: 'slider', min: 0, max: 20, unit: 'px', default: 0 }
                                    ]}
                                />
                            </div>
                        )}

                        {/* NEW SLIDE MANAGER TAB */}
                        {activeTab === 'slide_manager' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Global Slide Configuration */}
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Settings size={20} className="text-deedox-accent-primary" /> Global Slider Controls
                                        </h2>
                                        <Button variant="accent" onClick={async (e) => {
                                            const btn = e.currentTarget;
                                            const originalText = btn.innerText;
                                            btn.innerText = "Saving...";
                                            try { await saveAllContent(); alert("Slide Settings Saved!"); }
                                            catch (err) { alert(err.message); }
                                            finally { btn.innerText = originalText; }
                                        }}><Save size={16} /> Save Settings</Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Slider Toggle */}
                                        <div className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-white/10">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Enable Slider Section</h4>
                                                <p className="text-xs text-white/50">Show or hide the entire sliding cards section.</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold uppercase ${slideSettings?.sliderEnabled !== false ? 'text-green-500' : 'text-red-500'}`}>
                                                    {slideSettings?.sliderEnabled !== false ? 'Active' : 'Hidden'}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={slideSettings?.sliderEnabled !== false}
                                                    onChange={e => updateSlideSettings({ sliderEnabled: e.target.checked })}
                                                    className="w-6 h-6 accent-deedox-accent-primary cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Blur Toggle */}
                                        <div className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-white/10">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Enable Blur Effect</h4>
                                                <p className="text-xs text-white/50">Apply a glass-blur to the card images.</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold uppercase ${slideSettings?.blurEnabled !== false ? 'text-blue-400' : 'text-gray-500'}`}>
                                                    {slideSettings?.blurEnabled !== false ? 'Blurred' : 'Clear'}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={slideSettings?.blurEnabled !== false}
                                                    onChange={e => updateSlideSettings({ blurEnabled: e.target.checked })}
                                                    className="w-6 h-6 accent-deedox-accent-primary cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <TableManager
                                    title="Sliding Cards"
                                    data={slideImagesTable}
                                    onAdd={() => slideImagesTable.add({ image_url: '', title: 'New Slide', enabled: true, blur_level: 0, opacity_level: 100, display_order: 0 })}
                                    onUpdate={slideImagesTable.update}
                                    onDelete={slideImagesTable.remove}
                                    fields={[
                                        { label: 'Title', key: 'title', type: 'text' },
                                        { label: 'Display Order', key: 'display_order', type: 'slider', min: 0, max: 20, step: 1, unit: '', default: 0 },
                                        { label: 'Visible', key: 'enabled', type: 'toggle' },
                                        { label: 'Opacity', key: 'opacity_level', type: 'slider', min: 0, max: 100, unit: '%', default: 100 },
                                        { label: 'Blur', key: 'blur_level', type: 'slider', min: 0, max: 20, unit: 'px', default: 0 }
                                    ]}
                                />
                            </div>
                        )}

                        {/* STUDENTS TAB (Co-Founders) */}
                        {activeTab === 'students' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <h2 className="text-2xl font-bold text-white">Student Co-Founders</h2>
                                    <Button variant="primary" className="py-2 text-sm" onClick={() => students.add({ name: "New Student", role: "Role", desc: "Description", tags: [], status: "Business" })}><Plus size={16} /> Add Student</Button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {students.items.map(student => (
                                        <div key={student.id} className="bg-black/20 p-6 rounded-xl border border-white/5 relative group">
                                            <button onClick={() => students.remove(student.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={18} /></button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-start gap-4 md:col-span-2">
                                                    <div className="w-20">
                                                        <ImageUploader label="Profile Pic" value={student.avatarUrl} onChange={v => students.update(student.id, { avatarUrl: v })} />
                                                    </div>
                                                    <div className="flex-grow space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <InputGroup label="Name" value={student.name} onChange={v => students.update(student.id, { name: v })} />
                                                            <InputGroup label="Role / Title" value={student.role} onChange={v => students.update(student.id, { role: v })} />
                                                        </div>
                                                        <InputGroup label="Status (Technical/Business)" value={student.status} onChange={v => students.update(student.id, { status: v })} />
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Bio / Description</label>
                                                    <textarea
                                                        value={student.desc}
                                                        onChange={e => students.update(student.id, { desc: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-deedox-accent-primary outline-none h-20 resize-none"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <InputGroup label="Tags (comma separated)" value={student.tags ? student.tags.join(', ') : ''} onChange={v => students.update(student.id, { tags: v.split(',').map(s => s.trim()) })} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CONTENT TAB */}
                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <h2 className="text-2xl font-bold text-white">Homepage Content</h2>
                                    <Button variant="accent" onClick={async () => {
                                        const btn = document.activeElement;
                                        const originalText = btn.innerText;
                                        btn.innerText = "Saving...";
                                        try {
                                            await saveAllContent();
                                            alert("Success! All Content Synced to Database.");
                                        } catch (e) {
                                            alert("Save Failed: " + e.message);
                                        } finally {
                                            btn.innerText = originalText;
                                        }
                                    }}><Save size={16} /> Save Changes</Button>
                                </div>
                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                    <h3 className="text-lg text-white font-bold">Hero Section</h3>
                                    <InputGroup label="Title Prefix" value={heroContent.titlePrefix} onChange={v => updateHero({ titlePrefix: v })} />
                                    <InputGroup label="Title Highlight (Green)" value={heroContent.titleHighlight} onChange={v => updateHero({ titleHighlight: v })} />
                                    <div className="space-y-1">
                                        <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Subtitle</label>
                                        <textarea
                                            value={heroContent.subtitle}
                                            onChange={e => updateHero({ subtitle: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-deedox-accent-primary outline-none h-24 resize-none"
                                        />
                                    </div>

                                    {/* Hero Background Animation Settings */}
                                    <div className="pt-6 border-t border-white/10">
                                        <h4 className="text-sm font-bold text-white mb-4">Background Animation</h4>

                                        {/* Redirect Note for Hero Images */}
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6 flex items-start gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-full text-blue-400 mt-1">
                                                <ImageIcon size={16} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-blue-400 mb-1">Looking for Background Images?</h5>
                                                <p className="text-xs text-white/70">
                                                    To manage Hero Background Images & Sliders, please use the dedicated
                                                    <button onClick={() => setActiveTab('hero_manager')} className="text-blue-400 hover:text-blue-300 underline mx-1 font-bold">
                                                        Hero Backgrounds
                                                    </button>
                                                    tab in the sidebar.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/10">
                                                <input
                                                    type="checkbox"
                                                    checked={heroSettings.animationEnabled}
                                                    onChange={e => updateHeroSettings({ animationEnabled: e.target.checked })}
                                                    className="w-5 h-5 accent-deedox-accent-primary"
                                                />
                                                <span className="text-sm text-white">Enable Animation</span>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                                                <select
                                                    value={heroSettings.animationSpeed}
                                                    onChange={e => updateHeroSettings({ animationSpeed: e.target.value })}
                                                    className="w-full bg-transparent text-white text-sm outline-none"
                                                >
                                                    <option value="slow">Speed: Slow</option>
                                                    <option value="normal">Speed: Normal</option>
                                                    <option value="fast">Speed: Fast</option>
                                                </select>
                                            </div>

                                            {/* Opacity Control (Visual Clarity) */}
                                            <div className="col-span-2 bg-black/40 p-4 rounded-lg border border-white/10 space-y-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h5 className="text-white text-sm font-bold flex items-center gap-2">
                                                        <Sun size={14} className="text-yellow-500" /> Background Visibility
                                                    </h5>
                                                    <span className="text-xs font-mono text-deedox-accent-primary bg-deedox-accent-primary/10 px-2 py-0.5 rounded">{Math.round((heroSettings.overlayOpacity || 0.5) * 100)}% Dark</span>
                                                </div>

                                                <div className="relative h-2 bg-white/10 rounded-full w-full">
                                                    <input
                                                        type="range"
                                                        min="0.1"
                                                        max="1.0"
                                                        step="0.1"
                                                        value={heroSettings.overlayOpacity !== undefined ? heroSettings.overlayOpacity : 0.5}
                                                        onChange={e => updateHeroSettings({ overlayOpacity: parseFloat(e.target.value) })}
                                                        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div
                                                        className="absolute h-full bg-deedox-accent-primary rounded-full transition-all"
                                                        style={{ width: `${((heroSettings.overlayOpacity || 0.5) - 0.1) / 0.9 * 100}% ` }}
                                                    />
                                                    <div
                                                        className="absolute h-4 w-4 bg-white rounded-full top-1/2 -translate-y-1/2 shadow-lg transition-all"
                                                        style={{ left: `${((heroSettings.overlayOpacity || 0.5) - 0.1) / 0.9 * 100}% `, transform: `translate(-50 %, -50 %)` }}
                                                    />
                                                </div>

                                                <div className="flex justify-between text-[10px] text-white/30 uppercase font-bold pt-1">
                                                    <span>Clear (Visible)</span>
                                                    <span>Deep Black (Dark)</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}


                        {/* DASHBOARD HERO TAB */}
                        {activeTab === 'dashboard_hero' && (<>
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Dashboard Hero Slider</h2>
                                    <p className="text-white/50">Manage the auto-sliding banners on the Student Dashboard. (Approx 3 recommended)</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-end">
                                        <Button variant="primary" onClick={() => dashboardSlidesActions.add({})}>
                                            <Plus size={18} /> Add New Slide
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {(dashboardSlides || []).map((slide) => (
                                            <div key={slide.id || Math.random()} className="bg-black/20 p-6 rounded-xl border border-white/5 relative group">
                                                <button
                                                    onClick={() => dashboardSlidesActions.remove(slide.id)}
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                >
                                                    <Trash size={18} />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Image Column */}
                                                    <div>
                                                        <ImageUploader
                                                            label="Slide Image (1200x600)"
                                                            value={slide.image_url}
                                                            onChange={v => dashboardSlidesActions.update(slide.id, { image_url: v })}
                                                        />
                                                    </div>

                                                    {/* Content Column */}
                                                    <div className="col-span-2 space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <InputGroup
                                                                label="Title"
                                                                value={slide.title}
                                                                onChange={v => dashboardSlidesActions.update(slide.id, { title: v })}
                                                            />
                                                            <div className="flex items-center gap-2 pt-6">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={slide.is_active}
                                                                    onChange={e => dashboardSlidesActions.update(slide.id, { is_active: e.target.checked })}
                                                                    className="w-5 h-5 accent-deedox-accent-primary"
                                                                />
                                                                <span className="text-sm font-bold text-white">Active</span>

                                                                <input
                                                                    type="number"
                                                                    className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-white ml-auto"
                                                                    value={slide.display_order || 0}
                                                                    onChange={e => dashboardSlidesActions.update(slide.id, { display_order: parseInt(e.target.value) })}
                                                                    placeholder="Order"
                                                                />
                                                            </div>
                                                        </div>

                                                        <TextAreaGroup
                                                            label="Description"
                                                            value={slide.description}
                                                            onChange={v => dashboardSlidesActions.update(slide.id, { description: v })}
                                                        />

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <InputGroup
                                                                label="CTA Text"
                                                                value={slide.cta_text}
                                                                onChange={v => dashboardSlidesActions.update(slide.id, { cta_text: v })}
                                                            />
                                                            <InputGroup
                                                                label="CTA Link"
                                                                value={slide.cta_link}
                                                                onChange={v => dashboardSlidesActions.update(slide.id, { cta_link: v })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {(dashboardSlides || []).length === 0 && (
                                            <div className="text-center text-white/30 py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                                No slides found. Click "Add New Slide" to start.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* MISSION & VALUES SECTION (Restored) */}
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 animate-fade-in mt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Target className="text-deedox-accent-primary" /> Mission & Values
                                    </h2>
                                </div>
                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup
                                            label="Mission Title"
                                            value={missionContent.title}
                                            onChange={v => updateMissionContent({ title: v })}
                                        />
                                        <div className="space-y-2">
                                            <label className="text-xs text-deedox-text-muted uppercase font-bold">Mission Image</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={missionContent.imageUrl}
                                                    onChange={e => updateMissionContent({ imageUrl: e.target.value })}
                                                    className="flex-grow bg-black/40 border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-deedox-accent-primary transition-all"
                                                    placeholder="https://..."
                                                />
                                                <button
                                                    onClick={() => window.open(missionContent.imageUrl, '_blank')}
                                                    className="px-3 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-deedox-text-muted uppercase font-bold">Mission Description</label>
                                        <textarea
                                            value={missionContent.description}
                                            onChange={e => updateMissionContent({ description: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-deedox-accent-primary transition-all min-h-[120px]"
                                            placeholder="Describe your mission..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </>)}

                        {/* AI CHAT CONFIG TAB */}
                        {activeTab === 'ai_chat_config' && (
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <MessageSquare className="text-deedox-accent-primary" /> AI Assistant Configuration
                                    </h2>
                                    <Button variant="accent" onClick={handleForceSave}><Save size={16} /> Save Changes</Button>
                                </div>
                                <div className="space-y-6 max-w-2xl">
                                    {/* Name & Visibility */}
                                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                        <h3 className="text-lg text-white font-bold mb-4">Identity & Appearance</h3>
                                        <div className="space-y-4">
                                            <InputGroup
                                                label="Assistant Name (e.g. Startup Coach)"
                                                value={aiChatSettings.assistantName}
                                                onChange={v => updateAiChatSettings({ assistantName: v })}
                                            />
                                            <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/10">
                                                <span className="text-sm text-white font-bold">Show Background Glow</span>
                                                <input
                                                    type="checkbox"
                                                    checked={aiChatSettings.backgroundVisible}
                                                    onChange={e => updateAiChatSettings({ backgroundVisible: e.target.checked })}
                                                    className="w-5 h-5 accent-deedox-accent-primary cursor-pointer"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Glow Intensity</label>
                                                <div className="flex gap-2">
                                                    {['low', 'medium', 'high'].map(level => (
                                                        <button
                                                            key={level}
                                                            onClick={() => setLocalGlobalVisuals({ ...localGlobalVisuals, intensity: level })}
                                                            className={`px - 4 py - 2 rounded - lg text - xs font - bold capitalize transition - all border ${localGlobalVisuals.intensity === level ? 'bg-deedox-accent-primary text-black border-deedox-accent-primary' : 'bg-transparent text-white border-white/20 hover:border-white'} `}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color Customization */}
                                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-6">
                                        <h3 className="text-lg text-white font-bold mb-4">Bubble Colors</h3>
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* User Bubble */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs text-white/50 uppercase font-bold border-b border-white/10 pb-2">User Bubble</h4>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-deedox-text-muted uppercase font-bold">Background</label>
                                                    <div className="flex items-center gap-3">
                                                        <input type="color" value={aiChatSettings.bubbleColorUser || '#70E000'} onChange={e => updateAiChatSettings({ bubbleColorUser: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                                                        <code className="text-xs text-white/50">{aiChatSettings.bubbleColorUser}</code>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-deedox-text-muted uppercase font-bold">Text Color</label>
                                                    <div className="flex items-center gap-3">
                                                        <input type="color" value={aiChatSettings.textColorUser || '#000000'} onChange={e => updateAiChatSettings({ textColorUser: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                                                        <code className="text-xs text-white/50">{aiChatSettings.textColorUser}</code>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Bubble */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs text-white/50 uppercase font-bold border-b border-white/10 pb-2">AI Bubble</h4>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-deedox-text-muted uppercase font-bold">Background</label>
                                                    <div className="flex items-center gap-3">
                                                        <input type="color" value={aiChatSettings.bubbleColorAI || '#ffffff'} onChange={e => updateAiChatSettings({ bubbleColorAI: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                                                        <code className="text-xs text-white/50">{aiChatSettings.bubbleColorAI}</code>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-deedox-text-muted uppercase font-bold">Text Color</label>
                                                    <div className="flex items-center gap-3">
                                                        <input type="color" value={aiChatSettings.textColorAI || '#000000'} onChange={e => updateAiChatSettings({ textColorAI: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                                                        <code className="text-xs text-white/50">{aiChatSettings.textColorAI}</code>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI STUDIO TAB CLOSING TAG WAS HERE, REPLACING THIS ENTIRE IF BLOCK */}
                        {/* AI STUDIO TAB */}
                        {activeTab === 'ai_studio' && (
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Bot className="text-deedox-accent-primary" /> AI Models & Capabilities
                                    </h2>
                                    <Button variant="accent" onClick={handleForceSave}><Save size={16} /> Save Changes</Button>
                                </div>


                                {/* Global API Key Section - ENVIRONMENT VARIABLE NOTICE */}
                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4 mb-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-lg text-white font-bold flex items-center gap-2"><Key size={18} /> Global OpenRouter API Key</h3>
                                            <p className="text-xs text-deedox-text-muted">Security Upgrade: API Keys are now managed via Environment Variables.</p>
                                        </div>
                                        <div className="px-3 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                            SECURE MODE
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20 text-sm text-blue-200">
                                        <p className="font-bold flex items-center gap-2 mb-2">
                                            <Shield size={16} /> Configuration Managed by Server
                                        </p>
                                        <p className="opacity-80">
                                            The AI API Key is loaded securely from the server environment controls.
                                            You do not need to enter it here. This prevents keys from being exposed in the database or unrelated code.
                                        </p>
                                    </div>
                                </div>


                                <div className="space-y-8">
                                    {/* Models Table (MASTER SYSTEM V16) */}
                                    <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 bg-white/5">
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase">Model Name</th>
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase text-center">Type</th>
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase text-center">Master Enable</th>
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase text-center">Main Site</th>
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase text-center">Student Dash</th>
                                                    <th className="p-4 text-xs font-bold text-white/50 uppercase text-center">Default</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {aiModels?.items?.map(model => (
                                                    <tr key={model.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="p-4">
                                                            <div className="font-bold text-white text-sm">{model.display_name}</div>
                                                            <div className="text-[10px] text-white/40 font-mono">{model.model_id}</div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-white/10 text-white/70">
                                                                {model.group_type}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={model.enabled}
                                                                    onChange={e => aiModels.toggleEnabled(model.id, model.enabled)} // Keeps legacy toggle for ENABLED
                                                                    className="w-5 h-5 accent-deedox-accent-primary cursor-pointer"
                                                                    title="Master Enable Switch"
                                                                />
                                                                <span className="text-[9px] text-white/30 font-bold uppercase">Active</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!model.show_on_main_site}
                                                                    disabled={!model.enabled}
                                                                    onChange={e => aiModels.updateModelBoolean(model.id, 'show_on_main_site', e.target.checked)}
                                                                    className="w-4 h-4 accent-blue-500 cursor-pointer disabled:opacity-20"
                                                                />
                                                                <span className="text-[9px] text-white/30 uppercase">Visible</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!model.show_on_student_dashboard}
                                                                    disabled={!model.enabled}
                                                                    onChange={e => aiModels.updateModelBoolean(model.id, 'show_on_student_dashboard', e.target.checked)}
                                                                    className="w-4 h-4 accent-purple-500 cursor-pointer disabled:opacity-20"
                                                                />
                                                                <span className="text-[9px] text-white/30 uppercase">Visible</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <button
                                                                onClick={() => model.enabled && aiModels.setDefault(model.id, model.group_type)}
                                                                disabled={!model.enabled}
                                                                className={`w-4 h-4 rounded-full border flex items-center justify-center mx-auto transition-all ${model.is_default
                                                                    ? 'bg-deedox-accent-primary border-deedox-accent-primary shadow-[0_0_10px_rgba(112,224,0,0.5)]'
                                                                    : 'border-white/20 hover:border-deedox-accent-primary'
                                                                    }`}
                                                                title={`Set as Default for ${model.group_type}`}
                                                            >
                                                                {model.is_default && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-[10px] text-white/30 text-center">Global changes save automatically.</p>

                                    {/* New DB-Driven Capabilities/Buttons Control */}
                                    {
                                        capabilities && capabilities.items && (
                                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-lg text-white font-bold flex items-center gap-2"><Layers size={18} /> Dedicated AI Buttons</h3>
                                                    <button onClick={() => alert("These buttons appear on the Frontend AI Playground.")} className="text-xs text-white/40 hover:text-white underline">What is this?</button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                    {capabilities.items.sort((a, b) => a.label.localeCompare(b.label)).map(cap => (
                                                        <div key={cap.id} className={`p-4 rounded-xl border transition-all ${cap.enabled ? 'bg-deedox-accent-primary/5 border-deedox-accent-primary/20' : 'bg-white/5 border-white/10 opacity-60 grayscale'}`}>
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <h4 className="font-bold text-white text-sm">{cap.label}</h4>
                                                                    <span className="text-[10px] text-white/40 uppercase font-mono">{cap.capability_name.replace('_', ' ')}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={cap.enabled}
                                                                        onChange={e => capabilities.update(cap.capability_name, { enabled: e.target.checked })}
                                                                        className="w-4 h-4 accent-deedox-accent-primary cursor-pointer"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {cap.enabled && (
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] text-deedox-text-muted uppercase font-bold">Default Model</label>
                                                                    <select
                                                                        value={cap.default_model || ''}
                                                                        onChange={e => capabilities.update(cap.capability_name, { default_model: e.target.value })}
                                                                        className="w-full bg-black/40 border border-white/10 px-2 py-1.5 rounded text-xs text-white outline-none focus:border-deedox-accent-primary"
                                                                    >
                                                                        {/* Show only allowed models if unrestricted, or all enabled models */}
                                                                        {aiModels?.items?.filter(m => m.enabled && cap.allowed_models.includes(m.id)).map(m => (
                                                                            <option key={m.id} value={m.id}>{m.model_name}</option>
                                                                        ))}
                                                                        {(!aiModels?.items?.some(m => cap.allowed_models.includes(m.id))) && <option disabled>No allowed models enabled</option>}
                                                                    </select>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }

                                </div >
                            </div >
                        )}



                        {/* SLIDING CARDS TAB (Fixed ID) */}
                        {
                            activeTab === 'slide_manager' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                        <h2 className="text-2xl font-bold text-white">Sliding Cards (Carousel)</h2>
                                        <div className="flex gap-2">
                                            <Button variant="accent" onClick={async (e) => {
                                                const btn = e.currentTarget;
                                                btn.innerText = "Saving...";
                                                await saveAllContent();
                                                const imgCount = carousel?.items?.filter(i => i.image && i.image.length > 5).length || 0;
                                                alert(`Saved ${carousel?.items?.length || 0} Cards(${imgCount} with Images)!`);
                                                btn.innerText = "Save Changes";
                                            }}><Save size={16} /> Save Changes</Button>
                                            <Button variant="primary" className="py-2 text-sm" onClick={() => carousel.add({ text: "New Card", image: "", link: "" })}><Plus size={16} /> Add Card</Button>
                                        </div>
                                    </div>

                                    {/* [NEW] Slider Configuration Controls */}
                                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                        <h3 className="text-lg text-white font-bold flex items-center gap-2">
                                            <Settings size={18} /> Slider Configuration
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Show/Hide Slider */}
                                            <div className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-white/10">
                                                <div>
                                                    <span className="text-white font-bold block">Show Slider Section</span>
                                                    <span className="text-xs text-white/50">Show or hide the entire sliding cards section.</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={slideSettings?.sliderEnabled ?? true}
                                                        onChange={e => updateSlideSettings({ sliderEnabled: e.target.checked })}
                                                        className="w-5 h-5 accent-deedox-accent-primary cursor-pointer"
                                                    />
                                                    <span className={`text-xs font-bold uppercase ${slideSettings?.sliderEnabled ? 'text-deedox-accent-primary' : 'text-white/30'}`}>
                                                        {slideSettings?.sliderEnabled ? 'Visible' : 'Hidden'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Blur Effect */}
                                            <div className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-white/10">
                                                <div>
                                                    <span className="text-white font-bold block">Enable Blur Effect</span>
                                                    <span className="text-xs text-white/50">Apply a glass-blur to the card images.</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={slideSettings?.blurEnabled ?? true}
                                                        onChange={e => updateSlideSettings({ blurEnabled: e.target.checked })}
                                                        className="w-5 h-5 accent-deedox-accent-primary cursor-pointer"
                                                    />
                                                    <span className={`text-xs font-bold uppercase ${slideSettings?.blurEnabled ? 'text-deedox-accent-primary' : 'text-white/30'}`}>
                                                        {slideSettings?.blurEnabled ? 'On' : 'Off'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Carousel Visual Settings */}
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                                        <h4 className="text-sm font-bold text-white mb-4">Visual Settings</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">Image Clarity</label>
                                                <span className="text-xs font-mono text-deedox-accent-primary bg-deedox-accent-primary/10 px-2 py-0.5 rounded">
                                                    {adminConfig?.imageEffects?.find(e => e.section_name === 'carousel_blur')?.clarity ?? 100}%
                                                </span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100" step="5"
                                                value={adminConfig?.imageEffects?.find(e => e.section_name === 'carousel_blur')?.clarity ?? 100}
                                                onChange={e => adminConfig.updateEffect('carousel_blur', { clarity: parseInt(e.target.value) })}
                                                className="w-full accent-deedox-accent-primary h-1 bg-white/10 rounded appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between text-[10px] text-white/30 uppercase font-bold">
                                                <span>Blurred</span>
                                                <span>Sharp</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {carousel?.items?.map(item => (
                                            <div key={item.id} className="bg-black/20 p-4 rounded-xl border border-white/5 relative group flex flex-col md:flex-row gap-6 items-center">
                                                {/* Remove Button (কার্ড ডিলিট বাটন) */}
                                                <button onClick={() => carousel.remove(item.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={18} /></button>

                                                <div className="w-full md:w-1/3">
                                                    {/* Image Upload (ছবি আপলোড) - Cloudinary তে আপলোড হয়ে URL সেভ হবে */}
                                                    <ImageUploader label="Card Background" value={item.image} onChange={v => carousel.update(item.id, { image: v })} />
                                                </div>
                                                <div className="flex-grow w-full space-y-4">
                                                    <InputGroup label="Card Text" value={item.text} onChange={v => carousel.update(item.id, { text: v })} />
                                                    <InputGroup label="Link URL" value={item.link} onChange={v => carousel.update(item.id, { link: v })} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }

                        {/* MISSION TAB */}
                        {
                            activeTab === 'mission' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Mission Section</h2>
                                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                        <h3 className="text-lg text-white font-bold">Main Text</h3>
                                        <InputGroup label="Headline" value={missionContent.headline} onChange={v => updateMission({ headline: v })} />
                                        <InputGroup label="Sub-Headline" value={missionContent.subheadline} onChange={v => updateMission({ subheadline: v })} />
                                        <TextAreaGroup label="Body Text (Markdown supported)" value={missionContent.body} onChange={v => updateMission({ body: v })} />
                                    </div>

                                    <h3 className="text-lg text-white font-bold mt-8 mb-4">Core Values</h3>
                                    <div className="space-y-4">
                                        {missionContent?.values?.map(val => (
                                            <div key={val.id} className="bg-white/5 p-4 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputGroup label="Value Title" value={val.title} onChange={v => {
                                                    const newValues = missionContent.values.map(iv => iv.id === val.id ? { ...iv, title: v } : iv);
                                                    updateMission({ values: newValues });
                                                }} />
                                                <InputGroup label="Value Description" value={val.desc} onChange={v => {
                                                    const newValues = missionContent.values.map(iv => iv.id === val.id ? { ...iv, desc: v } : iv);
                                                    updateMission({ values: newValues });
                                                }} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mission Cards Editor */}
                                    <h3 className="text-lg text-white font-bold mt-8 mb-4">Mission Cards (Images)</h3>
                                    <div className="space-y-6">
                                        <div className="flex gap-2 mb-4">
                                            <Button variant="primary" className="py-2 text-sm" onClick={() => {
                                                const newCard = { id: Date.now(), title: "New Card", subtitle: "Subtitle", description: "", image: "" };
                                                updateMission({ cards: [...(missionContent.cards || []), newCard] });
                                            }}><Plus size={16} /> Add Card</Button>
                                        </div>
                                        {missionContent?.cards?.map(card => (
                                            <div key={card.id} className="bg-black/20 p-6 rounded-xl border border-white/5 relative group flex flex-col md:flex-row gap-6">
                                                <button
                                                    onClick={() => updateMission({ cards: missionContent.cards.filter(c => c.id !== card.id) })}
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash size={18} />
                                                </button>

                                                <div className="w-full md:w-1/3">
                                                    <ImageUploader
                                                        label="Card Background"
                                                        value={card.image}
                                                        onChange={v => {
                                                            const newCards = missionContent.cards.map(c => c.id === card.id ? { ...c, image: v } : c);
                                                            updateMission({ cards: newCards });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-grow w-full space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InputGroup
                                                            label="Title"
                                                            value={card.title}
                                                            onChange={v => {
                                                                const newCards = missionContent.cards.map(c => c.id === card.id ? { ...c, title: v } : c);
                                                                updateMission({ cards: newCards });
                                                            }}
                                                        />
                                                        <InputGroup
                                                            label="Subtitle/Tag"
                                                            value={card.subtitle}
                                                            onChange={v => {
                                                                const newCards = missionContent.cards.map(c => c.id === card.id ? { ...c, subtitle: v } : c);
                                                                updateMission({ cards: newCards });
                                                            }}
                                                        />
                                                    </div>
                                                    <TextAreaGroup
                                                        label="Description"
                                                        value={card.description}
                                                        onChange={v => {
                                                            const newCards = missionContent.cards.map(c => c.id === card.id ? { ...c, description: v } : c);
                                                            updateMission({ cards: newCards });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button variant="accent" onClick={handleForceSave} className="px-8 py-3"><Save size={18} /> Save Changes</Button>
                                    </div>
                                </div>
                            )
                        }


                        {/* PROGRAMS TAB */}
                        {
                            activeTab === 'programs' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                        <h2 className="text-2xl font-bold text-white">Programs</h2>
                                        <Button type="button" variant="primary" className="py-2 text-sm" onClick={() => programs.add({ title: "New Program" })}><Plus size={16} /> Add Program</Button>
                                    </div>
                                    <div className="space-y-4">
                                        {programs?.items?.map(img => (
                                            <div key={img.id} className="bg-black/20 p-6 rounded-xl border border-white/5 relative group">
                                                <button onClick={() => programs.remove(img.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={18} /></button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <InputGroup label="Course Title" value={img.title} onChange={v => programs.update(img.id, { title: v })} />
                                                    <InputGroup label="Instructor" value={img.instructor} onChange={v => programs.update(img.id, { instructor: v })} />
                                                    <InputGroup label="Level" value={img.level} onChange={v => programs.update(img.id, { level: v })} />
                                                    <InputGroup label="Duration" value={img.duration} onChange={v => programs.update(img.id, { duration: v })} />
                                                    <InputGroup label="Status Badge" value={img.status} onChange={v => programs.update(img.id, { status: v })} />
                                                    <ImageUploader label="Course Image" value={img.image} onChange={v => programs.update(img.id, { image: v })} />
                                                    <InputGroup label="Redirect Link URL" value={img.link} onChange={v => programs.update(img.id, { link: v })} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }

                        {/* STUDENTS TAB */}
                        {
                            activeTab === 'students' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Student Management</h2>
                                    <div className="space-y-4">
                                        {students?.items && students.items.length > 0 ? (
                                            students.items.map(student => (
                                                <div key={student.email} className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                                            {student.avatarUrl ? (
                                                                <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-bold">{student.name?.[0]}</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white font-bold text-sm">{student.name}</h4>
                                                            <p className="text-xs text-deedox-text-muted">{student.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text - [10px] font - bold uppercase px - 2 py - 1 rounded ${student.disabled ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'} `}>
                                                            {student.disabled ? 'Disabled' : 'Active'}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            className="py-1 px-3 text-xs"
                                                            onClick={() => students.update(student.email, { disabled: !student.disabled })}
                                                        >
                                                            {student.disabled ? <CheckCircle size={14} /> : <LogOut size={14} />} {student.disabled ? 'Enable' : 'Disable'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-white/30 italic">No registered students yet.</div>
                                        )}
                                    </div>
                                </div>
                            )
                        }

                        {/* [NEW] STUDENTS (GMAIL) TAB */}
                        {
                            activeTab === 'students_gmail' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                        <h2 className="text-2xl font-bold text-white">Students (Gmail Users)</h2>
                                        <Button variant="outline" onClick={fetchGmailUsers} disabled={loadingGmailUsers}>
                                            {loadingGmailUsers ? 'Refreshing...' : 'Refresh List'}
                                        </Button>
                                    </div>
                                    <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-white/10 bg-white/5">
                                                        <th className="p-4 text-xs font-bold text-white/50 uppercase">Email Address</th>
                                                        <th className="p-4 text-xs font-bold text-white/50 uppercase">User ID (UUID)</th>
                                                        <th className="p-4 text-xs font-bold text-white/50 uppercase">Account Created</th>
                                                        <th className="p-4 text-xs font-bold text-white/50 uppercase">Last Login</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loadingGmailUsers ? (
                                                        <tr>
                                                            <td colSpan="4" className="p-8 text-center text-white/30 italic">Loading users...</td>
                                                        </tr>
                                                    ) : gmailUsers.length > 0 ? (
                                                        gmailUsers.map(user => (
                                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                                <td className="p-4 text-white font-medium text-sm">
                                                                    {user.email}
                                                                </td>
                                                                <td className="p-4 text-xs text-white/40 font-mono">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{user.id}</span>
                                                                        <button
                                                                            onClick={() => navigator.clipboard.writeText(user.id)}
                                                                            className="hover:text-deedox-accent-primary"
                                                                            title="Copy UUID"
                                                                        >
                                                                            <Layers size={12} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-xs text-white/60">
                                                                    {new Date(user.created_at).toLocaleDateString()} <span className="text-white/30">{new Date(user.created_at).toLocaleTimeString()}</span>
                                                                </td>
                                                                <td className="p-4 text-xs text-white/60">
                                                                    {user.last_sign_in_at ? (
                                                                        <>
                                                                            {new Date(user.last_sign_in_at).toLocaleDateString()} <span className="text-white/30">{new Date(user.last_sign_in_at).toLocaleTimeString()}</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-white/20 italic">Never</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="p-8 text-center text-white/30 italic">No Gmail users found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="text-xs text-white/30 text-center">
                                        Showing {gmailUsers.length} users (Sourced from Supabase Auth)
                                    </div>
                                </div>
                            )
                        }

                        {
                            activeTab === 'resources' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                        <h2 className="text-2xl font-bold text-white">Resources</h2>
                                        <Button variant="primary" className="py-2 text-sm" onClick={() => resources.add({ title: "New Resource" })}><Plus size={16} /> Add Resource</Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {resources?.items?.map(res => (
                                            <div key={res.id} className="bg-black/20 p-6 rounded-xl border border-white/5 relative group">
                                                <button onClick={() => resources.remove(res.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={18} /></button>
                                                <div className="space-y-4">
                                                    <InputGroup label="Resource Title" value={res.title} onChange={v => resources.update(res.id, { title: v })} />
                                                    <InputGroup label="Type (e.g. PDF)" value={res.type} onChange={v => resources.update(res.id, { type: v })} />
                                                    <ImageUploader label="Book Cover" value={res.image} onChange={v => resources.update(res.id, { image: v })} />
                                                    <InputGroup label="Download Link URL" value={res.link} onChange={v => resources.update(res.id, { link: v })} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }

                        {/* SOCIALS TAB */}
                        {
                            activeTab === 'socials' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                        <h2 className="text-2xl font-bold text-white">Social & Contacts</h2>
                                        <Button variant="accent" onClick={handleForceSave}><Save size={16} /> Save Changes</Button>
                                    </div>
                                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                        <h3 className="text-lg text-white font-bold flex items-center gap-2"><LinkIcon size={18} /> Social Links</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup label="Facebook URL" value={socials.facebook} onChange={v => updateSocials({ facebook: v })} />
                                            <InputGroup label="Twitter URL" value={socials.twitter} onChange={v => updateSocials({ twitter: v })} />
                                            <InputGroup label="Instagram URL" value={socials.instagram} onChange={v => updateSocials({ instagram: v })} />
                                            <InputGroup label="LinkedIn URL" value={socials.linkedin} onChange={v => updateSocials({ linkedin: v })} />
                                        </div>
                                    </div>

                                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                        <h3 className="text-lg text-white font-bold flex items-center gap-2"><Globe size={18} /> Contact Info</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup label="Contact Email" value={socials.contactEmail} onChange={v => updateSocials({ contactEmail: v })} />
                                            <InputGroup label="Phone Number" value={socials.contactPhone} onChange={v => updateSocials({ contactPhone: v })} />
                                            <div className="md:col-span-2">
                                                <InputGroup label="Physical Address" value={socials.address} onChange={v => updateSocials({ address: v })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-deedox-accent-primary/5 p-6 rounded-xl border border-deedox-accent-primary/20 space-y-4">
                                        <h3 className="text-lg text-white font-bold">WhatsApp Configuration</h3>
                                        <InputGroup label="WhatsApp Number (Format: 92300...)" value={socials.whatsapp} onChange={v => updateSocials({ whatsapp: v })} />
                                        <p className="text-xs text-deedox-text-muted">This number will receive messages from the 'Emrul Community' floating widget.</p>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button variant="accent" onClick={handleForceSave} className="px-8 py-3"><Save size={18} /> Save All Changes</Button>
                                    </div>
                                </div>
                            )
                        }

                        {/* TESTIMONIALS TAB */}
                        {activeTab === 'testimonials' && (
                            <TableManager
                                title="Student Stories (Testimonials)"
                                data={testimonials}
                                onAdd={() => testimonials.add({ name: 'Student Name', role: 'Role/Founder', text: 'Their success story...' })}
                                onUpdate={testimonials.update}
                                onDelete={testimonials.remove}
                                fields={[
                                    { key: 'name', label: 'Name', type: 'text' },
                                    { key: 'role', label: 'Role', type: 'text' },
                                    { key: 'video_url', label: 'Video Link (Optional)', type: 'text' },
                                    { key: 'quote', label: 'Story / Quote', type: 'textarea' }
                                ]}
                            />
                        )}

                    </div >
                </div >
            </div >
        </div >
    );
};

export default Admin;
