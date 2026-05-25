'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Search, Users, Check, Star, Clock,
    ChevronRight, ChevronLeft, MapPin, Phone,
    Mail, Instagram, Leaf, Heart, Sun, Coffee
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import WhatsAppButton from "@/components/WhatsAppButton";

function FadeInSection({ children }) {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            });
        }, { threshold: 0.1 });

        if (domRef.current) observer.observe(domRef.current);
        return () => {
            if (domRef.current) observer.unobserve(domRef.current);
        };
    }, []);

    return (
        <div
            className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}
            ref={domRef}
        >
            {children}
        </div>
    );
}

export default function HomePage() {
    const router = useRouter();
    const scrollRef = useRef(null);

    // States
    const [searchData, setSearchData] = useState({
        checkIn: "",
        checkOut: "",
        guests: 1
    });
    const [packages, setPackages] = useState([]);
    const [mostBookedId, setMostBookedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFavoriteMessage, setShowFavoriteMessage] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    // Slideshow Images
    const slides = [
        "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=1600&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1600&q=80",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80"
    ];
    const [currentSlide, setCurrentSlide] = useState(0);

    // Slideshow Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Scroll listener for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 80);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Data Statis untuk Fitur
    const features = [
        { icon: <Leaf size={20} />, text: "Authentic Balinese Experience" },
        { icon: <Heart size={20} />, text: "Professional Yoga Instructors" },
        { icon: <Coffee size={20} />, text: "Organic Farm-to-Table Meals" },
        { icon: <Sun size={20} />, text: "Peaceful Natural Setting" }
    ];

    // 1. Ambil Data Paket & Hitung Best Seller dari Supabase
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { data: pkgData, error: pkgError } = await supabase
                    .from('packages')
                    .select('*')
                    .eq('status', 'Active');

                if (pkgError) throw pkgError;

                const { data: resData } = await supabase
                    .from('reservations')
                    .select('package_id');

                if (resData && resData.length > 0) {
                    const counts = resData.reduce((acc, curr) => {
                        if (curr.package_id) acc[curr.package_id] = (acc[curr.package_id] || 0) + 1;
                        return acc;
                    }, {});

                    const keys = Object.keys(counts);
                    if (keys.length > 0) {
                        const popularId = keys.reduce((a, b) => counts[a] > counts[b] ? a : b);
                        setMostBookedId(parseInt(popularId));
                    }
                }
                setPackages(pkgData || []);
            } catch (err) {
                console.error("Error fetching home data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // 2. Fungsi Scroll Horizontal (fallback for small screens)
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    // 3. Logika Perubahan Tanggal (Auto Checkout +1 hari)
    const handleCheckInChange = (e) => {
        const dateIn = e.target.value;
        let dateOut = "";
        if (dateIn) {
            const [y, m, d] = dateIn.split('-').map(Number);
            const nextDay = new Date(y, m - 1, d + 1);
            const yy = nextDay.getFullYear();
            const mm = String(nextDay.getMonth() + 1).padStart(2, '0');
            const dd = String(nextDay.getDate()).padStart(2, '0');
            dateOut = `${yy}-${mm}-${dd}`;
        }
        setSearchData({ ...searchData, checkIn: dateIn, checkOut: dateOut });
    };

    // 4. Pesan Favorit saat Bintang di klik
    const handleFavoriteClick = (e, packageId) => {
        e.stopPropagation();
        setShowFavoriteMessage(packageId);
        setTimeout(() => setShowFavoriteMessage(null), 3000);
    };

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

    return (
        <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>

            {/* ====== GLOBAL STYLES & FONTS ====== */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

                * { margin: 0; padding: 0; box-sizing: border-box; }
                html { scroll-behavior: smooth; }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .fade-in-section {
                    opacity: 0;
                    transform: translateY(30px);
                    visibility: hidden;
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                    will-change: opacity, visibility;
                }
                .fade-in-section.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                    visibility: visible;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .hero-slide-bg {
                    position: absolute; inset: 0;
                    background-size: cover; background-position: center;
                    opacity: 0; transition: opacity 1.5s ease-in-out;
                }
                .hero-slide-bg.active { opacity: 1; }

                .nav-link-custom {
                    color: rgba(255,255,255,0.85);
                    text-decoration: none;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    padding: 6px 0;
                    position: relative;
                    transition: color 0.3s ease;
                }
                .nav-link-custom::after {
                    content: '';
                    position: absolute; bottom: -2px; left: 0;
                    width: 0; height: 1.5px;
                    background: #8B7355;
                    transition: width 0.3s ease;
                }
                .nav-link-custom:hover { color: #FFFFFF; }
                .nav-link-custom:hover::after { width: 100%; }

                .nav-scrolled .nav-link-custom {
                    color: #6B6B6B;
                }
                .nav-scrolled .nav-link-custom:hover {
                    color: #1A1A1A;
                }

                .pkg-card {
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s ease;
                    cursor: pointer;
                    border: 1px solid rgba(0,0,0,0.04);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }
                .pkg-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 24px 48px rgba(139,115,85,0.12);
                    border-color: rgba(139,115,85,0.2);
                }

                .btn-view-details {
                    width: 100%;
                    background: transparent;
                    color: #8B7355;
                    border: 1px solid rgba(139,115,85, 0.5);
                    padding: 12px;
                    border-radius: 10px;
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .btn-view-details:hover {
                    background: #8B7355;
                    color: #fff;
                    border-color: #8B7355;
                }

                .search-input-home {
                    width: 100%;
                    border: none;
                    outline: none;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: #1A1A1A;
                    background: transparent;
                    cursor: pointer;
                }

                .footer-link {
                    color: #9CA3AF;
                    text-decoration: none;
                    font-size: 14px;
                    font-family: 'Inter', sans-serif;
                    transition: color 0.3s;
                }
                .footer-link:hover { color: #FFFFFF; }

                input[type="date"]::-webkit-calendar-picker-indicator {
                    opacity: 0.5;
                    cursor: pointer;
                }
            `}</style>

            {/* ====== NAVBAR ====== */}
            <header
                className={scrolled ? 'nav-scrolled' : ''}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    zIndex: 1000,
                    padding: '0 48px',
                    height: '72px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(12px)' : 'none',
                    borderBottom: scrolled ? '1px solid #E8E5E0' : '1px solid transparent',
                    transition: 'all 0.4s ease',
                }}
            >
                {/* Logo */}
                <div
                    onClick={() => router.push('/home')}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                >
                    <img
                        src="/logo_td_1.png"
                        alt="The Dukuh Retreat Logo"
                        style={{
                            width: '65px', height: '65px',
                            objectFit: 'contain'
                        }}
                    />
                    <div>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '18px', fontWeight: '600', margin: 0,
                            color: scrolled ? colors.text : '#fff',
                            transition: 'color 0.4s',
                        }}>The Dukuh Retreat</h1>
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '11px', margin: 0, letterSpacing: '1.5px', textTransform: 'uppercase',
                            color: scrolled ? colors.textMuted : 'rgba(255,255,255,0.7)',
                            transition: 'color 0.4s',
                        }}>Yoga & Wellness</p>
                    </div>
                </div>

                {/* Nav Links */}
                <nav style={{ display: 'flex', gap: '36px' }}>
                    <a href="#home" className="nav-link-custom">Home</a>
                    <a href="#rooms" className="nav-link-custom">Rooms</a>
                    <a href="#packages" className="nav-link-custom">Packages</a>
                    <a href="#about" className="nav-link-custom">About</a>
                    <a href="#contact" className="nav-link-custom">Contact</a>
                </nav>


            </header>

            {/* ====== HERO SECTION ====== */}
            <section id="home" style={{
                position: 'relative', height: '90vh', minHeight: '700px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
            }}>
                {/* Slideshow Background */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`hero-slide-bg ${index === currentSlide ? "active" : ""}`}
                            style={{ backgroundImage: `url(${slide})` }}
                        />
                    ))}
                    {/* Dark overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)',
                        zIndex: 1,
                    }} />
                </div>

                {/* Hero Content */}
                <div style={{
                    position: 'relative', zIndex: 10,
                    textAlign: 'center', color: '#fff',
                    maxWidth: '800px', padding: '0 24px',
                    animation: 'fadeInUp 1s ease forwards',
                }}>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '12px', fontWeight: '500',
                        letterSpacing: '4px', textTransform: 'uppercase',
                        marginBottom: '20px',
                        color: 'rgba(255,255,255,0.8)',
                    }}>Welcome to Bali's Hidden Sanctuary</p>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(40px, 6vw, 72px)',
                        fontWeight: '600',
                        lineHeight: 1.1,
                        marginBottom: '24px',
                    }}>Discover Your<br />Inner Peace</h2>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '17px', fontWeight: '300',
                        lineHeight: 1.7,
                        color: 'rgba(255,255,255,0.85)',
                        maxWidth: '560px', margin: '0 auto',
                    }}>
                        Unplug. De-stress. Recharge at our premier yoga & wellness retreat
                        nestled in the heart of Bali's lush landscapes.
                    </p>

                    {/* Slide dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                style={{
                                    width: i === currentSlide ? '28px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s ease',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== SEARCH BAR (floating below hero) ====== */}
            <div style={{
                maxWidth: '900px', margin: '-48px auto 0', padding: '0 24px',
                position: 'relative', zIndex: 20,
                animation: 'slideIn 0.8s ease 0.3s both',
            }}>
                <div style={{
                    background: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                    padding: '24px 32px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '20px',
                    alignItems: 'end',
                    border: `1px solid ${colors.border}`,
                }}>
                    <div>
                        <label style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '11px',
                            fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase',
                            color: colors.textMuted, marginBottom: '8px', display: 'block',
                        }}>Check In</label>
                        <input
                            type="date"
                            className="search-input-home"
                            value={searchData.checkIn}
                            onChange={handleCheckInChange}
                            style={{ padding: '8px 0', borderBottom: `1px solid ${colors.border}` }}
                        />
                    </div>
                    <div>
                        <label style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '11px',
                            fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase',
                            color: colors.textMuted, marginBottom: '8px', display: 'block',
                        }}>Check Out</label>
                        <input
                            type="date"
                            className="search-input-home"
                            value={searchData.checkOut}
                            onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                            style={{ padding: '8px 0', borderBottom: `1px solid ${colors.border}` }}
                        />
                    </div>
                    <div>
                        <label style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '11px',
                            fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase',
                            color: colors.textMuted, marginBottom: '8px', display: 'block',
                        }}>Guests</label>
                        <select
                            className="search-input-home"
                            value={searchData.guests}
                            onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
                            style={{ padding: '8px 0', borderBottom: `1px solid ${colors.border}` }}
                        >
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            if (!searchData.checkIn || !searchData.checkOut) {
                                alert("Harap isi tanggal Check In dan Check Out terlebih dahulu!");
                            } else {
                                router.push(`/booking-page/custom?checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&guests=${searchData.guests}`);
                            }
                        }}
                        style={{
                            background: colors.accent,
                            color: '#fff', border: 'none',
                            padding: '14px 32px', borderRadius: '8px',
                            fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600',
                            cursor: 'pointer', transition: 'background 0.3s',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                        onMouseEnter={e => e.target.style.background = colors.accentHover}
                        onMouseLeave={e => e.target.style.background = colors.accent}
                    >
                        <Search size={16} />
                        Search
                    </button>
                </div>
            </div>

            {/* ====== FEATURES STRIP ====== */}
            <FadeInSection>
                <section style={{
                    maxWidth: '1100px', margin: '32px auto 0', padding: '0 24px',
                }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px',
                    }}>
                        {features.map((feat, idx) => (
                            <div key={idx} style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '20px 24px',
                                background: '#fff', borderRadius: '12px',
                                border: `1px solid ${colors.border}`,
                                animation: `slideIn 0.6s ease ${0.1 * idx}s both`,
                            }}>
                                <div style={{ color: colors.accent, flexShrink: 0 }}>
                                    {feat.icon}
                                </div>
                                <span style={{
                                    fontFamily: "'Inter', sans-serif", fontSize: '13px',
                                    fontWeight: '500', color: colors.text,
                                }}>{feat.text}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </FadeInSection>
            {/* ====== ACCOMMODATION SECTION ====== */}
            <FadeInSection>
                <section id="rooms" style={{
                    maxWidth: '1100px', margin: '0 auto',
                    padding: '40px 24px 40px',
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '12px',
                            fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase',
                            color: colors.accent, marginBottom: '12px',
                        }}>Our Rooms </p>
                        <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '38px', fontWeight: '600', color: colors.text,
                            marginBottom: '16px',
                        }}>Stay With Us</h3>
                        <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '15px',
                            color: colors.textMuted, maxWidth: '600px', margin: '0 auto', lineHeight: 1.7,
                        }}>Stay in an individual unique wooden house with stage structure so-called Indonesian Rumah Panggung where we sleep tight with the sounds of tropical nature and breathe in clean greenery ocean breeze air.</p>
                    </div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px'
                    }}>
                        {[
                            { id: 'deluxe', name: 'Deluxe Rooms', size: '32sqm', desc: 'Spacious rooms with serene courtyards featuring the tropical gardens', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600' },
                            { id: 'suite', name: 'Suite Rooms', size: '38sqm', desc: 'Spacious rooms with serene courtyards featuring the rice field view', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600' }
                        ].map((room, i) => (
                            <div
                                key={i}
                                className="pkg-card"
                                onClick={() => router.push(`/booking-page/custom`)}
                                style={{ animation: `slideIn 0.6s ease ${0.1 * i}s both`, display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                                    <img
                                        src={room.img}
                                        alt={room.name}
                                        style={{
                                            width: '100%', height: '100%', objectFit: 'cover',
                                            transition: 'transform 0.6s ease',
                                        }}
                                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                    />
                                    <div style={{
                                        position: 'absolute', bottom: '16px', right: '16px',
                                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                                        color: '#fff', padding: '6px 12px', borderRadius: '8px',
                                        fontSize: '12px', fontWeight: '500', fontFamily: "'Inter', sans-serif",
                                    }}>
                                        {room.size}
                                    </div>
                                </div>
                                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{
                                            fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600',
                                            color: colors.text, marginBottom: '12px'
                                        }}>{room.name}</h4>
                                        <p style={{
                                            fontFamily: "'Inter', sans-serif", fontSize: '14px', color: colors.textMuted,
                                            lineHeight: 1.6, marginBottom: '24px'
                                        }}>{room.desc}</p>
                                    </div>
                                    <div style={{
                                        fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '600',
                                        color: colors.accent, display: 'flex', alignItems: 'center', gap: '8px',
                                        textTransform: 'uppercase', letterSpacing: '0.5px'
                                    }}>
                                        Book Room
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </FadeInSection>

            {/* ====== PACKAGES SECTION ====== */}
            <FadeInSection>
                <section id="packages" style={{
                    maxWidth: '1100px', margin: '0 auto',
                    padding: '0px 24px 48px',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '12px',
                            fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase',
                            color: colors.accent, marginBottom: '12px',
                        }}>Our Offerings</p>
                        <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '38px', fontWeight: '600', color: colors.text,
                            marginBottom: '16px',
                        }}>Wellness Packages</h3>
                        <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '15px',
                            color: colors.textMuted, maxWidth: '480px', margin: '0 auto', lineHeight: 1.7,
                        }}>Carefully curated experiences designed for your complete rejuvenation and inner harmony.</p>
                    </div>

                    {/* Package Grid */}
                    {isLoading ? (
                        <p style={{
                            textAlign: 'center', fontFamily: "'Inter', sans-serif",
                            color: colors.textMuted, padding: '48px 0',
                        }}>Loading our best packages...</p>
                    ) : packages.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '28px',
                        }}>
                            {packages.map((pkg, idx) => (
                                <div
                                    key={pkg.id}
                                    className="pkg-card"
                                    onClick={() => router.push(`/package-detail/${pkg.id}`)}
                                    style={{ animation: `slideIn 0.6s ease ${0.1 * idx}s both` }}
                                >
                                    {/* Card Image */}
                                    <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                                        <img
                                            src={pkg.image_url}
                                            alt={pkg.title}
                                            style={{
                                                width: '100%', height: '100%', objectFit: 'cover',
                                                transition: 'transform 0.6s ease',
                                            }}
                                            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                        />
                                        {/* Best Seller tag */}
                                        {mostBookedId === pkg.id && (
                                            <div
                                                onClick={(e) => handleFavoriteClick(e, pkg.id)}
                                                style={{
                                                    position: 'absolute', top: '16px', left: '16px',
                                                    background: colors.accent, color: '#fff',
                                                    padding: '6px 14px', borderRadius: '20px',
                                                    fontSize: '11px', fontWeight: '600',
                                                    fontFamily: "'Inter', sans-serif",
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    letterSpacing: '0.5px',
                                                }}
                                            >
                                                <Star size={12} fill="white" />
                                                Best Seller
                                                {showFavoriteMessage === pkg.id && (
                                                    <span style={{
                                                        position: 'absolute', bottom: '-30px', left: 0,
                                                        background: colors.dark, color: '#fff',
                                                        padding: '4px 10px', borderRadius: '4px',
                                                        fontSize: '11px', whiteSpace: 'nowrap',
                                                    }}>Paling Sering Dipesan!</span>
                                                )}
                                            </div>
                                        )}
                                        {/* Duration badge */}
                                        <div style={{
                                            position: 'absolute', bottom: '16px', right: '16px',
                                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                                            color: '#fff', padding: '6px 12px', borderRadius: '8px',
                                            fontSize: '12px', fontWeight: '500',
                                            fontFamily: "'Inter', sans-serif",
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                        }}>
                                            <Clock size={12} />
                                            {pkg.duration}
                                        </div>
                                    </div>

                                    {/* Card Info */}
                                    <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h4 style={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontSize: '22px', fontWeight: '600',
                                            color: colors.text, marginBottom: '6px',
                                        }}>{pkg.title}</h4>

                                        <p style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '20px', fontWeight: '700',
                                            color: colors.accent, marginBottom: '20px',
                                        }}>Rp {pkg.price?.toLocaleString('id-ID')}</p>

                                        {/* Mini features */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', flexGrow: 1 }}>
                                            {pkg.features?.split(',').slice(0, 2).map((feat, i) => (
                                                <span key={i} style={{
                                                    fontSize: '11px', fontFamily: "'Inter', sans-serif",
                                                    border: `1px solid rgba(139,115,85,0.2)`,
                                                    padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px',
                                                    borderRadius: '4px', color: colors.accent, fontWeight: '500',
                                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                                }}>
                                                    <Check size={12} /> {feat.trim()}
                                                </span>
                                            ))}
                                        </div>

                                        <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', marginBottom: '20px' }} />

                                        {/* View Details button */}
                                        <button className="btn-view-details">
                                            View Details <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{
                            textAlign: 'center', fontFamily: "'Inter', sans-serif",
                            color: colors.textMuted, padding: '48px 0',
                        }}>No packages available at the moment.</p>
                    )}
                </section>

                {/* ====== ABOUT SECTION ====== */}
                <section id="about" style={{
                    background: '#fff',
                    borderTop: `1px solid ${colors.border}`,
                    borderBottom: `1px solid ${colors.border}`,
                }}>
                    <div style={{
                        maxWidth: '1100px', margin: '0 auto', padding: '64px 24px',
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center',
                    }}>
                        {/* Text */}
                        <div>
                            <p style={{
                                fontFamily: "'Inter', sans-serif", fontSize: '12px',
                                fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase',
                                color: colors.accent, marginBottom: '12px',
                            }}>About Us</p>
                            <h3 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '36px', fontWeight: '600', lineHeight: 1.2,
                                color: colors.text, marginBottom: '24px',
                            }}>Welcome to<br />The Dukuh Retreat</h3>
                            <p style={{
                                fontFamily: "'Inter', sans-serif", fontSize: '15px',
                                color: colors.textMuted, lineHeight: 1.8, marginBottom: '32px',
                            }}>
                                Nestled in the heart of Bali's lush landscapes, The Dukuh Retreat offers an authentic sanctuary
                                for those seeking peace, wellness, and spiritual growth. Our programs blend traditional Balinese
                                healing with modern wellness practices.
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', color: colors.accent }}>
                                <MapPin size={18} />
                                <span style={{
                                    fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '500',
                                }}>Tabanan, Bali, Indonesia</span>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'flex', gap: '48px' }}>
                                {[
                                    { number: '10+', label: 'Years Experience' },
                                    { number: '500+', label: 'Happy Guests' },
                                    { number: '9.2', label: 'Rating' },
                                ].map((stat, i) => (
                                    <div key={i}>
                                        <div style={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontSize: '32px', fontWeight: '700', color: colors.accent,
                                        }}>{stat.number}</div>
                                        <div style={{
                                            fontFamily: "'Inter', sans-serif", fontSize: '13px',
                                            color: colors.textMuted, marginTop: '4px',
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                        }}>
                                            {stat.label === 'Rating' && <Star size={14} fill="#D4A853" color="#D4A853" />}
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image */}
                        <div style={{ position: 'relative' }}>
                            <img
                                src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=700&q=80"
                                alt="Yoga retreat"
                                style={{
                                    width: '100%', height: '520px', objectFit: 'cover',
                                    borderRadius: '20px',
                                }}
                            />
                            {/* Floating accent image */}
                            <img
                                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80"
                                alt="Meditation"
                                style={{
                                    position: 'absolute', bottom: '-32px', left: '-40px',
                                    width: '200px', height: '240px', objectFit: 'cover',
                                    borderRadius: '16px', border: '6px solid #fff',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                                }}
                            />
                        </div>
                    </div>
                </section>
            </FadeInSection>

            {/* ====== CONTACT CTA SECTION ====== */}
            <FadeInSection>
                <section id="contact" style={{
                    background: colors.dark, color: '#fff',
                    padding: '96px 24px', textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                        <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '12px',
                            fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase',
                            color: colors.accent, marginBottom: '16px',
                        }}>Get in Touch</p>
                        <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '36px', fontWeight: '600', lineHeight: 1.2,
                            marginBottom: '20px',
                        }}>Ready to Begin<br />Your Journey?</h3>
                        <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '15px',
                            color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
                            marginBottom: '40px',
                        }}>
                            Contact us today to book your transformative retreat experience in beautiful Bali.
                        </p>

                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap',
                            marginBottom: '40px',
                        }}>
                            {[
                                { icon: <Phone size={16} />, text: '+62 361 123 4567' },
                                { icon: <Mail size={16} />, text: 'hello@thedukuhretreat.com' },
                                { icon: <Instagram size={16} />, text: '@thedukuhretreat' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    fontFamily: "'Inter', sans-serif", fontSize: '14px',
                                    color: 'rgba(255,255,255,0.75)',
                                }}>
                                    <span style={{ color: colors.accent }}>{item.icon}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => router.push('/booking-page/custom?reset=true')}
                            style={{
                                background: 'transparent', color: '#fff',
                                border: '1.5px solid rgba(255,255,255,0.3)',
                                padding: '14px 40px', borderRadius: '8px',
                                fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.3s',
                                letterSpacing: '0.5px',
                            }}
                            onMouseEnter={e => {
                                e.target.style.background = colors.accent;
                                e.target.style.borderColor = colors.accent;
                            }}
                            onMouseLeave={e => {
                                e.target.style.background = 'transparent';
                                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                            }}
                        >
                            Book Your Retreat
                        </button>
                    </div>
                </section>
            </FadeInSection>

            {/* ====== FOOTER ====== */}
            <footer style={{
                background: '#111111', color: '#fff',
                padding: '64px 24px 32px',
            }}>
                <div style={{
                    maxWidth: '1100px', margin: '0 auto',
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '60px',
                }}>
                    <div>
                        <h4 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '20px', fontWeight: '600', marginBottom: '16px',
                        }}>The Dukuh Retreat</h4>
                        <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '14px',
                            color: '#9CA3AF', lineHeight: 1.7, maxWidth: '320px',
                        }}>Your sanctuary for yoga, wellness, and spiritual growth in beautiful Bali.</p>
                    </div>
                    <div>
                        <h4 style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '12px',
                            fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase',
                            marginBottom: '20px', color: 'rgba(255,255,255,0.6)',
                        }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><a href="#home" className="footer-link">Home</a></li>
                            <li><a href="#packages" className="footer-link">Packages</a></li>
                            <li><a href="#about" className="footer-link">About</a></li>
                            <li><a href="#contact" className="footer-link">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '12px',
                            fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase',
                            marginBottom: '20px', color: 'rgba(255,255,255,0.6)',
                        }}>Location</h4>
                        <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '14px',
                            color: '#9CA3AF', lineHeight: 1.7,
                        }}>Jalan Raya Pantai Pasut,<br />Tabanan, Bali 82161,<br />Indonesia</p>
                    </div>
                </div>

                {/* Copyright */}
                <div style={{
                    maxWidth: '1100px', margin: '48px auto 0',
                    paddingTop: '24px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'center',
                    fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#6B7280',
                }}>
                    © 2025 The Dukuh Retreat. All rights reserved.
                </div>
            </footer>

            <WhatsAppButton />
        </div>
    );
}
