'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, Check, Star, Phone, Mail, Instagram } from "lucide-react";
import "./Homepage.css";

export default function HomePage() {
    const router = useRouter();

    const [searchData, setSearchData] = useState({
        checkIn: "",
        checkOut: "",
        guests: 1
    });

    const [showFavoriteMessage, setShowFavoriteMessage] = useState(null);

    const packages = [
        {
            id: 1,
            title: "Weekend Yoga Retreat",
            duration: "3 Days 2 Night",
            price: "Rp 2,500,000",
            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
            includes: ["2 Yoga Sessions", "Accommodation", "Healthy Meals", "Meditation Class"]
        },
        {
            id: 2,
            title: "Ultimate Wellness Package",
            duration: "5 Days 4 Nights",
            price: "Rp 8,500,000",
            image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
            includes: ["Daily Yoga", "Spa Treatment", "Detox Meals", "Nature Walk", "Private Consultation"],
            isFavorite: true
        },
        {
            id: 3,
            title: "Day Pass Experience",
            duration: "2 Day 1 Nights",
            price: "Rp 750,000",
            image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
            includes: ["1 Yoga Class", "Healthy Lunch", "Pool Access", "Garden Tour"]
        }
    ];

    const features = [
        "Authentic Balinese Experience",
        "Professional Yoga Instructors",
        "Organic Farm-to-Table Meals",
        "Peaceful Natural Setting"
    ];

    const handleFavoriteClick = (packageId) => {
        setShowFavoriteMessage(packageId);
        setTimeout(() => setShowFavoriteMessage(null), 3000);
    };

    const handleCheckInChange = (e) => {
        const newCheckInDate = e.target.value;
        let newCheckOutDate = "";
        if (newCheckInDate) {
            const checkInDate = new Date(newCheckInDate + 'T00:00:00');
            checkInDate.setDate(checkInDate.getDate() + 1);
            const year = checkInDate.getFullYear();
            const month = String(checkInDate.getMonth() + 1).padStart(2, '0');
            const day = String(checkInDate.getDate()).padStart(2, '0');
            newCheckOutDate = `${year}-${month}-${day}`;
        }
        setSearchData({
            ...searchData,
            checkIn: newCheckInDate,
            checkOut: newCheckOutDate
        });
    };

    const handleSearch = () => {
        if (!searchData.checkIn || !searchData.checkOut) {
            alert("Please select Check In and Check Out dates");
            return;
        }
        const query = new URLSearchParams({
            checkIn: searchData.checkIn,
            checkOut: searchData.checkOut,
            guests: searchData.guests
        }).toString();
        router.push(`/booking-page/custom?${query}`);
    };

    return (
        <div className="homepage">
            {/* HEADER / NAVBAR */}
            <header className="navbar">
                <div className="navbar-container">
                    <div className="navbar-content">
                        <div className="logo-section">
                            <div className="logo-box">
                                <span className="logo-text">TD</span>
                            </div>
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
                        <button className="book-btn" onClick={() => router.push('/booking-page/custom?reset=true')}>Book Now</button>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-background"></div>
                <div className="hero-content">
                    <h2 className="hero-title">Discover Your Inner Peace</h2>
                    <p className="hero-subtitle">Unplug. De-stress. Recharge at Bali's Premier Yoga Retreat</p>

                    <div className="search-box">
                        <div className="search-grid">
                            <div className="search-item">
                                <div className="search-input-wrapper">
                                    <label className="search-label">Check In</label>
                                    <input
                                        type="date"
                                        required
                                        className="search-input date-input"
                                        value={searchData.checkIn}
                                        onChange={handleCheckInChange}
                                    />
                                </div>
                            </div>
                            <div className="search-item">
                                <div className="search-input-wrapper">
                                    <label className="search-label">Check Out</label>
                                    <input
                                        type="date"
                                        required
                                        className="search-input date-input"
                                        value={searchData.checkOut}
                                        onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="search-item">
                                <Users className="search-icon" size={24} />
                                <div className="search-input-wrapper">
                                    <label className="search-label">Guests</label>
                                    <select
                                        className="search-input"
                                        value={searchData.guests}
                                        onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
                                    >
                                        <option value="1">1 Guest</option>
                                        <option value="2">2 Guests</option>
                                    </select>
                                </div>
                            </div>
                            <button className="search-btn" onClick={handleSearch}>
                                <Search size={20} />
                                <span>Search</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
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

            {/* PACKAGES SECTION */}
            <section id="packages" className="packages-section">
                <div className="packages-container">
                    <div className="packages-header">
                        <h3 className="packages-title">Our Yoga Retreat Packages</h3>
                        <p className="packages-subtitle">Choose from our carefully curated packages designed to rejuvenate your mind, body, and soul</p>
                    </div>
                    <div className="packages-grid">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className="package-card">
                                <div className="package-image-wrapper">
                                    <img src={pkg.image} alt={pkg.title} className="package-image" />
                                    <div className="package-meta-top">
                                        <div
                                            className="package-favorite-container"
                                            onClick={pkg.isFavorite ? () => handleFavoriteClick(pkg.id) : undefined}
                                        >
                                            {pkg.isFavorite && (
                                                <>
                                                    <Star className="star-icon" size={16} fill="#fbbf24" />
                                                    {showFavoriteMessage === pkg.id && (
                                                        <span className="favorite-message">Paling Sering Dipesan!</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="package-duration">
                                            <span>{pkg.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="package-content">
                                    <h4 className="package-title">{pkg.title}</h4>
                                    <p className="package-price">{pkg.price}</p>
                                    <div className="package-includes">
                                        {pkg.includes.map((item, idx) => (
                                            <div key={idx} className="package-include-item">
                                                <Check className="include-icon" size={18} />
                                                <span className="include-text">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className="package-btn"
                                        onClick={() => router.push(`/package-detail/${pkg.id}`)}
                                    >
                                        Book This Package
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section id="about" className="about-section">
                <div className="about-container">
                    <div className="about-grid">
                        <div className="about-text">
                            <h3 className="about-title">Welcome to The Dukuh Retreat</h3>
                            <p className="about-description">
                                Nestled in the heart of Bali's lush landscapes, The Dukuh Retreat offers an authentic sanctuary for those seeking peace, wellness, and spiritual growth.
                            </p>
                            <p className="about-description">
                                Our experienced instructors guide you through transformative yoga practices, while our eco-friendly accommodations and organic cuisine nourish your body and soul.
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
                                    <div className="stat-label">
                                        <Star className="star-icon" size={16} />
                                        Rating
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="about-images">
                            <img
                                src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80"
                                alt="Yoga class"
                                className="about-img img1"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80"
                                alt="Meditation"
                                className="about-img img2"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1540206276207-3af25c08abc4?w=600&q=80"
                                alt="Accommodation"
                                className="about-img img3"
                            />
                            <img
                                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80"
                                alt="Healthy food"
                                className="about-img img4"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section id="contact" className="contact-section">
                <div className="contact-container">
                    <h3 className="contact-title">Ready to Begin Your Journey?</h3>
                    <p className="contact-subtitle">
                        Contact us today to book your transformative retreat experience
                    </p>

                    <div className="contact-info">
                        <div className="contact-item">
                            <Phone size={24} />
                            <span>+62 361 123 4567</span>
                        </div>
                        <div className="contact-item">
                            <Mail size={24} />
                            <span>hello@thedukuhretreat.com</span>
                        </div>
                        <div className="contact-item">
                            <Instagram size={24} />
                            <span>@thedukuhretreat</span>
                        </div>
                    </div>

                    <button className="contact-btn">Book Your Retreat Now</button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-grid">
                        <div className="footer-column">
                            <h4 className="footer-title">The Dukuh Retreat</h4>
                            <p className="footer-text">
                                Your sanctuary for yoga, wellness, and spiritual growth in beautiful Bali.
                            </p>
                        </div>
                        <div className="footer-column">
                            <h4 className="footer-title">Quick Links</h4>
                            <ul className="footer-list">
                                <li><a href="#home">Home</a></li>
                                <li><a href="#packages">Packages</a></li>
                                <li><a href="#about">About</a></li>
                                <li><a href="#contact">Contact</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4 className="footer-title">Our Services</h4>
                            <ul className="footer-list">
                                <li><a href="#yoga">Yoga Classes</a></li>
                                <li><a href="#meditation">Meditation Sessions</a></li>
                                <li><a href="#wellness">Wellness Programs</a></li>
                                <li><a href="#accomodation">Accommodation</a></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4 className="footer-title">Location</h4>
                            <p className="footer-text">
                                Jalan Raya Pantai Pasut<br />
                                Tabanan, Bali 82161<br />
                                Indonesia
                            </p>
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