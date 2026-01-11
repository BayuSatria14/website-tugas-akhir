"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, Eye
} from 'lucide-react';
import '../dashboard/Dashboard.css';

export default function ReservationsPage() {
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

    const [allBookings] = useState([
        { id: "TDR12345678", nama: "Miss Els Van Stappen", email: "els.vanstappen@gmail.com", telp: "0032478977570", negara: "Belgium", alamat: "Antwerp, Belgium", status: "Confirmed", stayDate: "Wed, 04 Feb 2026 - Mon, 09 Feb 2026", night: 5, room: "Suite", totalCost: "9,900,000" },
        { id: "TDR98765432", nama: "Budi Santoso", email: "budi@example.com", telp: "08123456789", negara: "Indonesia", alamat: "Jakarta, Indonesia", status: "Pending", stayDate: "Fri, 10 Feb 2026 - Sun, 12 Feb 2026", night: 2, room: "Deluxe 05", totalCost: "2,500,000" },
        { id: "TDR86935425", nama: "Agak Stress", email: "begitulah@yahooo.com", telp: "08128656700", negara: "Barcelona", alamat: "Test, Barcelona", status: "Cancel", stayDate: "Fri, 10 Feb 2026 - Sun, 12 Feb 2026", night: 1, room: "Deluxe 01", totalCost: "1,750,000" }
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
                    <h2>Reservasi</h2>
                    <div className="user-info">
                        <span>Halo, Admin</span>
                        <div className="user-avatar">A</div>
                    </div>
                </header>

                <div className="content-area">
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Nama Tamu</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td><strong>{booking.id}</strong></td>
                                        <td>{booking.nama}</td>
                                        <td>{booking.email}</td>
                                        <td>
                                            <span className={`badge ${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="view-btn"
                                                onClick={() => router.push(`/admin/guest-detail/${booking.id}`)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}