import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Import koneksi supabase

export async function POST(request) {
    try {
        const XENDIT_API_KEY = process.env.XENDIT_SECRET_KEY;
        const XENDIT_URL = 'https://api.xendit.co/v2/invoices';
        const body = await request.json();
        const { externalId, amount, payerEmail, guestInfo, reservationData, durationSeconds } = body;

        // 1. Simpan Data Tamu ke Supabase
        const { data: guest, error: guestError } = await supabase
            .from('guests')
            .insert([{
                first_name: body.guestInfo.firstName,
                last_name: body.guestInfo.lastName,
                email: body.guestInfo.email,
                phone: body.guestInfo.mobile,
                country: body.guestInfo.country
            }])
            .select()
            .single();

        if (guestError) throw new Error(guestError.message);

        // 2. Simpan Data Reservasi (Status PENDING)
        const { error: resError } = await supabase
            .from('reservations')
            .insert([{
                external_id: externalId,
                guest_id: guest.id,
                room_name: body.description,
                package_name: body.packageName || null,
                check_in: body.checkIn,
                check_out: body.checkOut,
                nights: body.nights,
                qty: body.qty,
                total_amount: amount,
                special_request: body.guestInfo.specialRequest,
                other_info: body.guestInfo.otherInfo,
                payment_method: body.paymentMethod,
                payment_status: 'PENDING' // Set Explicit Pending
            }]);

        if (resError) throw new Error(resError.message);

        // 3. Logika Xendit (Tetap seperti kode lama Anda)
        if (!XENDIT_API_KEY) {
            return NextResponse.json({
                success: true,
                invoiceUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-simulation?bookingId=${externalId}&amount=${amount}&paymentMethod=${body.paymentMethod}`,
                invoiceId: `SIM-${Date.now()}`
            });
        }

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
                // DURASI UNTUK TESTING
                invoice_duration: 60
            })
        });

        const data = await response.json();
        return NextResponse.json({ success: true, invoiceUrl: data.invoice_url });

    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
