import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'all';

        let query = supabase.from('reservations').select('*, guests(*)');

        if (filter === 'confirmed') {
            query = query.or('payment_status.eq.CONFIRMED,payment_status.eq.PAID');
        } else if (filter === 'package_confirmed') {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            query = query
                .not('package_name', 'is', null)
                .gte('check_out', today)
                .or('payment_status.eq.CONFIRMED,payment_status.eq.PAID')
                .order('check_in', { ascending: true });
        } else if (filter === 'recent_all') {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            query = query
                .gte('check_out', today)
                .order('created_at', { ascending: false });
        } else if (filter === 'active') {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            query = query
                .gte('check_out', today)
                .or('payment_status.eq.CONFIRMED,payment_status.eq.PAID');
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Admin API Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
