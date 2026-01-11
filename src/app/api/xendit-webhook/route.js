import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Pastikan path ke lib supabase Anda sudah benar

export async function POST(request) {
    try {
        // 1. Ambil data JSON yang dikirim oleh Xendit
        const body = await request.json();

        // Log untuk memantau data yang masuk di terminal/console
        console.log("📩 Xendit Webhook Received:", {
            status: body.status,
            external_id: body.external_id,
            id: body.id
        });

        const bookingId = body.external_id;

        // 2. Logika Berdasarkan Status Pembayaran
        if (body.status === 'PAID') {
            // Jika pembayaran berhasil tepat waktu
            const { error } = await supabase
                .from('reservations')
                .update({ payment_status: 'CONFIRMED' })
                .eq('external_id', bookingId);

            if (error) {
                console.error(`❌ Gagal update status CONFIRMED untuk ${bookingId}:`, error.message);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            console.log(`✅ Pembayaran Berhasil: Status ${bookingId} diperbarui ke CONFIRMED`);
        }

        else if (body.status === 'EXPIRED') {
            // Jika melewati batas waktu (misal 30 detik yang Anda atur)
            const { error } = await supabase
                .from('reservations')
                .update({ payment_status: 'CANCEL' }) // Mengubah status menjadi CANCEL
                .eq('external_id', bookingId);

            if (error) {
                console.error(`❌ Gagal update status CANCEL untuk ${bookingId}:`, error.message);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            console.log(`❌ Waktu Habis: Status ${bookingId} diperbarui ke CANCEL`);
        }

        // 3. Berikan respon 200 ke Xendit agar mereka tahu webhook sudah diterima
        return NextResponse.json({
            success: true,
            message: "Webhook processed successfully"
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Webhook Error:', error.message);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}