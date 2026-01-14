"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type DataContextType = {
    heroContent: any;
    updateHero: (n: any) => void;
    heroImages: any;
    heroSettings: any;
    updateHeroSettings: (n: any) => void;
    missionContent: any;
    updateMission: (n: any) => void;
    programs: any;
    resources: any;
    testimonials: any;
    carousel: any;
    courses: any[];
    notices: any[];
    users: any[];
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const supabase = createClient();

    // --- Dynamic Data from Supabase ---
    const [courses, setCourses] = useState<any[]>([]);
    const [notices, setNotices] = useState<any[]>([]);
    const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);

    // --- Settings State (from site_settings table) ---
    // Initialize with default/fallback values to prevent crashes before fetch
    const [settingsState, setSettingsState] = useState<any>({
        hero_content: { titlePrefix: "Asia’s First", titleHighlight: "AI Startup Institute", subtitle: "Learn AI..." },
        hero_images: { items: [] },
        hero_settings: { animationSpeed: 'normal', animationEnabled: true, overlayOpacity: 0.7 },
        mission_content: { headline: "Our Mission", subheadline: "Building Founders", body: "...", values: [] },
        carousel: { items: [] },
        resources: { items: [] },
        testimonials: { items: [] },
        // ... add others if needed
    });

    // --- Fetch All Data ---
    const fetchData = async () => {
        try {
            // 1. Settings (Key-Value Store)
            const { data: settingsData } = await supabase.from('site_settings').select('*');
            if (settingsData) {
                const newSettings: any = {};
                settingsData.forEach((row: any) => {
                    newSettings[row.key] = row.value;
                });
                setSettingsState((prev: any) => ({ ...prev, ...newSettings }));
            }

            // 2. Courses
            const { data: coursesData } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
            if (coursesData) setCourses(coursesData);

            // 3. Notices
            const { data: noticesData } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
            if (noticesData) setNotices(noticesData);

            // 4. Testimonials (Table)
            const { data: testData } = await supabase.from('testimonials').select('*');
            if (testData) setDbTestimonials(testData);

        } catch (e) {
            console.error("Error fetching data:", e);
        }
    };

    useEffect(() => {
        fetchData();

        // --- Realtime Subscriptions ---
        const channels = supabase.channel('admin-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, fetchData)
            .subscribe();

        return () => {
            supabase.removeChannel(channels);
        };
    }, []);

    // --- Update Helpers ---
    // Generic updater for site_settings table
    const updateSiteSetting = async (key: string, newValue: any) => {
        // Optimistic update
        setSettingsState((prev: any) => ({ ...prev, [key]: newValue }));

        // DB update
        const { error } = await supabase.from('site_settings').upsert({ key, value: newValue });
        if (error) {
            console.error(`Error updating ${key}:`, error);
            // Revert or notify (omitted for brevity)
        }
    };

    // Specific updaters matching the Context interface expected by consumers
    const updateHero = (n: any) => updateSiteSetting('hero_content', { ...settingsState.hero_content, ...n });
    const updateHeroSettings = (n: any) => updateSiteSetting('hero_settings', { ...settingsState.hero_settings, ...n });
    const updateMission = (n: any) => updateSiteSetting('mission_content', { ...settingsState.mission_content, ...n });

    // For arrays (Hero Images, Carousel, etc.), we need to handle full replacement or granular updates.
    // The previous implementation exposed `heroImages` as an object with `items` and CRUD methods.
    // We'll mimic that structure.

    const createArrayCrud = (key: string) => {
        const currentItems = settingsState[key]?.items || [];
        return {
            items: currentItems,
            add: (item: any) => {
                const newItems = [...currentItems, { ...item, id: Date.now() }];
                updateSiteSetting(key, { items: newItems });
            },
            update: (id: any, updates: any) => {
                const newItems = currentItems.map((i: any) => i.id === id ? { ...i, ...updates } : i);
                updateSiteSetting(key, { items: newItems });
            },
            remove: (id: any) => {
                const newItems = currentItems.filter((i: any) => i.id !== id);
                updateSiteSetting(key, { items: newItems });
            }
        };
    };

    // --- Mapped Data for Consuming Components ---

    // Map Courses to ensure shape matches what UI expects
    const programs = {
        items: courses.map(c => ({
            id: c.id,
            title: c.title,
            image: c.image_url,
            instructor: c.instructor_name,
            duration: c.duration,
            level: c.level || 'Beginner',
            status: c.status || (c.is_published ? 'Active' : 'Draft'),
            link: c.link || '#'
        }))
    };

    // Combined Testimonials (DB + potentially setting-based ones if they were migrated, but logic here prefers DB table)
    // If we moved testimonials to `site_settings` as 'testimonials' key, we use that. 
    // If we use the 'testimonials' TABLE, we use `dbTestimonials`.
    // Let's use `site_settings` for now as per the plan, or support both.
    // The user instruction said "site_settings table... testimonials key".
    // But `dbTestimonials` fetches from a table 'testimonials'.
    // I will prioritize `site_settings` testimonials if available, else DB table.
    const testimonialsList = settingsState.testimonials?.items?.length > 0
        ? settingsState.testimonials.items
        : dbTestimonials;

    const testimonialsCrud = createArrayCrud('testimonials');
    const testimonials = {
        ...testimonialsCrud,
        items: testimonialsList
    };

    return (
        <DataContext.Provider value={{
            heroContent: settingsState.hero_content,
            updateHero, // Add this to interface

            heroImages: createArrayCrud('hero_images'),

            heroSettings: settingsState.hero_settings,
            updateHeroSettings, // Add to interface

            missionContent: settingsState.mission_content,
            updateMission, // Add to interface

            carousel: createArrayCrud('carousel'),

            resources: createArrayCrud('resources'), // assuming resources are also in settings OR table. 
            // Note: Public site treats resources as a TABLE. Admin context seems to treat it as settings in previous code?
            // Previous code: `const [resources] = useState(...)`. So it was local state.
            // I'll keep it as site_settings for now to match "Move ALL locally stored data".

            programs,
            testimonials,

            courses,
            notices,
            users: [],
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
