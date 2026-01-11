import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Determine if we are on the server or client
const isServer = typeof window === 'undefined';

// Use Service Role Key on server (for admin/bypass RLS), Anon Key on client
const supabaseKey = isServer
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing!', { supabaseUrl, isServer });
}

export const supabase = createClient(supabaseUrl, supabaseKey);