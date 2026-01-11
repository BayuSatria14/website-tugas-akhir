"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3 } from 'lucide-react';
import './GuestDetail.css';

export default function GuestDetail({ params: paramsPromise }) {
    const router = useRouter();
    const params = use(paramsPromise);
    const id = params.id;

    // Data Mock (Karena Next.js tidak mengirim state antar halaman secara native seperti react-router)
    // Dalam aplikasi asli, Anda akan melakukan fetching data berdasarkan ID
    const allBookings = [
        { id: "TDR12345678", nama: "Miss Els Van Stappen", email: "els.vanstappen@gmail.com", telp: "0032478977570", negara: "Belgium", alamat: "Antwerp, Belgium", status: "Confirmed", stayDate: "Wed, 04 Feb 2026 - Mon, 09 Feb 2026", night: 5, room: "Suite", totalCost: "9,900,000" },
        { id: "TDR98765432", nama: "Budi Santoso", email: "budi@example.com", telp: "08123456789", negara: "Indonesia", alamat: "Jakarta, Indonesia", status: "Pending", stayDate: "Fri, 10 Feb 2026 - Sun, 12 Feb 2026", night: 2, room: "Deluxe 05", totalCost: "2,500,000" },
        { id: "TDR86935425", nama: "Agak Stress", email: "begitulah@yahooo.com", telp: "08128656700", negara: "Barcelona", alamat: "Test, Barcelona", status: "Cancel", stayDate: "Fri, 10 Feb 2026 - Sun, 12 Feb 2026", night: 1, room: "Deluxe 01", totalCost: "1,750,000" }
    ];

    const booking = allBookings.find(b => b.id === id);

    if (!booking) return <div className="p-10">Data tidak ditemukan. <button onClick={() => router.push('/admin/reservations')}>Kembali</button></div>;

    return (
        <div className="detail-container">
            <header className="detail-header">
                <button className="back-btn" onClick={() => router.push('/admin/reservations')}>
                    <ArrowLeft size={20} /> Kembali
                </button>
                <h2>Detail Reservasi: {booking.id}</h2>
            </header>

            <div className="detail-grid">
                <section className="detail-section">
                    <h3>Guest Contact Detail</h3>
                    <div className="info-row"><label>Contact Name:</label><span>{booking.nama}</span></div>
                    <div className="info-row"><label>Email Address:</label><span>{booking.email}</span></div>
                    <div className="info-row"><label>Country:</label><span>{booking.negara}</span></div>
                    <div className="info-row"><label>Phone Number:</label><span>{booking.telp}</span></div>
                    <div className="info-row"><label>Address:</label><span>{booking.alamat}</span></div>
                </section>

                <section className="detail-section">
                    <h3>Reservation Detail</h3>
                    <div className="info-row"><label>Property Name:</label><span>THE DUKUH - Retreat</span></div>
                    <div className="info-row"><label>Booking ID:</label><span>{booking.id}</span></div>
                    <div className="info-row">
                        <label>Booking Status:</label>
                        <span className={`badge ${booking.status.toLowerCase()}`}>{booking.status.toUpperCase()}</span>
                    </div>
                    <div className="info-row"><label>Stay Date:</label><span>{booking.stayDate} ({booking.night} Night(s))</span></div>
                </section>
            </div>

            <div className="detail-grid full-width">
                <section className="detail-section">
                    <h3>Booking Detail</h3>
                    <div className="info-row"><label>Room Name:</label><span>{booking.room}</span></div>
                    <div className="info-row"><label>Room Required:</label><span>1</span></div>
                    <div className="info-row"><label>Occupant:</label><span>Adult: 1 | Child: 0</span></div>
                </section>

                <section className="detail-section">
                    <h3>Payment Detail</h3>
                    <div className="info-row"><label>Method:</label><span className="payment-method-badge">VISA & BANK TRANSFER</span></div>
                    <div className="info-row"><label>Cost:</label><span className="price-text">Rp {booking.totalCost}</span></div>
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