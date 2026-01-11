"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, TrendingUp
} from 'lucide-react';
import './Dashboard.css';

export default function DashboardPage() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const auth = localStorage.getItem("isAdminAuthenticated");
        if (auth !== "true") {
            router.push("/admin");
        }
    }, [router]);

    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
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

    const stats = [
        { id: 1, label: 'Total Booking', value: '128', icon: <CalendarCheck size={24} />, color: '#4f46e5' },
        { id: 2, label: 'Paket Aktif', value: '5', icon: <Package size={24} />, color: '#10b981' },
        { id: 3, label: 'Total Tamu', value: '542', icon: <Users size={24} />, color: '#f59e0b' },
        { id: 4, label: 'Pendapatan', value: 'Rp 45jt', icon: <TrendingUp size={24} />, color: '#ec4899' },
    ];

    const [allBookings] = useState([
        { id: "TDR12345678", nama: "Miss Els Van Stappen", status: "Confirmed", stayDate: "Wed, 04 Feb 2026 - Mon, 09 Feb 2026", room: "Suite" },
        { id: "TDR98765432", nama: "Budi Santoso", status: "Pending", stayDate: "Fri, 10 Feb 2026 - Sun, 12 Feb 2026", room: "Deluxe 05" },
        { id: "TDR86935425", nama: "Agak Stress", status: "Cancel", stayDate: "Fri, 10 Feb 2026 - Sun, 12 Feb 2026", room: "Deluxe 01" }
    ]);

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
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Nama Tamu</th>
                                        <th>Paket</th>
                                        <th>Checkin - Checkout</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allBookings.map(b => (
                                        <tr key={b.id}>
                                            <td>{b.nama}</td>
                                            <td>{b.room}</td>
                                            <td>{b.stayDate}</td>
                                            <td>
                                                <span className={`badge ${b.status.toLowerCase()}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}