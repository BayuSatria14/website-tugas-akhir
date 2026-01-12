"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, TrendingUp, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import './Dashboard.css';

export default function DashboardPage() {
    const router = useRouter();
    const pathname = usePathname();

    const [recentBookings, setRecentBookings] = useState([]);
    const [stats, setStats] = useState([
        { id: 1, label: 'Total Booking', value: '0', icon: <CalendarCheck size={24} />, color: '#4f46e5' },
        { id: 2, label: 'Paket Aktif', value: '0', icon: <Package size={24} />, color: '#10b981' },
        { id: 3, label: 'Total Tamu', value: '0', icon: <Users size={24} />, color: '#f59e0b' },
        { id: 4, label: 'Pendapatan', value: 'Rp 0', icon: <TrendingUp size={24} />, color: '#ec4899' },
    ]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminSession = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/admin");
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            if (profile?.role !== 'admin') {
                router.push("/home");
                return;
            }

            await fetchDashboardData();
        };

        const fetchDashboardData = async () => {
            try {
                // 1. Ambil Reservasi Terbaru (Limit 5 untuk tabel bawah)
                const { data: bookings, error: bookingError } = await supabase
                    .from('reservations')
                    .select(`
                        id, external_id, created_at, check_in, check_out, payment_status, room_name, total_amount,
                        guests (first_name, last_name)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (bookingError) throw bookingError;
                setRecentBookings(bookings || []);

                // 2. Hitung Paket Aktif (Terintegrasi dengan tabel packages status 'Active')
                const { count: activePackagesCount, error: pkgError } = await supabase
                    .from('packages')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'Active');

                if (pkgError) throw pkgError;

                // 3. Ambil data untuk Statistik (Hanya CONFIRMED atau PAID)
                // Kita ambil kolom total_amount, adults, dan children untuk kalkulasi
                const { data: confirmedData, error: statsError } = await supabase
                    .from('reservations')
                    .select('total_amount, adults, children')
                    .or('payment_status.eq.CONFIRMED,payment_status.eq.PAID');

                if (statsError) throw statsError;

                // Kalkulasi data confirmed
                const totalConfirmedBookings = confirmedData?.length || 0;
                const totalRevenue = confirmedData?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0;
                // Total Tamu = Penjumlahan kolom adults + children dari semua booking confirmed
                const totalGuests = confirmedData?.reduce((sum, item) =>
                    sum + (Number(item.adults) || 0) + (Number(item.children) || 0), 0) || 0;

                // Fungsi format Rupiah yang rapi
                const formatCurrency = (val) => {
                    return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(val);
                };

                // Update state stats
                setStats([
                    { id: 1, label: 'Total Booking', value: totalConfirmedBookings.toString(), icon: <CalendarCheck size={24} />, color: '#4f46e5' },
                    { id: 2, label: 'Paket Aktif', value: (activePackagesCount || 0).toString(), icon: <Package size={24} />, color: '#10b981' },
                    { id: 3, label: 'Total Tamu', value: totalGuests.toString(), icon: <Users size={24} />, color: '#f59e0b' },
                    { id: 4, label: 'Pendapatan', value: formatCurrency(totalRevenue), icon: <TrendingUp size={24} />, color: '#ec4899' },
                ]);

            } catch (error) {
                console.error("Error fetching dashboard data:", error.message || error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminSession();
    }, [router]);

    const handleLogout = async () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            await supabase.auth.signOut();
            localStorage.removeItem("isAdminAuthenticated");
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
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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
                    <h2>Dashboard</h2>
                    <div className="user-info">
                        <span>Halo, Admin</span>
                        <div className="user-avatar">A</div>
                    </div>
                </header>

                <div className="content-area">
                    <div className="stats-grid">
                        {stats.map(stat => (
                            <div key={stat.id} className="stat-card">
                                <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div className="stat-details">
                                    <p className="stat-label">{stat.label}</p>
                                    <h3 className="stat-value">{stat.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="recent-activity">
                        <h3>Reservasi Terbaru</h3>
                        <div className="admin-table-container">
                            {isLoading ? (
                                <div className="p-4 flex items-center gap-2">
                                    <Loader2 className="animate-spin" /> Load Data...
                                </div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Nama Tamu</th>
                                            <th>Paket</th>
                                            <th>Checkin</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBookings.map(b => (
                                            <tr key={b.id}>
                                                <td>{b.guests?.first_name} {b.guests?.last_name}</td>
                                                <td>{b.room_name}</td>
                                                <td>{formatDate(b.check_in)} - {formatDate(b.check_out)}</td>
                                                <td>
                                                    <span className={`badge ${b.payment_status ? b.payment_status.toLowerCase() : 'pending'}`}>
                                                        {b.payment_status || 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {!isLoading && recentBookings.length === 0 && (
                                            <tr><td colSpan="4" className="text-center p-4">Belum ada reservasi.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}