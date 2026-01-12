'use client';

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, User, Mail, Phone, Globe,
    Calendar, Home, Users, AlertCircle, CreditCard
} from "lucide-react";
import "./GuestDetail.css";

export default function GuestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const idFromParams = params?.id;

    const [guest, setGuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (idFromParams) {
            fetchGuestDetail();
        }
    }, [idFromParams]);

    const fetchGuestDetail = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);

            let guestId = idFromParams;

            // Logika pendukung: Jika ID adalah Order ID (TDR...), cari UUID guest-nya terlebih dahulu
            if (idFromParams.startsWith("TDR")) {
                const { data: resData, error: resError } = await supabase
                    .from('reservations')
                    .select('guest_id')
                    .eq('external_id', idFromParams)
                    .single();

                if (resError || !resData) {
                    throw new Error("Order ID tidak ditemukan.");
                }
                guestId = resData.guest_id;
            }

            const { data, error } = await supabase
                .from('guests')
                .select(`
                    *,
                    reservations (*)
                `)
                .eq('id', guestId)
                .single();

            if (error) throw error;
            setGuest(data);
        } catch (err) {
            console.error("Detail Error:", err);
            setErrorMessage(err.message || "Gagal mengambil data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="detail-container"><p>Loading...</p></div>;

    if (errorMessage) return (
        <div className="detail-container">
            <div className="detail-section">
                <AlertCircle color="red" size={24} style={{ marginBottom: '1rem' }} />
                <p>{errorMessage}</p>
                <button onClick={() => router.back()} className="back-btn" style={{ marginTop: '1rem' }}>Back</button>
            </div>
        </div>
    );

    return (
        <div className="detail-container">
            <header className="detail-header">
                <button onClick={() => router.back()} className="back-btn">
                    <ArrowLeft size={18} /> Back
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                    Reservation Detail
                </h2>
            </header>

            <div className="detail-grid">
                {/* Section 1: Guest Information */}
                <section className="detail-section">
                    <h3>Guest Information</h3>
                    <div className="info-row">
                        <label>First Name</label>
                        <span>{guest?.first_name}</span>
                    </div>
                    <div className="info-row">
                        <label>Last Name</label>
                        <span>{guest?.last_name}</span>
                    </div>
                    <div className="info-row">
                        <label>Email Address</label>
                        <span>{guest?.email}</span>
                    </div>
                    <div className="info-row">
                        <label>Phone Number</label>
                        <span>{guest?.phone || '-'}</span>
                    </div>
                    <div className="info-row">
                        <label>Country</label>
                        <span>{guest?.country || '-'}</span>
                    </div>
                </section>

                {/* Section 2: Reservation Summary */}
                <section className="detail-section">
                    <h3>Reservation Summary</h3>
                    {guest?.reservations && guest.reservations.map((res) => (
                        <React.Fragment key={res.id}>
                            <div className="info-row">
                                <label>Status</label>
                                <span className={`badge ${res.payment_status.toLowerCase()}`}>
                                    {res.payment_status}
                                </span>
                            </div>
                            <div className="info-row">
                                <label>Order ID</label>
                                <span>{res.external_id}</span>
                            </div>
                            <div className="info-row">
                                <label>Package / Room</label>
                                <span>{res.package_name ? `${res.package_name} (${res.room_name})` : res.room_name}</span>
                            </div>
                            <div className="info-row">
                                <label>Total Guests</label>
                                <span style={{ fontWeight: '600' }}>
                                    {res.adults || 0} Adults, {res.children || 0} Children
                                </span>
                            </div>
                            <div className="info-row">
                                <label>Stay Duration</label>
                                <span>{res.check_in} to {res.check_out} ({res.nights} Nights)</span>
                            </div>
                        </React.Fragment>
                    ))}
                </section>

                {/* Section 3: Payment Detail */}
                <section className="detail-section">
                    <h3>Payment Detail</h3>
                    {guest?.reservations && guest.reservations.map((res) => (
                        <React.Fragment key={res.id}>
                            <div className="info-row">
                                <label>Payment Method</label>
                                <span className="payment-method-badge">
                                    <CreditCard size={14} style={{ marginRight: '8px' }} />
                                    {res.payment_method || 'PENDING'}
                                </span>
                            </div>
                            <div className="info-row" style={{ marginTop: '1rem' }}>
                                <label>Total Amount</label>
                                <span className="price-text">
                                    IDR {res.total_amount?.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </React.Fragment>
                    ))}
                </section>

                {/* Section 4: Additional Requirements */}
                <section className="detail-section">
                    <h3>Additional Requirements</h3>
                    {guest?.reservations && guest.reservations.map((res) => (
                        <React.Fragment key={res.id}>
                            <div className="info-row">
                                <label>Special Requests</label>
                                <span>{res.special_request || 'None'}</span>
                            </div>
                            <div className="info-row">
                                <label>Other Info</label>
                                <span>{(res.other_info || '').split('(Details:')[0].trim() || '-'}</span>
                            </div>
                        </React.Fragment>
                    ))}
                </section>
            </div>

            {/* Bottom Actions */}
            <div className="detail-actions">
                <button className="action-btn amend">Amend Booking</button>
                <button className="action-btn secondary">Print Invoice</button>
                <button className="action-btn noshow">Mark as No-Show</button>
            </div>
        </div>
    );
}