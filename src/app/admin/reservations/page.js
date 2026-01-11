"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, Eye, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import '../dashboard/Dashboard.css';

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
            const { data, error } = await supabase
                .from('reservations')
                .select(`
                        *,
                        guests (first_name, last_name, email, phone)
                    `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReservations(data || []);
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

    // ==========================================
    // 3. FUNGSI LOGOUT (MENGGUNAKAN SUPABASE)
    // ==========================================
    const handleLogout = async () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            await supabase.auth.signOut();
            localStorage.removeItem("isAdminAuthenticated"); // Bersihkan sisa-sisa lama
            router.push("/admin");
        }
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/packages', icon: <Package size={20} />, label: 'Kelola Packages' },
        { path: '/admin/guest-management', icon: <UserCheck size={20} />, label: 'Manajemen Tamu' },
        { path: '/admin/reservations', icon: <CalendarCheck size={20} />, label: 'Reservasi' },
        { path: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Ulasan' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Pengaturan' }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-logo">TD</div>
                    <h3>Admin Panel</h3>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                            onClick={() => router.push(item.path)}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} /> Keluar
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="main-header">
                    <h2>Daftar Reservasi</h2>
                    <div className="user-info">
                        <span>Halo, Admin</span>
                        <div className="user-avatar">A</div>
                    </div>
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
                                        <th>Kamar / Unit</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map((res) => (
                                        <tr key={res.id}>
                                            <td><strong>{res.external_id}</strong></td>
                                            <td>{res.guests?.first_name} {res.guests?.last_name}</td>
                                            <td>{res.room_name}</td>
                                            <td>
                                                <span className={`status-badge ${res.payment_status?.toLowerCase() || 'pending'}`}>
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
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data reservasi.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}