import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
    try {
        const body = await request.json();
        const bookingId = body.external_id;

        if (body.status === 'PAID') {
            // 1. Update status ke CONFIRMED dan ambil data lengkap (relasi ke tamu)
            const { data: res, error } = await supabase
                .from('reservations')
                .update({ payment_status: 'CONFIRMED' })
                .eq('external_id', bookingId)
                .select('*, guests(*)')
                .single();

            if (error) throw error;

            // 2. Logika Jadwal (Hanya jika booking memiliki package_name)
            let sectionJadwal = "";
            if (res.package_name && res.itinerary && Array.isArray(res.itinerary)) {
                sectionJadwal = `
                    <div style="margin-top: 25px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <h3 style="color: #4f46e5; margin-top: 0;">🗓️ Jadwal Kegiatan Paket: ${res.package_name}</h3>
                        <table width="100%" style="border-collapse: collapse; font-size: 14px;">
                            ${res.itinerary.map(item => `
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 80px;">Hari ${item.day}</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${item.activities}</td>
                                </tr>
                            `).join('')}
                        </table>
                        <p style="font-size: 12px; color: #64748b; margin-top: 10px;">*Jadwal dapat berubah sewaktu-waktu sesuai koordinasi dengan admin.</p>
                    </div>
                `;
            }

            // 3. Template HTML Struk/Nota
            const htmlEmail = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 25px; color: #1e293b;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #10b981; margin: 0;">KONFIRMASI PEMBAYARAN</h2>
                        <p style="color: #64748b;">Booking ID: #${res.external_id}</p>
                    </div>
                    
                    <p>Halo <b>${res.guests.first_name} ${res.guests.last_name}</b>,</p>
                    <p>Pembayaran Anda telah kami terima. Berikut adalah rincian pesanan Anda:</p>
                    
                    <table width="100%" style="margin: 20px 0; font-size: 14px;">
                        <tr><td style="color: #64748b;">Item</td><td style="text-align: right; font-weight: bold;">${res.room_name}</td></tr>
                        <tr><td style="color: #64748b;">Check-in</td><td style="text-align: right; font-weight: bold;">${res.check_in}</td></tr>
                        <tr><td style="color: #64748b;">Total Bayar</td><td style="text-align: right; color: #10b981; font-weight: bold; font-size: 16px;">
                            Rp ${new Intl.NumberFormat('id-ID').format(res.total_amount)}
                        </td></tr>
                    </table>

                    ${sectionJadwal}

                    <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">
                        <p>The Dukuh Retreat - Wellness & Healing Resort</p>
                        <p>Bali, Indonesia</p>
                    </div>
                </div>
            `;

            // 4. Kirim Email ke User
            await sendEmail(res.guests.email, `Struk Pembayaran - ${res.external_id}`, htmlEmail);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}