import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
    try {
        const body = await request.json();
        const bookingId = body.external_id;

        if (body.status === 'PAID') {
            // Nilai default dari body webhook (jika dipanggil langsung oleh Xendit production)
            let paymentChannel = body.payment_channel;
            let paymentMethod = body.payment_method;

            // Failsafe & Sinkronisasi Uji Coba: Jika data kurang (seperti saat simulasi localhost),
            // atau untuk memastikan akurasi data langsung dari Xendit, query ke API Xendit.
            const XENDIT_API_KEY = process.env.XENDIT_API_KEY || process.env.XENDIT_SECRET_KEY;
            if (XENDIT_API_KEY && bookingId) {
                try {
                    const authHeader = Buffer.from(`${XENDIT_API_KEY}:`).toString('base64');
                    const xenditRes = await fetch(`https://api.xendit.co/v2/invoices?external_id=${bookingId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Basic ${authHeader}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const invoices = await xenditRes.json();
                    if (Array.isArray(invoices) && invoices.length > 0) {
                        const invoice = invoices[0];
                        if (invoice.payment_channel) paymentChannel = invoice.payment_channel;
                        if (invoice.payment_method) paymentMethod = invoice.payment_method;
                        console.log("Berhasil sinkronisasi data transaksi asli dari Xendit:", { paymentChannel, paymentMethod });
                    }
                } catch (err) {
                    console.error("Gagal sinkronisasi data dari API Xendit:", err);
                }
            }

            // Gabungkan saluran/metode pembayaran
            const xenditPaymentMethod = paymentChannel || paymentMethod || 'XENDIT';
            const formattedPaymentMethod = xenditPaymentMethod.replace(/_/g, ' ').toUpperCase();

            // 1. Update status ke CONFIRMED, update payment_method, dan ambil data lengkap
            const { data: res, error } = await supabase
                .from('reservations')
                .update({
                    payment_status: 'CONFIRMED',
                    payment_method: formattedPaymentMethod
                })
                .eq('external_id', bookingId)
                .select('*, guests(*)')
                .single();

            if (error) throw error;

            // 2. Template HTML Struk/Nota
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
                        <tr><td style="color: #64748b;">Metode Pembayaran</td><td style="text-align: right; font-weight: bold;">${res.payment_method}</td></tr>
                        <tr><td style="color: #64748b;">Total Bayar</td><td style="text-align: right; color: #000000ff; font-weight: bold; font-size: 16px;">
                            Rp ${new Intl.NumberFormat('id-ID').format(res.total_amount)}
                        </td></tr>
                    </table>

                    ${res.package_name && res.itinerary && Array.isArray(res.itinerary) ? `
                    <div style="margin-top: 30px; border-top: 2px solid #e2e8f0; padding-top: 20px;">
                        <h3 style="color: #4f46e5; margin: 0 0 10px 0;">📋 Jadwal Kegiatan Paket: ${res.package_name}</h3>
                        <table width="100%" cellpadding="10" style="margin: 15px 0; font-size: 14px; border-collapse: collapse; border: 1px solid #ddd;">
                            <tr style="background: #f8fafc;">
                                <th style="border: 1px solid #ddd; text-align: center; width: 80px;">Hari</th>
                                <th style="border: 1px solid #ddd; text-align: left;">Aktivitas</th>
                            </tr>
                            ${res.itinerary.map(item => `
                                <tr>
                                    <td style="border: 1px solid #ddd; text-align: center; font-weight: bold;">Hari ${item.day}</td>
                                    <td style="border: 1px solid #ddd;">${item.activities}</td>
                                </tr>
                            `).join('')}
                        </table>
                        <p style="font-size: 12px; color: #94a3b8; font-style: italic;">*Jadwal dapat berubah sewaktu-waktu sesuai koordinasi dengan admin.</p>
                    </div>
                    ` : ''}

                    <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">
                        <p>The Dukuh Retreat - Wellness & Healing Resort</p>
                        <p>Bali, Indonesia</p>
                    </div>
                </div>
            `;

            // 3. Kirim Email ke User
            await sendEmail(res.guests.email, `Struk Pembayaran - ${res.external_id}`, htmlEmail);

            // 4. Kirim Email Notifikasi ke Admin
            const adminEmail = process.env.EMAIL_USER || 'satriamaryana15@gmail.com';
            const htmlAdminEmail = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 25px; color: #1e293b;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #4f46e5; margin: 0;">NOTIFIKASI BOOKING BARU</h2>
                        <p style="color: #64748b;">Booking ID: #${res.external_id}</p>
                    </div>
                    
                    <p>Halo <b>Admin</b>,</p>
                    <p>Terdapat reservasi baru yang telah berhasil dibayar (CONFIRMED). Berikut rinciannya:</p>
                    
                    <table width="100%" cellpadding="8" style="margin: 20px 0; font-size: 14px; border-collapse: collapse; border: 1px solid #ddd;">
                        <tr><td style="border: 1px solid #ddd; color: #64748b;">Nama Tamu</td><td style="border: 1px solid #ddd; font-weight: bold;">${res.guests.first_name} ${res.guests.last_name}</td></tr>
                        <tr><td style="border: 1px solid #ddd; color: #64748b;">Email Tamu</td><td style="border: 1px solid #ddd;">${res.guests.email}</td></tr>
                        <tr><td style="border: 1px solid #ddd; color: #64748b;">Telepon Tamu</td><td style="border: 1px solid #ddd;">${res.guests.phone || '-'}</td></tr>
                        <tr><td style="border: 1px solid #ddd; color: #64748b;">Kamar</td><td style="border: 1px solid #ddd; font-weight: bold;">${res.room_name}</td></tr>
                        <tr><td style="border: 1px solid #ddd; color: #64748b;">Paket</td><td style="border: 1px solid #ddd; font-weight: bold;">${res.package_name || '-'}</td></tr>
                        <tr><td style="border: 1px solid #ddd; color: #64748b;">Check-in</td><td style="border: 1px solid #ddd; font-weight: bold;">${res.check_in}</td></tr>
                        <tr><td style="border: 1px solid #ddd; color: #64748b;">Check-out</td><td style="border: 1px solid #ddd; font-weight: bold;">${res.check_out}</td></tr>
                        <tr><td style="border: 1px solid #ddd; color: #64748b;">Metode Pembayaran</td><td style="border: 1px solid #ddd;">${res.payment_method}</td></tr>
                        <tr><td style="border: 1px solid #ddd; color: #64748b;">Total Bayar</td><td style="border: 1px solid #ddd; color: #10b981; font-weight: bold; font-size: 16px;">
                            Rp ${new Intl.NumberFormat('id-ID').format(res.total_amount)}
                        </td></tr>
                    </table>

                    <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">
                        <p>Sistem Reservasi The Dukuh Retreat</p>
                    </div>
                </div>            `;
            await sendEmail(adminEmail, `[NEW BOOKING] ${res.external_id} - ${res.guests.first_name}`, htmlAdminEmail);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}