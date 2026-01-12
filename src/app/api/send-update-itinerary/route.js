import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
    const { bookingId } = await request.json();

    const { data: res } = await supabase
        .from('reservations')
        .select('*, guests(*)')
        .eq('id', bookingId)
        .single();

    const emailTemplate = `
        <h3>Update Jadwal Kegiatan Anda</h3>
        <p>Halo ${res.guests.first_name}, terdapat perubahan pada jadwal kegiatan paket Anda:</p>
        <ul>
            ${res.itinerary.map(i => `<li><strong>Hari ${i.day}:</strong> ${i.activities}</li>`).join('')}
        </ul>
        <p>Sampai jumpa di The Dukuh Retreat!</p>
    `;

    await sendEmail(res.guests.email, "Pembaruan Jadwal Kegiatan", emailTemplate);
    return NextResponse.json({ success: true });
}