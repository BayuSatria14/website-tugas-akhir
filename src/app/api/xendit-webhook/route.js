import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
    try {
        const body = await request.json();
        const bookingId = body.external_id;

        if (body.status === 'PAID') {
            // 1. Update status
            const { data: reservation, error } = await supabase
                .from('reservations')
                .update({ payment_status: 'CONFIRMED' })
                .eq('external_id', bookingId)
                .select('*, guests(*)').single();

            if (error) throw error;

            // 2. Generate HTML Struk
            const isPackage = reservation.package_name !== null;
            let itineraryHtml = "";

            if (isPackage && reservation.itinerary) {
                itineraryHtml = `
                    <h3>Jadwal Kegiatan:</h3>
                    <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
                        <tr style="background: #f4f4f4;"><th>Hari</th><th>Aktivitas</th></tr>
                        ${reservation.itinerary.map(item => `
                            <tr><td>Hari ${item.day}</td><td>${item.activities}</td></tr>
                        `).join('')}
                    </table>
                `;
            }

            const emailTemplate = `
                <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #ddd; padding: 20px;">
                    <h2 style="color: #4f46e5;">THE DUKUH RETREAT - RECEIPT</h2>
                    <p>Terima kasih, pembayaran Anda telah berhasil dikonfirmasi.</p>
                    <hr/>
                    <p><strong>Booking ID:</strong> ${reservation.external_id}</p>
                    <p><strong>Nama:</strong> ${reservation.guests.first_name} ${reservation.guests.last_name}</p>
                    <p><strong>Tipe:</strong> ${isPackage ? "Wellness Package" : "Room Only"}</p>
                    <p><strong>Item:</strong> ${reservation.room_name}</p>
                    <p><strong>Check-in:</strong> ${reservation.check_in}</p>
                    <p><strong>Check-out:</strong> ${reservation.check_out}</p>
                    <h3 style="color: #10b981;">Total: Rp ${reservation.total_amount.toLocaleString('id-ID')}</h3>
                    <hr/>
                    ${itineraryHtml}
                    <p style="font-size: 12px; color: #777;">Struk ini adalah bukti pembayaran sah.</p>
                </div>
            `;

            // 3. Kirim Email
            await sendEmail(reservation.guests.email, "Bukti Pembayaran - The Dukuh Retreat", emailTemplate);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}