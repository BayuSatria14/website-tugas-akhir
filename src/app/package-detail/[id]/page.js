'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, ArrowLeft, Clock, Tag, Calendar } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import './PackageDetail.css';

export default function PackageDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="loading-container"><p>Loading details...</p></div>;

    if (!selectedPackage) {
        return (
            <div className="error-container">
                <h2>Package Not Found</h2>
                <button onClick={() => router.push('/home')}>Back to Home</button>
            </div>
        );
    }

    return (
        <div className="detail-page">
            <header className="detail-nav">
                <div className="nav-container">
                    <button onClick={() => router.push('/home')} className="back-btn">
                        <ArrowLeft size={20} /> Back to Home
                    </button>
                </div>
            </header>

            <main className="detail-container">
                {/* Bagian Atas: Gambar dan Info Utama */}
                <div className="detail-grid">
                    <div className="detail-image-section">
                        <img src={selectedPackage.image_url} alt={selectedPackage.title} className="main-detail-img" />
                    </div>

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
                                Rp {selectedPackage.price?.toLocaleString('id-ID')} <span className="per-person">/ Person</span>
                            </p>
                        </div>

                        <div className="detail-description">
                            <h3>About this package</h3>
                            <p>{selectedPackage.description}</p>
                        </div>

                        <div className="detail-includes">
                            <h3>What's Included</h3>
                            <ul className="include-list">
                                {selectedPackage.features?.split(',').map((item, index) => (
                                    <li key={index}>
                                        <Check size={18} className="check-icon" /> {item.trim()}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            className="confirm-booking-btn"
                            onClick={() => {
                                // Support both "Night" and "Malam" for duration parsing
                                const match = selectedPackage.duration.match(/(\d+)\s*(?:Night|Malam)/i);
                                const nights = match ? match[1] : 1;
                                router.push(`/booking-page/${selectedPackage.id}?nights=${nights}`);
                            }}
                        >
                            Book This Package Now
                        </button>
                    </div>
                </div>

                {/* Bagian Bawah: Itinerary Menyamping */}
                <div className="itinerary-full-width">
                    <div className="itinerary-header">
                        <h3><Calendar size={22} style={{ marginRight: '10px' }} /> Jadwal Kegiatan (Itinerary)</h3>
                        <p>Rincian aktivitas harian Anda selama program wellness</p>
                    </div>

                    <div className="itinerary-grid-horizontal">
                        {selectedPackage.itinerary?.map((item, index) => (
                            <div key={index} className="itinerary-day-card">
                                <div className="day-circle">Day {item.day}</div>
                                <div className="activities-content">
                                    <p style={{ whiteSpace: 'pre-line' }}>{item.activities}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}