'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, ArrowLeft, Clock, Tag, Calendar, MapPin } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function PackageDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [loading, setLoading] = useState(true);

    // ===================== STYLES =====================
    const colors = {
        bg: '#FAFAF7',
        text: '#1A1A1A',
        textMuted: '#6B6B6B',
        accent: '#8B7355',
        accentHover: '#6D5A42',
        dark: '#1A1A1A',
        white: '#FFFFFF',
        border: '#E8E5E0',
        cardBg: '#FFFFFF',
    };

    useEffect(() => {
        if (id) {
            fetchPackage();
        }
    }, [id]);

    const fetchPackage = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('packages')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(error);
        } else {
            setSelectedPackage(data);
        }
        setLoading(false);
    };

    if (loading) return (
        <div style={{
            minHeight: '100vh', background: colors.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', sans-serif", color: colors.textMuted
        }}>
            <p>Loading details...</p>
        </div>
    );

    if (!selectedPackage) {
        return (
            <div style={{
                minHeight: '100vh', background: colors.bg,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Inter', sans-serif"
            }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: colors.text, marginBottom: '20px' }}>
                    Package Not Found
                </h2>
                <button
                    onClick={() => router.push('/home')}
                    style={{
                        background: colors.accent, color: '#fff', border: 'none',
                        padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
                        fontWeight: '600', transition: 'background 0.3s'
                    }}
                    onMouseEnter={e => e.target.style.background = colors.accentHover}
                    onMouseLeave={e => e.target.style.background = colors.accent}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            paddingBottom: '80px'
        }}>
            {/* ====== GLOBAL STYLES & FONTS ====== */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .itinerary-card {
                    background: #fff;
                    border: 1px solid #E8E5E0;
                    border-radius: 12px;
                    padding: 24px;
                    min-width: 300px;
                    max-width: 350px;
                    flex: 0 0 auto;
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                .itinerary-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.05);
                }

                .itinerary-scroll-container::-webkit-scrollbar {
                    height: 8px;
                }
                .itinerary-scroll-container::-webkit-scrollbar-track {
                    background: #F5F3EF;
                    border-radius: 4px;
                }
                .itinerary-scroll-container::-webkit-scrollbar-thumb {
                    background: #D4C9BA;
                    border-radius: 4px;
                }
                .itinerary-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: #8B7355;
                }
            `}</style>

            {/* ====== HEADER / NAV ====== */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(250,250,247,0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${colors.border}`,
                padding: '16px 24px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => router.push('/home')}
                        style={{
                            background: 'transparent', border: 'none',
                            color: colors.accent, fontFamily: "'Inter', sans-serif",
                            fontSize: '14px', fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            cursor: 'pointer', transition: 'color 0.3s'
                        }}
                        onMouseEnter={e => e.target.style.color = colors.accentHover}
                        onMouseLeave={e => e.target.style.color = colors.accent}
                    >
                        <ArrowLeft size={18} /> Back to Home
                    </button>
                </div>
            </header>

            <main style={{
                maxWidth: '1200px', margin: '0 auto', padding: '48px 24px',
                animation: 'fadeIn 0.8s ease'
            }}>
                {/* ====== MAIN GRID (Image + Info) ====== */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '64px', alignItems: 'start', marginBottom: '80px'
                }}>
                    {/* Image Section */}
                    <div style={{
                        position: 'relative', borderRadius: '24px', overflow: 'hidden',
                        boxShadow: '0 24px 50px rgba(0,0,0,0.06)'
                    }}>
                        <img
                            src={selectedPackage.image_url}
                            alt={selectedPackage.title}
                            style={{ width: '100%', height: 'auto', minHeight: '500px', objectFit: 'cover', display: 'block' }}
                        />
                    </div>

                    {/* Info Section */}
                    <div>
                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <span style={{
                                background: 'rgba(139,115,85,0.1)', color: colors.accent,
                                padding: '6px 14px', borderRadius: '20px',
                                fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '700',
                                letterSpacing: '1px'
                            }}>
                                YOGA & WELLNESS
                            </span>
                            <span style={{
                                background: colors.cardBg, color: colors.textMuted,
                                border: `1px solid ${colors.border}`,
                                padding: '6px 14px', borderRadius: '20px',
                                fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                <Clock size={14} /> {selectedPackage.duration}
                            </span>
                        </div>

                        {/* Title & Price */}
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 48px)',
                            fontWeight: '600', lineHeight: 1.1, color: colors.text,
                            marginBottom: '16px'
                        }}>
                            {selectedPackage.title}
                        </h1>

                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px'
                        }}>
                            <div style={{ background: colors.accent, color: '#fff', padding: '8px', borderRadius: '50%' }}>
                                <Tag size={20} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '28px', fontWeight: '700', color: colors.accent, margin: 0 }}>
                                    Rp {selectedPackage.price?.toLocaleString('id-ID')}
                                </p>
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                                    per 2 persons
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{
                                fontFamily: "'Inter', sans-serif", fontSize: '16px', fontWeight: '700',
                                color: colors.text, marginBottom: '12px', letterSpacing: '0.5px'
                            }}>
                                About This Experience
                            </h3>
                            <p style={{
                                fontFamily: "'Inter', sans-serif", fontSize: '15px', lineHeight: 1.8,
                                color: colors.textMuted
                            }}>
                                {selectedPackage.description}
                            </p>
                        </div>

                        {/* What's Included */}
                        <div style={{
                            background: '#fff', border: `1px solid ${colors.border}`,
                            borderRadius: '16px', padding: '24px', marginBottom: '40px'
                        }}>
                            <h3 style={{
                                fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '700',
                                color: colors.text, marginBottom: '16px', letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}>
                                What's Included
                            </h3>
                            <ul style={{ listStyle: 'none', display: 'grid', gap: '16px' }}>
                                {selectedPackage.features?.split(',').map((item, index) => (
                                    <li key={index} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                                        fontFamily: "'Inter', sans-serif", fontSize: '14px', color: colors.textMuted
                                    }}>
                                        <div style={{ color: colors.accent, marginTop: '2px' }}>
                                            <Check size={18} />
                                        </div>
                                        <span style={{ lineHeight: 1.5 }}>{item.trim()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={() => {
                                const match = selectedPackage.duration.match(/(\d+)\s*(?:Night|Malam)/i);
                                const nights = match ? match[1] : 1;
                                router.push(`/booking-page/${selectedPackage.id}?nights=${nights}`);
                            }}
                            style={{
                                width: '100%', background: colors.accent, color: '#fff',
                                border: 'none', padding: '18px', borderRadius: '12px',
                                fontFamily: "'Inter', sans-serif", fontSize: '16px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.3s',
                                boxShadow: '0 8px 20px rgba(139,115,85,0.2)'
                            }}
                            onMouseEnter={e => {
                                e.target.style.background = colors.accentHover;
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.background = colors.accent;
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            Book This Package Now
                        </button>
                    </div>
                </div>

                {/* ====== ITINERARY SECTION ====== */}
                {selectedPackage.itinerary && selectedPackage.itinerary.length > 0 && (
                    <div style={{ marginTop: '80px', paddingTop: '80px', borderTop: `1px solid ${colors.border}` }}>
                        <div style={{ marginBottom: '40px' }}>
                            <p style={{
                                fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '600',
                                letterSpacing: '3px', textTransform: 'uppercase', color: colors.accent,
                                marginBottom: '12px'
                            }}>
                                Your Journey
                            </p>
                            <h2 style={{
                                fontFamily: "'Playfair Display', serif", fontSize: '36px',
                                fontWeight: '600', color: colors.text, display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                <Calendar size={32} color={colors.accent} /> Itinerary
                            </h2>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: colors.textMuted, marginTop: '12px' }}>
                                Detailed daily activities during your wellness program.
                            </p>
                        </div>

                        <div className="itinerary-scroll-container" style={{
                            display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '32px'
                        }}>
                            {selectedPackage.itinerary.map((item, index) => (
                                <div key={index} className="itinerary-card">
                                    <div style={{
                                        display: 'inline-block', background: 'rgba(139,115,85,0.1)',
                                        color: colors.accent, fontFamily: "'Inter', sans-serif",
                                        fontSize: '13px', fontWeight: '700', padding: '6px 16px',
                                        borderRadius: '20px', marginBottom: '20px'
                                    }}>
                                        Day {item.day}
                                    </div>
                                    <div style={{
                                        fontFamily: "'Inter', sans-serif", fontSize: '14px',
                                        lineHeight: 1.8, color: colors.textMuted, whiteSpace: 'pre-line'
                                    }}>
                                        {item.activities}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <WhatsAppButton />
        </div>
    );
}