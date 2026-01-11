'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function BookingFailedPage() {
    const router = useRouter();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom, #fef2f2, #fee2e2)'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                maxWidth: '500px',
                textAlign: 'center'
            }}>
                <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                <h1 style={{ color: '#991b1b', marginBottom: '1rem' }}>
                    Pembayaran Gagal
                </h1>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                    Transaksi Anda tidak dapat diproses. Silakan coba lagi.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => router.push('/booking-page/${selectedPackage.id}')}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            padding: '0.75rem 2rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Coba Lagi
                    </button>
                    <button
                        onClick={() => router.push('/booking-page/${selectedPackage.id}')}
                        style={{
                            background: '#64748b',
                            color: 'white',
                            padding: '0.75rem 2rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Kembali
                    </button>
                </div>
            </div>
        </div>
    );
}