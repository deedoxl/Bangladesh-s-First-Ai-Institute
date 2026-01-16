-- Migration: Sync Allowed AI Models
-- Date: 2026-01-16
-- Description: Enforces strict list of free/stable models by resetting the ai_models table.
DELETE FROM ai_models;
-- 2. Insert Approved Models
INSERT INTO ai_models (
        id,
        model_id,
        display_name,
        group_type,
        enabled,
        is_default,
        order_index,
        show_on_main_site,
        show_on_student_dashboard
    )
VALUES -- DeepSeek (Top Tier Coding/Chat)
    (
        gen_random_uuid(),
        'deepseek-ai/deepseek-chat-v3',
        'DeepSeek V3 (Chat)',
        'chat',
        true,
        true,
        1,
        true,
        true
    ),
    (
        gen_random_uuid(),
        'deepseek-ai/deepseek-coder-6.7b',
        'DeepSeek Coder',
        'coding',
        true,
        true,
        2,
        true,
        true
    ),
    -- Qwen (Great All-rounder)
    (
        gen_random_uuid(),
        'qwen/qwen-2.5-7b-instruct',
        'Qwen 2.5 7B (Instruct)',
        'chat',
        true,
        false,
        3,
        true,
        true
    ),
    (
        gen_random_uuid(),
        'qwen/qwen-2.5-coder-7b',
        'Qwen 2.5 Coder',
        'coding',
        true,
        false,
        4,
        true,
        true
    ),
    -- Meta Llama 3.1
    (
        gen_random_uuid(),
        'meta-llama/llama-3.1-70b-instruct',
        'Llama 3.1 70B (Smart)',
        'chat',
        true,
        false,
        5,
        true,
        true
    ),
    (
        gen_random_uuid(),
        'meta-llama/llama-3.1-8b-instruct',
        'Llama 3.1 8B (Fast)',
        'chat',
        true,
        false,
        6,
        true,
        true
    ),
    -- Mistral & Others
    (
        gen_random_uuid(),
        'mistralai/mistral-7b-instruct',
        'Mistral 7B',
        'chat',
        true,
        false,
        7,
        true,
        true
    ),
    (
        gen_random_uuid(),
        'google/gemma-7b-it',
        'Gemma 7B',
        'chat',
        true,
        false,
        8,
        true,
        true
    ),
    (
        gen_random_uuid(),
        'nousresearch/nous-hermes-2-mixtral-8x7b',
        'Hermes 2 Mixtral',
        'roleplay',
        true,
        false,
        9,
        true,
        true
    ),
    (
        gen_random_uuid(),
        'openchat/openchat-3.5',
        'OpenChat 3.5',
        'chat',
        true,
        false,
        10,
        true,
        true
    );
-- 3. Verify
SELECT model_id,
    enabled
FROM ai_models;