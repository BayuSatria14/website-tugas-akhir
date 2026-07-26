'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, CalendarClock, ChevronLeft } from 'lucide-react';

export default function MyScheduleSearchPage() {
    const router = useRouter();
    const [bookingId, setBookingId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (bookingId.trim()) {
            setIsSubmitting(true);
            router.push(`/my-schedule/${encodeURIComponent(bookingId.trim())}`);
        }
    };

    const colors = {
        bg: '#FAFAF7',
        text: '#1A1A1A',
        textMuted: '#6B6B6B',
        accent: '#8B7355',
        accentHover: '#6D5A42',
        border: '#E8E5E0',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
        }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .search-input-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 480px;
                    margin: 0 auto;
                }

                .booking-id-input {
                    width: 100%;
                    padding: 18px 24px 18px 56px;
                    border: 2px solid ${colors.border};
                    border-radius: 16px;
                    font-size: 16px;
                    font-family: 'Inter', sans-serif;
                    outline: none;
                    transition: all 0.3s ease;
                    background: #fff;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }

                .booking-id-input:focus {
                    border-color: ${colors.accent};
                    box-shadow: 0 8px 30px rgba(139,115,85,0.1);
                }

                .search-icon {
                    position: absolute;
                    left: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: ${colors.textMuted};
                    transition: color 0.3s;
                }

                .booking-id-input:focus + .search-icon {
                    color: ${colors.accent};
                }

                .submit-btn {
                    width: 100%;
                    max-width: 480px;
                    margin: 24px auto 0;
                    background: ${colors.accent};
                    color: #fff;
                    border: none;
                    padding: 18px;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(139,115,85,0.2);
                }

                .submit-btn:hover:not(:disabled) {
                    background: ${colors.accentHover};
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(139,115,85,0.3);
                }

                .submit-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
            `}</style>

            {/* HEADER */}
            <header style={{ padding: '24px', display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={() => router.push('/home')}
                    style={{
                        background: 'transparent', border: 'none',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        color: colors.textMuted, fontSize: '14px', fontWeight: '500',
                        cursor: 'pointer', transition: 'color 0.3s'
                    }}
                    onMouseEnter={e => e.target.style.color = colors.accent}
                    onMouseLeave={e => e.target.style.color = colors.textMuted}
                >
                    <ChevronLeft size={18} /> Back to Home
                </button>
            </header>

            {/* MAIN CONTENT */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                animation: 'slideUp 0.6s ease-out'
            }}>
                <div style={{
                    background: '#fff',
                    padding: '48px',
                    borderRadius: '24px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
                    border: `1px solid ${colors.border}`,
                    maxWidth: '600px',
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px', height: '80px',
                        background: 'rgba(139,115,85,0.1)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: colors.accent
                    }}>
                        <CalendarClock size={36} />
                    </div>

                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '32px',
                        color: colors.text,
                        marginBottom: '16px'
                    }}>Find Your Retreat Schedule</h1>
                    
                    <p style={{
                        color: colors.textMuted,
                        fontSize: '15px',
                        lineHeight: 1.6,
                        marginBottom: '40px',
                        maxWidth: '400px',
                        margin: '0 auto 40px'
                    }}>
                        Enter your Booking ID to view your personalized itinerary and wellness activities.
                    </p>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                className="booking-id-input"
                                placeholder="Enter Booking ID (e.g. TDR123456)"
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value)}
                                required
                            />
                            <Search className="search-icon" size={20} />
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={!bookingId.trim() || isSubmitting}
                        >
                            {isSubmitting ? 'Searching...' : 'View My Schedule'}
                            {!isSubmitting && <ArrowRight size={18} />}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
