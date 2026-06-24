import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateModels() {
    console.log("Updating AI Model Names...");

    const updates = [
        { old: 'Llama 3.1 70B (Smart)', new: 'DEEDOX Ll 3.1 70B (Smart)' },
        { old: 'Mistral 7B', new: 'DEEDOX Mi 7B (Fast)' }
    ];

    for (const update of updates) {
        console.log(`Finding model: "${update.old}"...`);

        // 1. Find the model
        const { data: models, error: findError } = await supabase
            .from('ai_models')
            .select('*')
            .eq('display_name', update.old);

        if (findError) {
            console.error(`Error finding model "${update.old}":`, findError.message);
            continue;
        }

        if (!models || models.length === 0) {
            console.warn(`Model "${update.old}" not found. Skipping.`);
            continue;
        }

        // 2. Update the model
        for (const model of models) {
            const { error: updateError } = await supabase
                .from('ai_models')
                .update({ display_name: update.new })
                .eq('id', model.id);

            if (updateError) {
                console.error(`Error updating model ${model.id}:`, updateError.message);
            } else {
                console.log(`✅ Updated "${update.old}" to "${update.new}" (ID: ${model.id})`);
            }
        }
    }
}

updateModels();
