"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, TrendingUp, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';



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
                const d = new Date();
                const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                // 1. Ambil Reservasi Terbaru (Limit 5 untuk tabel bawah) yang belum lewat tanggal checkout dan status CONFIRMED/PAID
                const { data: bookings, error: bookingError } = await supabase
                    .from('reservations')
                    .select(`
                        id, external_id, created_at, check_in, check_out, payment_status, room_name, package_name, total_amount,
                        guests (first_name, last_name)
                    `)
                    .gte('check_out', today)
                    .or('payment_status.eq.CONFIRMED,payment_status.eq.PAID')
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

                // 3. Ambil data untuk Statistik Reservasi Aktif (Total Booking & Total Tamu, Hanya CONFIRMED atau PAID)
                const { data: activeReservations, error: activeResError } = await supabase
                    .from('reservations')
                    .select('adults, children')
                    .gte('check_out', today)
                    .or('payment_status.eq.CONFIRMED,payment_status.eq.PAID');

                if (activeResError) throw activeResError;

                const totalActiveBookings = activeReservations?.length || 0;
                const totalActiveGuests = activeReservations?.reduce((sum, item) =>
                    sum + (Number(item.adults) || 0) + (Number(item.children) || 0), 0) || 0;

                // 4. Ambil data Pendapatan (Hanya CONFIRMED atau PAID, all-time)
                const { data: confirmedData, error: statsError } = await supabase
                    .from('reservations')
                    .select('total_amount')
                    .or('payment_status.eq.CONFIRMED,payment_status.eq.PAID');

                if (statsError) throw statsError;

                const totalRevenue = confirmedData?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0;

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
                    { id: 1, label: 'Total Booking', value: totalActiveBookings.toString(), icon: <CalendarCheck size={24} />, color: '#4f46e5' },
                    { id: 2, label: 'Paket Aktif', value: (activePackagesCount || 0).toString(), icon: <Package size={24} />, color: '#10b981' },
                    { id: 3, label: 'Total Tamu', value: totalActiveGuests.toString(), icon: <Users size={24} />, color: '#f59e0b' },
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



    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    return (
        <>
            <style jsx>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 40px;
                }
                .stat-card {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.04);
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                }
                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-label {
                    color: #6B6B6B;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .stat-value {
                    color: #1A1A1A;
                    font-size: 24px;
                    font-weight: 700;
                    font-family: 'Playfair Display', serif;
                    margin: 0;
                }
                .recent-activity h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px;
                    margin-bottom: 20px;
                    color: #1A1A1A;
                }
                .recent-activity {
                    background: white;
                    padding: 32px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.04);
                }
            `}</style>
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
                                            <th>Kamar</th>
                                            <th>Check In</th>
                                            <th>Check Out</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBookings.map(b => (
                                            <tr key={b.id}>
                                                <td>{b.guests?.first_name} {b.guests?.last_name}</td>
                                                <td>{b.package_name || '-'}</td>
                                                <td>{b.room_name}</td>
                                                <td>{formatDate(b.check_in)}</td>
                                                <td>{formatDate(b.check_out)}</td>
                                                <td>
                                                    <span className={`badge ${b.payment_status ? b.payment_status.toLowerCase() : 'pending'}`}>
                                                        {b.payment_status || 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {!isLoading && recentBookings.length === 0 && (
                                            <tr><td colSpan="6" className="text-center p-4">Belum ada reservasi.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
        </>
    );
}