"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import './GuestDetail.css';

export default function GuestDetail({ params: paramsPromise }) {
    const router = useRouter();
    const params = use(paramsPromise);
    const id = params.id; // external_id

    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookingDetail = async () => {
            try {
                setIsLoading(true);
                // Fetch reservation + guest details
                const { data, error } = await supabase
                    .from('reservations')
                    .select(`
                        *,
                        guests (*)
                    `)
                    .eq('external_id', id)
                    .single();

                if (error) throw error;
                setBooking(data);
            } catch (err) {
                console.error("Error fetching booking detail:", err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchBookingDetail();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin mr-2" /> Loading data...
            </div>
        );
    }

    if (!booking) return (
        <div className="p-10">
            <h3>Data tidak ditemukan.</h3>
            <button className="back-btn mt-4" onClick={() => router.push('/admin/reservations')}>
                <ArrowLeft size={16} /> Kembali
            </button>
        </div>
    );

    // Format mata uang
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="detail-container">
            <header className="detail-header">
                <button className="back-btn" onClick={() => router.push('/admin/reservations')}>
                    <ArrowLeft size={20} /> Kembali
                </button>
                <h2>Detail Reservasi: {booking.external_id}</h2>
            </header>

            <div className="detail-grid">
                <section className="detail-section">
                    <h3>Guest Contact Detail</h3>
                    <div className="info-row"><label>Contact Name:</label><span>{booking.guests?.first_name} {booking.guests?.last_name}</span></div>
                    <div className="info-row"><label>Email Address:</label><span>{booking.guests?.email}</span></div>
                    <div className="info-row"><label>Country:</label><span>{booking.guests?.country}</span></div>
                    <div className="info-row"><label>Phone Number:</label><span>{booking.guests?.phone}</span></div>
                    <div className="info-row"><label>Special Request:</label><span>{booking.special_request || '-'}</span></div>
                </section>

                <section className="detail-section">
                    <h3>Reservation Detail</h3>
                    <div className="info-row"><label>Property Name:</label><span>THE DUKUH - Retreat</span></div>
                    <div className="info-row"><label>Booking ID:</label><span>{booking.external_id}</span></div>

                    {/* TAMBAHAN: Kondisional Rendering untuk Package */}
                    {booking.package_name && (
                        <div className="info-row">
                            <label>Package Name:</label>
                            <span style={{ color: '#d97706', fontWeight: 'bold' }}>{booking.package_name}</span>
                        </div>
                    )}

                    <div className="info-row">
                        <label>Booking Status:</label>
                        <span className={`badge ${booking.payment_status ? booking.payment_status.toLowerCase() : 'pending'}`}>
                            {booking.payment_status ? booking.payment_status.toUpperCase() : 'PENDING'}
                        </span>
                    </div>
                    <div className="info-row"><label>Stay Date:</label><span>{formatDate(booking.check_in)} - {formatDate(booking.check_out)} ({booking.nights} Night(s))</span></div>
                </section>
            </div>

            <div className="detail-grid full-width">
                <section className="detail-section">
                    <h3>Booking Detail</h3>
                    <div className="info-row"><label>Room Name:</label><span>{booking.room_name}</span></div>
                    <div className="info-row"><label>Room Required:</label><span>{booking.qty}</span></div>
                    <div className="info-row"><label>Other Info:</label><span>{booking.other_info || '-'}</span></div>
                </section>

                <section className="detail-section">
                    <h3>Payment Detail</h3>
                    <div className="info-row"><label>Method:</label><span className="payment-method-badge">{booking.payment_method || '-'}</span></div>
                    <div className="info-row"><label>Total Amount:</label><span className="price-text">{formatCurrency(booking.total_amount)}</span></div>
                </section>
            </div>

            <footer className="detail-actions">
                <button className="action-btn amend"><Edit3 size={16} /> Edit Reservation</button>
                <button className="action-btn secondary">Transaction Detail</button>
                <button className="action-btn noshow">Set No Show</button>
            </footer>
        </div>
    );
}