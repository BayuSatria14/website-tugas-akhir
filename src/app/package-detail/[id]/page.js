'use client';

import { useRouter, useParams } from 'next/navigation';
import { Check, ArrowLeft, Clock, Tag } from 'lucide-react';
import './PackageDetail.css';

// Data harus sama dengan yang ada di HomePage agar sinkron
const packagesData = [
    {
        id: 1,
        title: "Weekend Yoga Retreat",
        duration: "3 Days 2 Night",
        price: "Rp 2,500,000",
        numericPrice: 2500000,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
        description: "Nikmati akhir pekan yang menenangkan dengan sesi yoga intensif dan meditasi di tengah alam Bali yang asri.",
        includes: ["2 Yoga Sessions", "Accommodation", "Healthy Meals", "Meditation Class"]
    },
    {
        id: 2,
        title: "Ultimate Wellness Package",
        duration: "5 Days 4 Nights",
        price: "Rp 8,500,000",
        numericPrice: 8500000,
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
        description: "Paket lengkap untuk transformasi diri. Termasuk perawatan spa, konsultasi privat, dan diet sehat organik.",
        includes: ["Daily Yoga", "Spa Treatment", "Detox Meals", "Nature Walk", "Private Consultation"]
    },
    {
        id: 3,
        title: "Day Pass Experience",
        duration: "2 Day 1 Nights",
        price: "Rp 750,000",
        numericPrice: 750000,
        image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
        description: "Ingin mencoba suasana kami? Paket singkat ini memberikan akses penuh ke fasilitas kolam renang dan kelas yoga harian.",
        includes: ["1 Yoga Class", "Healthy Lunch", "Pool Access", "Garden Tour"]
    }
];

export default function PackageDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    // Mencari data paket berdasarkan ID dari URL
    const selectedPackage = packagesData.find((pkg) => pkg.id === parseInt(id));

    // Jika ID tidak ditemukan, tampilkan pesan error sederhana atau redirect
    if (!selectedPackage) {
        return (
            <div className="error-container">
                <h2>Package Not Found</h2>
                <button onClick={() => router.push('/homepage')}>Back to Home</button>
            </div>
        );
    }

    return (
        <div className="detail-page">
            <header className="detail-nav">
                <div className="nav-container">
                    <button onClick={() => router.push('/homepage')} className="back-btn">
                        <ArrowLeft size={20} /> Back to Home
                    </button>
                </div>
            </header>

            <main className="detail-container">
                <div className="detail-grid">
                    {/* Image Section */}
                    <div className="detail-image-section">
                        <img
                            src={selectedPackage.image}
                            alt={selectedPackage.title}
                            className="main-detail-img"
                        />
                    </div>

                    {/* Info Section */}
                    <div className="detail-info-section">
                        <div className="badge-row">
                            <span className="category-badge">YOGA & WELLNESS</span>
                            <span className="duration-badge">
                                <Clock size={14} style={{ marginRight: '4px' }} />
                                {selectedPackage.duration}
                            </span>
                        </div>

                        <h1 className="detail-title">{selectedPackage.title}</h1>

                        <div className="price-tag">
                            <Tag size={20} className="price-icon" />
                            <p className="detail-price">
                                {selectedPackage.price} <span className="per-person">/ Person</span>
                            </p>
                        </div>

                        <div className="detail-description">
                            <h3>About this package</h3>
                            <p>{selectedPackage.description}</p>
                        </div>

                        <div className="detail-includes">
                            <h3>What's Included</h3>
                            <ul className="include-list">
                                {selectedPackage.includes.map((item, index) => (
                                    <li key={index}>
                                        <Check size={18} className="check-icon" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            className="confirm-booking-btn"
                            onClick={() => router.push(`/booking-page/${selectedPackage.id}`)}
                        >
                            Book This Package Now
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}