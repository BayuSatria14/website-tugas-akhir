import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Determine if we are on the server or client
const isServer = typeof window === 'undefined';

let client;

if (isServer) {
    // Server: Use Service Role Key for admin tasks (bypass RLS)
    // This maintains compatibility for API routes like create-invoice
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or Service Role Key is missing on server!');
    }
    client = createClient(supabaseUrl, supabaseKey);
} else {
    // Client: Use Browser Client to ensure cookies are set for Middleware
    // This allows the middleware to detect the session
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or Anon Key is missing on client!');
    }
    client = createBrowserClient(supabaseUrl, supabaseKey);
}

export const supabase = client;