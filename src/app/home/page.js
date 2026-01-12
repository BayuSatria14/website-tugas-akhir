'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Search, Users, Check, Star, LogOut, Clock,
    ChevronRight, ChevronLeft, MapPin, Phone,
    Mail, Instagram
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import "./Homepage.css";

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

    // Data Statis untuk Fitur & About (Sesuai Desain)
    const features = [
        "Authentic Balinese Experience",
        "Professional Yoga Instructors",
        "Organic Farm-to-Table Meals",
        "Peaceful Natural Setting"
    ];

    // 1. Ambil Data Paket & Hitung Best Seller dari Supabase
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Ambil Paket yang statusnya Active
                const { data: pkgData, error: pkgError } = await supabase
                    .from('packages')
                    .select('*')
                    .eq('status', 'Active');

                if (pkgError) throw pkgError;

                // Ambil Data Reservasi untuk menentukan paket terpopuler
                const { data: resData } = await supabase
                    .from('reservations')
                    .select('package_id');

                if (resData && resData.length > 0) {
                    const counts = resData.reduce((acc, curr) => {
                        if (curr.package_id) acc[curr.package_id] = (acc[curr.package_id] || 0) + 1;
                        return acc;
                    }, {});

                    // Cari ID yang paling banyak dipesan
                    const popularId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                    setMostBookedId(parseInt(popularId));
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

    // 2. Fungsi Scroll Horizontal
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    // 3. Fungsi Logout
    const handleLogout = async () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert("Gagal logout: " + error.message);
            } else {
                router.push("/login");
            }
        }
    };

    // 4. Logika Perubahan Tanggal (Auto Checkout +1 hari)
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

    // 5. Pesan Favorit saat Bintang di klik
    const handleFavoriteClick = (e, packageId) => {
        e.stopPropagation(); // Agar tidak trigger navigasi ke detail
        setShowFavoriteMessage(packageId);
        setTimeout(() => setShowFavoriteMessage(null), 3000);
    };

    return (
        <div className="homepage">
            {/* --- NAVBAR --- */}
            <header className="navbar">
                <div className="navbar-container">
                    <div className="navbar-content">
                        <div className="logo-section">
                            <div className="logo-box"><span className="logo-text">TD</span></div>
                            <div>
                                <h1 className="brand-name">The Dukuh Retreat</h1>
                                <p className="brand-subtitle">Yoga & Wellness Center</p>
                            </div>
                        </div>
                        <nav className="nav-links">
                            <a href="#home" className="nav-link active">Home</a>
                            <a href="#packages" className="nav-link">Packages</a>
                            <a href="#about" className="nav-link">About</a>
                            <a href="#contact" className="nav-link">Contact</a>
                        </nav>
                        <div className="navbar-actions">
                            <button className="book-btn" onClick={() => {
                                if (searchData.checkIn && searchData.checkOut) {
                                    router.push(`/booking-page/custom?checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&guests=${searchData.guests}`);
                                } else {
                                    router.push('/booking-page/custom?reset=true');
                                }
                            }}>
                                Book Now
                            </button>
                            <button onClick={handleLogout} className="logout-button-custom" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section id="home" className="hero-section">
                <div className="hero-background"></div>
                <div className="hero-content">
                    <h2 className="hero-title">Discover Your Inner Peace</h2>
                    <p className="hero-subtitle">Unplug. De-stress. Recharge at Bali's Premier Yoga Retreat</p>

                    <div className="search-box">
                        <div className="search-grid">
                            <div className="search-item">
                                <div className="search-input-wrapper search-date-center">
                                    <label className="search-label">Check In</label>
                                    <input type="date" className="search-input" value={searchData.checkIn} onChange={handleCheckInChange} />
                                </div>
                            </div>
                            <div className="search-item">
                                <div className="search-input-wrapper search-date-center">
                                    <label className="search-label">Check Out</label>
                                    <input type="date" className="search-input" value={searchData.checkOut} onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })} />
                                </div>
                            </div>
                            <div className="search-item">
                                <Users size={20} className="search-icon-inline" />
                                <div className="search-input-wrapper">
                                    <label className="search-label">Guests</label>
                                    <select className="search-input" value={searchData.guests} onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}>
                                        <option value="1">1 Guest</option>
                                        <option value="2">2 Guests</option>
                                    </select>
                                </div>
                            </div>
                            <button className="search-btn" onClick={() => {
                                if (!searchData.checkIn || !searchData.checkOut) {
                                    alert("Harap isi tanggal Check In dan Check Out terlebih dahulu!");
                                } else {
                                    router.push(`/booking-page/custom?checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&guests=${searchData.guests}`);
                                }
                            }}>
                                <Search size={20} />
                                <span>Search</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="features-section">
                <div className="features-container">
                    <div className="features-grid">
                        {features.map((feature, idx) => (
                            <div key={idx} className="feature-item">
                                <Check className="feature-icon" size={20} />
                                <span className="feature-text">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PACKAGES SECTION (HORIZONTAL SCROLL) --- */}
            <section id="packages" className="packages-section">
                <div className="packages-container">
                    <div className="packages-header-row">
                        <div>
                            <h3 className="packages-title">Our Wellness Packages</h3>
                            <p className="packages-subtitle">Carefully curated for your rejuvenation</p>
                        </div>
                        <div className="scroll-controls">
                            <button className="ctrl-btn" onClick={() => scroll('left')}><ChevronLeft /></button>
                            <button className="ctrl-btn" onClick={() => scroll('right')}><ChevronRight /></button>
                        </div>
                    </div>

                    <div className="horizontal-scroll-wrapper" ref={scrollRef}>
                        <div className="packages-slider">
                            {isLoading ? (
                                <p className="loading-text">Loading our best packages...</p>
                            ) : packages.length > 0 ? (
                                packages.map((pkg) => (
                                    <div key={pkg.id} className="package-card-scroll" onClick={() => router.push(`/package-detail/${pkg.id}`)}>
                                        <div className="card-img-wrapper">
                                            <img src={pkg.image_url} alt={pkg.title} />
                                            {mostBookedId === pkg.id && (
                                                <div className="popular-tag" onClick={(e) => handleFavoriteClick(e, pkg.id)}>
                                                    <Star size={14} fill="white" />
                                                    <span>Best Seller</span>
                                                    {showFavoriteMessage === pkg.id && (
                                                        <div className="fav-popup">Paling Sering Dipesan!</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-info">
                                            <div className="card-meta">
                                                <Clock size={14} />
                                                <span>{pkg.duration}</span>
                                            </div>
                                            <h4>{pkg.title}</h4>
                                            <p className="card-price">Rp {pkg.price?.toLocaleString('id-ID')}</p>
                                            <div className="card-features-mini">
                                                {pkg.features?.split(',').slice(0, 2).map((feat, i) => (
                                                    <span key={i} className="mini-feat">✓ {feat.trim()}</span>
                                                ))}
                                            </div>
                                            <button className="card-btn-view">
                                                Lihat Detail <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No packages available at the moment.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ABOUT SECTION --- */}
            <section id="about" className="about-section">
                <div className="about-container">
                    <div className="about-grid">
                        <div className="about-text">
                            <h3 className="about-title">Welcome to The Dukuh Retreat</h3>
                            <p className="about-description">
                                Nestled in the heart of Bali's lush landscapes, The Dukuh Retreat offers an authentic sanctuary
                                for those seeking peace, wellness, and spiritual growth.
                            </p>
                            <div className="about-location">
                                <MapPin className="location-icon" size={24} />
                                <span>Tabanan, Bali, Indonesia</span>
                            </div>
                            <div className="about-stats">
                                <div className="stat-item">
                                    <div className="stat-number">10+</div>
                                    <div className="stat-label">Years Experience</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">500+</div>
                                    <div className="stat-label">Happy Guests</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">9.2</div>
                                    <div className="stat-label"><Star size={16} fill="#fbbf24" color="#fbbf24" /> Rating</div>
                                </div>
                            </div>
                        </div>
                        <div className="about-images">
                            <img src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80" alt="Yoga" className="about-img img1" />
                            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80" alt="Meditation" className="about-img img2" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CONTACT SECTION --- */}
            <section id="contact" className="contact-section">
                <div className="contact-container">
                    <div className="contact-card">
                        <h3 className="contact-title">Ready to Begin Your Journey?</h3>
                        <p className="contact-subtitle">Contact us today to book your transformative retreat experience</p>
                        <div className="contact-info-grid">
                            <div className="contact-item"><Phone size={20} /> <span>+62 361 123 4567</span></div>
                            <div className="contact-item"><Mail size={20} /> <span>hello@thedukuhretreat.com</span></div>
                            <div className="contact-item"><Instagram size={20} /> <span>@thedukuhretreat</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-grid">
                        <div className="footer-column">
                            <h4 className="footer-title">The Dukuh Retreat</h4>
                            <p className="footer-text">Your sanctuary for yoga, wellness, and spiritual growth in beautiful Bali.</p>
                        </div>
                        <div className="footer-column">
                            <h4 className="footer-title">Quick Links</h4>
                            <ul className="footer-list">
                                <li><a href="#home">Home</a></li>
                                <li><a href="#packages">Packages</a></li>
                                <li><a href="#about">About</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4 className="footer-title">Location</h4>
                            <p className="footer-text">Jalan Raya Pantai Pasut, Tabanan, Bali 82161, Indonesia</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        © 2025 The Dukuh Retreat. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}