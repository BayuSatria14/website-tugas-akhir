'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
    CalendarClock, ArrowLeft, Loader2, User, Package, Calendar, 
    MapPin, Clock, Info, CheckCircle2 
} from 'lucide-react';

export default function MySchedulePage({ params }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const bookingId = unwrappedParams?.bookingId;
    
    const [reservation, setReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const colors = {
        bg: '#FAFAF7',
        text: '#1A1A1A',
        textMuted: '#6B6B6B',
        accent: '#8B7355',
        accentHover: '#6D5A42',
        border: '#E8E5E0',
    };

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!bookingId) return;
            
            try {
                // Cari reservasi berdasarkan external_id (bookingId dari Xendit)
                const { data, error } = await supabase
                    .from('reservations')
                    .select('*, guests(*)')
                    .eq('external_id', decodeURIComponent(bookingId))
                    .single();

                if (error || !data) {
                    setError('Jadwal tidak ditemukan. Pastikan Booking ID Anda benar.');
                } else {
                    setReservation(data);
                }
            } catch (err) {
                console.error("Error fetching schedule:", err);
                setError('Terjadi kesalahan saat memuat jadwal.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, [bookingId]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: colors.bg, color: colors.text, fontFamily: "'Inter', sans-serif" }}>
                <Loader2 className="animate-spin" size={48} color={colors.accent} style={{ marginBottom: '16px' }} />
                <p>Memuat jadwal Anda...</p>
            </div>
        );
    }

    if (error || !reservation) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: colors.bg, color: colors.text, fontFamily: "'Inter', sans-serif", padding: '24px' }}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{ width: '64px', height: '64px', background: '#FEE2E2', color: '#DC2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Info size={32} />
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', marginBottom: '12px' }}>Oops!</h2>
                    <p style={{ color: colors.textMuted, marginBottom: '24px', lineHeight: 1.6 }}>{error}</p>
                    <button onClick={() => router.push('/my-schedule')} style={{ background: colors.accent, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Coba Lagi</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "'Inter', sans-serif", paddingBottom: '60px' }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .timeline-container {
                    position: relative;
                    padding-left: 32px;
                    margin-top: 32px;
                }
                
                .timeline-container::before {
                    content: '';
                    position: absolute;
                    left: 7px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: ${colors.border};
                }

                .timeline-item {
                    position: relative;
                    margin-bottom: 40px;
                    animation: fadeIn 0.5s ease backwards;
                }

                .timeline-dot {
                    position: absolute;
                    left: -32px;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: ${colors.accent};
                    border: 3px solid ${colors.bg};
                    box-shadow: 0 0 0 2px ${colors.accent}40;
                    top: 6px;
                }

                .timeline-content {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    border: 1px solid ${colors.border};
                }

                .day-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px;
                    font-weight: 600;
                    color: ${colors.text};
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .activity-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px 0;
                    border-bottom: 1px solid ${colors.border};
                    color: ${colors.textMuted};
                    font-size: 15px;
                    line-height: 1.6;
                }
                
                .activity-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
            `}</style>

            {/* HEADER */}
            <header style={{ background: '#fff', padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={() => router.push('/home')}
                        style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontWeight: '500', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={18} /> Home
                    </button>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600', margin: 0 }}>My Schedule</h1>
                    <div style={{ width: '70px' }}></div> {/* Spacer */}
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
                {/* GUEST INFO CARD */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: `1px solid ${colors.border}`, marginBottom: '48px', animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: colors.accent, marginBottom: '8px' }}>Booking ID: {reservation.external_id}</p>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px' }}>Welcome, {reservation.guests?.first_name}!</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', background: colors.bg, padding: '24px', borderRadius: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '13px', marginBottom: '4px' }}>
                                <Package size={16} /> Package
                            </div>
                            <p style={{ fontWeight: '600', fontSize: '15px' }}>{reservation.package_name}</p>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '13px', marginBottom: '4px' }}>
                                <Calendar size={16} /> Check In
                            </div>
                            <p style={{ fontWeight: '600', fontSize: '15px' }}>{formatDate(reservation.check_in)}</p>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '13px', marginBottom: '4px' }}>
                                <Calendar size={16} /> Check Out
                            </div>
                            <p style={{ fontWeight: '600', fontSize: '15px' }}>{formatDate(reservation.check_out)}</p>
                        </div>
                    </div>
                </div>

                {/* TIMELINE */}
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', marginBottom: '8px' }}>Your Itinerary</h3>
                <p style={{ color: colors.textMuted, marginBottom: '24px' }}>Rangkaian kegiatan wellness Anda selama menginap.</p>

                <div className="timeline-container">
                    {reservation.itinerary && reservation.itinerary.length > 0 ? (
                        reservation.itinerary.map((itin, index) => (
                            <div key={index} className="timeline-item" style={{ animationDelay: `${index * 0.15}s` }}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <h4 className="day-title">Hari ke-{itin.day}</h4>
                                    <ul className="activity-list">
                                        {itin.activities.split('\n').filter(a => a.trim() !== '').map((act, i) => (
                                            <li key={i} className="activity-item">
                                                <CheckCircle2 size={18} color={colors.accent} style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <span>{act}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: `1px solid ${colors.border}`, textAlign: 'center', color: colors.textMuted }}>
                            Jadwal kegiatan Anda belum tersedia atau masih dipersiapkan oleh tim kami.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
