# AI System Upgrade: Single Global API Key

I have successfully refactored the AI system to strictly use a **Single OpenRouter API Key** for all models. This eliminates the per-model key issues and ensures secure, encrypted storage.

## 1. Database Migration (REQUIRED)
You must run the SQL migration to create the new tables and secure functions.

1.  Open your **Supabase Dashboard**.
2.  Go to the **SQL Editor**.
3.  Copy and Paste the content of the file:
    `platform/final_ai_fix_v13.sql`
4.  Click **Run**.

**What this does:**
*   Creates `ai_provider_settings` (Stores the ONE encrypted key).
*   Creates `ai_models` (Stores strictly valid model IDs, NO keys).
*   Creates strict RPC functions (`save_provider_key`, `get_decrypted_provider_key`) to handle encryption.
*   Seeds the database with the official list of OpenRouter models.

## 2. Frontend Verifications
Once the SQL is run:
1.  Go to your **Admin Panel > AI Studio**.
2.  You will see a new **"Global OpenRouter API Key"** section at the top.
3.  The status should say **"Key Missing"** (Red).
4.  Enter your `sk-or-...` key and click **"Save Securely"**.
5.  The status should change to **"System Active"** (Green).
6.  The table below now only shows "Enabled" and "Default" toggles. **No API key fields in the table.**

## 3. Backend Verification
The Supabase Edge Function (`chat-proxy`) has been updated to:
1.  Fetch the single global key from the database using the secure RPC.
2.  Validate that the requested `modelId` exists in the `ai_models` table and is `enabled = true`.
3.  If a model is disabled in Admin, the backend will **reject** the request, preventing misuse.

## Files Changed
*   `platform/final_ai_fix_v13.sql` (New Migration)
*   `src/context/DataContext.jsx` (Updated logic)
*   `src/pages/Admin.jsx` (New UI)
*   `supabase/functions/chat-proxy/index.ts` (Secured Backend)
