import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const XENDIT_API_KEY = process.env.XENDIT_API_KEY || process.env.XENDIT_SECRET_KEY;
        const XENDIT_URL = 'https://api.xendit.co/v2/invoices';
        const body = await request.json();
        const { externalId, amount, payerEmail, guestInfo, packageName } = body;

        // ================================================================
        // 1. VALIDASI WAJIB PAKET
        // ================================================================
        if (!packageName) {
            return NextResponse.json({ success: false, error: 'Package Name is required for booking.' }, { status: 400 });
        }

        // ================================================================
        // 2. LOGIKA AMBIL ITINERARY
        // ================================================================
        let fetchedItinerary = null;
        if (packageName) {
            const { data: pkgData, error: pkgError } = await supabase
                .from('packages')
                .select('itinerary')
                .eq('title', packageName)
                .single();

            if (!pkgError && pkgData) {
                fetchedItinerary = pkgData.itinerary;
            }
        }

        // ================================================================
        // 2. SIMPAN DATA TAMU KE SUPABASE
        // ================================================================
        const { data: guest, error: guestError } = await supabase
            .from('guests')
            .insert([{
                first_name: guestInfo.firstName,
                last_name: guestInfo.lastName,
                email: guestInfo.email,
                phone: guestInfo.mobile,
                country: guestInfo.country
            }])
            .select()
            .single();

        if (guestError) throw new Error(guestError.message);

        // ================================================================
        // 3. SIMPAN DATA RESERVASI (Status PENDING)
        // ================================================================
        const { error: resError } = await supabase
            .from('reservations')
            .insert([{
                external_id: externalId,
                guest_id: guest.id,
                room_name: body.description,
                package_name: packageName || null,
                itinerary: fetchedItinerary, // Simpan salinan jadwal kegiatan di sini
                check_in: body.checkIn,
                check_out: body.checkOut,
                nights: body.nights,
                adults: body.adults,
                children: body.children,
                qty: body.qty,
                total_amount: amount,
                special_request: guestInfo.specialRequest,
                other_info: `${guestInfo.otherInfo || ''} (Details: ${body.adults} Adults, ${body.children} Children)`,
                payment_method: body.paymentMethod,
                payment_status: 'PENDING'
            }]);

        if (resError) throw new Error(resError.message);

        // ================================================================
        // 4. LOGIKA XENDIT / SIMULASI
        // ================================================================
        if (!XENDIT_API_KEY) {
            throw new Error("Xendit API Key (XENDIT_API_KEY) is not configured in .env.local!");
        }

        const authHeader = Buffer.from(`${XENDIT_API_KEY}:`).toString('base64');
        const response = await fetch(XENDIT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authHeader}`
            },
            body: JSON.stringify({
                external_id: externalId,
                amount: amount,
                payer_email: payerEmail,
                description: body.description,
                success_redirect_url: body.successRedirectUrl,
                failure_redirect_url: body.failureRedirectUrl,
                currency: 'IDR',
                invoice_duration: 600
            })
        });

        const data = await response.json();
        return NextResponse.json({ success: true, invoiceUrl: data.invoice_url });

    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}