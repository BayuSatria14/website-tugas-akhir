import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
    try {
        const { to, subject, html } = await request.json();

        if (!to || !html) {
            return NextResponse.json({ error: "Data email tidak lengkap" }, { status: 400 });
        }

        const result = await sendEmail(to, subject, html);

        if (result.success) {
            return NextResponse.json({ success: true, message: "Email update terkirim!" });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("API Send Email Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}