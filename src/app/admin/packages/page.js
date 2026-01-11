"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, Plus, Edit, Trash2
} from 'lucide-react';
import '../dashboard/Dashboard.css';

export default function PackagesPage() {
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

    const [packages, setPackages] = useState([
        { id: 1, title: "Weekend Yoga Retreat", price: "Rp 2,500,000", status: "Active" },
        { id: 2, title: "Ultimate Wellness Package", price: "Rp 8,500,000", status: "Active" },
        { id: 3, title: "Day Pass Experience", price: "Rp 750,000", status: "Active" }
    ]);

    const handleAddPackage = () => {
        alert("Fitur tambah paket akan segera hadir!");
    };

    const handleEditPackage = (id) => {
        alert(`Edit paket ID: ${id}`);
    };

    const handleDeletePackage = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
            setPackages(packages.filter(pkg => pkg.id !== id));
        }
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
                    <h2>Kelola Packages</h2>
                    <div className="user-info">
                        <span>Halo, Admin</span>
                        <div className="user-avatar">A</div>
                    </div>
                </header>

                <div className="content-area">
                    <div className="packages-overview-section">
                        <div className="section-header-with-button">
                            <h3>Daftar Paket Wellness</h3>
                            <button className="add-btn" onClick={handleAddPackage}>
                                <Plus size={20} /> Tambah Paket
                            </button>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Nama Paket</th>
                                        <th>Harga</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {packages.map((pkg) => (
                                        <tr key={pkg.id}>
                                            <td><strong>{pkg.title}</strong></td>
                                            <td className="price-text">{pkg.price}</td>
                                            <td>
                                                <span className="badge success">{pkg.status}</span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => handleEditPackage(pkg.id)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeletePackage(pkg.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
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