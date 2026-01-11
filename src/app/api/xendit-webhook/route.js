import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();

        console.log("📩 Xendit Webhook Received:", body);

        // Verifikasi payment status
        if (body.status === 'PAID') {
            const bookingId = body.external_id;

            // TODO: Update database booking status
            console.log(`✅ Payment confirmed for booking: ${bookingId}`);

            // Kirim email konfirmasi, dll
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}