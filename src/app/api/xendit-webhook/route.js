import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const body = await request.json();
        console.log("📩 Webhook Received:", body);

        if (body.status === 'PAID') {
            const bookingId = body.external_id;

            // Update status di Supabase berdasarkan external_id
            const { error } = await supabase
                .from('reservations')
                .update({ payment_status: 'CONFIRMED' }) // Change to CONFIRMED
                .eq('external_id', bookingId);

            if (error) console.error("❌ DB Update Error:", error);
            else console.log(`✅ Payment confirmed for: ${bookingId}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}