import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Ambil Key tepat saat fungsi dijalankan
        const XENDIT_API_KEY = process.env.XENDIT_SECRET_KEY;
        const XENDIT_URL = 'https://api.xendit.co/v2/invoices';

        const body = await request.json();

        // Log untuk memastikan Key terbaca di terminal VS Code
        if (!XENDIT_API_KEY) {
            console.warn("⚠️ WARNING: XENDIT_SECRET_KEY tidak ditemukan. Menggunakan Simulation Mode.");

            // FALLBACK TO SIMULATION
            return NextResponse.json({
                success: true,
                invoiceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-simulation?bookingId=${body.externalId}&amount=${body.amount}&paymentMethod=${body.paymentMethod}`,
                invoiceId: `SIM-${Date.now()}`
            });
        }

        // Buat Auth Header (Basic Auth: base64 dari "api_key:")
        const authHeader = Buffer.from(`${XENDIT_API_KEY}:`).toString('base64');

        const response = await fetch(XENDIT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authHeader}`
            },
            body: JSON.stringify({
                external_id: body.externalId,
                amount: body.amount,
                payer_email: body.payerEmail,
                description: body.description,
                success_redirect_url: body.successRedirectUrl,
                failure_redirect_url: body.failureRedirectUrl,
                currency: 'IDR',
                invoice_duration: 86400
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Xendit API Error Response:", data);
            return NextResponse.json({
                success: false,
                error: data.message || 'Gagal terhubung ke Xendit'
            }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            invoiceUrl: data.invoice_url,
            invoiceId: data.id
        });

    } catch (error) {
        console.error('❌ Server Error:', error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}