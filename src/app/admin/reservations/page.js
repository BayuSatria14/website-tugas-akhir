"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, Eye, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ReservationsPage() {
    const router = useRouter();
    const pathname = usePathname();

    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ==========================================
    // 1. FUNGSI AMBIL DATA (FETCH)
    // ==========================================
    const fetchReservations = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/reservations?filter=recent_all');
            const result = await res.json();
            
            if (!result.success) throw new Error(result.error);
            setReservations(result.data || []);
        } catch (err) {
            console.error("Error fetching data:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // 2. USE EFFECT (Dijalankan saat halaman dimuat)
    // ==========================================
    useEffect(() => {
        // Pengecekan auth dilakukan oleh Middleware, 
        // jadi kita cukup fokus mengambil data saja.
        fetchReservations();
    }, [router]);



    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <>
            <style jsx>{`
                .loading-state { padding: 40px; text-align: center; color: #6B6B6B; display: flex; align-items: center; justify-content: center; gap: 12px; }
                .view-btn {
                    background: #FAFAF7; color: #8B7355; border: 1px solid #E8E5E0;
                    padding: 8px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
                    transition: all 0.3s;
                }
                .view-btn:hover { background: #8B7355; color: white; }
            `}</style>

            <header className="main-header">
                <h2>Daftar Reservasi</h2>
            </header>

            <div className="content-area">
                <div className="admin-table-container">
                    {isLoading ? (
                        <div className="loading-state">
                            <Loader2 className="animate-spin" /> Mengambil data...
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Nama Tamu</th>
                                    <th>Paket</th>
                                    <th>Kamar</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((res) => (
                                    <tr key={res.id}>
                                        <td><strong>{res.external_id}</strong></td>
                                        <td>{res.guests?.first_name} {res.guests?.last_name}</td>
                                        <td>{res.package_name || '-'}</td>
                                        <td>{res.room_name}</td>
                                        <td>
                                            <span className={`badge ${res.payment_status?.toLowerCase() || 'pending'}`}>
                                                {res.payment_status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="view-btn"
                                                onClick={() => router.push(`/admin/guest-detail/${res.external_id}`)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {reservations.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data reservasi.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}