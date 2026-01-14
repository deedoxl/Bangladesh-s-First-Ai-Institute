import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load .env file
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envLocalPath)) {
    console.log("Loading .env.local...");
    dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
    console.log("Loading .env...");
    dotenv.config({ path: envPath });
} else {
    console.warn("⚠️ No .env file found. Trying process.env...");
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need Service Role for creating buckets usually, or at least Admin rights

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("❌ Missing Credentials. VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env");
    console.log("Cannot auto-create bucket without Service Key.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function createBucket() {
    console.log(`Connecting to ${SUPABASE_URL}...`);

    // 1. Create Bucket
    const { data, error } = await supabase
        .storage
        .createBucket('uploads', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            fileSizeLimit: 1048576 * 5 // 5MB
        });

    if (error) {
        if (error.message.includes("already exists")) {
            console.log("✅ Bucket 'uploads' already exists.");
            // Try to update public just in case? API doesn't allow easy updatePublic via JS client always, 
            // but usually create is enough.
        } else {
            console.error("❌ Failed to create bucket:", error);
            process.exit(1);
        }
    } else {
        console.log("✅ Bucket 'uploads' created successfully!");
    }

    // 2. We should also ensure Policies exist, but JS Client CreateBucket usually just makes the bucket. 
    // RLS policies for objects might still be needed if not Public? 
    // 'public: true' allows Public Reads (GET). 
    // We definitely need a policy for 'INSERT' (Uploads) for Authenticated users.
    // The JS SDK doesn't manage SQL Policies.

    console.log("\n⚠️ IMPORTANT: Bucket created, but you might still need Storage Policies for Uploading.");
    console.log("If upload fails, please run the SQL provided solely for Policies.");
}

createBucket();
