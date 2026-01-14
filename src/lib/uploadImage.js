import { supabase } from './supabaseClient';

export const uploadToCloudinary = async (file) => {
    // NOTE: Function name kept as 'uploadToCloudinary' to avoid breaking imports in Admin.jsx / Helpers
    // BUT internally now uses Supabase Storage.

    try {
        if (!file) throw new Error("No file selected");

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. Upload to Supabase 'images' bucket
        // Ensure you have a bucket named 'images' set to public
        const { data, error } = await supabase.storage
            .from('images') // Bucket name
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            // Check if bucket exists error
            console.error("Supabase Storage Error:", error);
            if (error.message.includes("Bucket not found")) {
                throw new Error("Bucket 'images' not found in Supabase. Please run the SQL script v61.");
            }
            throw error;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        console.log("Image Uploaded:", publicUrl);
        return publicUrl;
    } catch (error) {
        console.error("Upload Error:", error);
        alert("Upload Failed: " + error.message);
        throw error;
    }
};
