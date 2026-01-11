'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [bookingData, setBookingData] = useState(null);

    useEffect(() => {
        const bookingId = searchParams.get('bookingId');

        // Ambil data dari localStorage
        const savedBooking = localStorage.getItem('currentBooking');
        if (savedBooking) {
            setBookingData(JSON.parse(savedBooking));
        }

        // Clear localStorage setelah sukses
        setTimeout(() => {
            localStorage.removeItem('currentBooking');
        }, 1000);
    }, [searchParams]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom, #f0fdf4, #dcfce7)'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                maxWidth: '500px',
                textAlign: 'center'
            }}>
                <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
                <h1 style={{ color: '#166534', marginBottom: '1rem' }}>
                    Pembayaran Berhasil!
                </h1>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                    Booking Anda telah dikonfirmasi.
                </p>

                {bookingData && (
                    <div style={{
                        background: '#f8fafc',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        textAlign: 'left'
                    }}>
                        <p><strong>Booking ID:</strong> {bookingData.bookingId}</p>
                        <p><strong>Name:</strong> {bookingData.guestInfo.firstName} {bookingData.guestInfo.lastName}</p>
                        <p><strong>Email:</strong> {bookingData.guestInfo.email}</p>
                    </div>
                )}

                <button
                    onClick={() => router.push('/home')}
                    style={{
                        background: '#22c55e',
                        color: 'white',
                        padding: '0.75rem 2rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Kembali ke Beranda
                </button>
            </div>
        </div>
    );
}