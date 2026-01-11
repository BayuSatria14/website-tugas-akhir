"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, Search, Star, Eye, Trash2
} from 'lucide-react';
import '../dashboard/Dashboard.css';

export default function ReviewsPage() {
    const router = useRouter();
    const pathname = usePathname();

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

    const [reviews, setReviews] = useState([
        { id: 1, guestName: "Miss Els Van Stappen", rating: 4, comment: "Tempat yang sangat tenang dan pelayanannya luar biasa.", date: "10 Jan 2026", status: "Published" },
        { id: 2, guestName: "Budi Santoso", rating: 2, comment: "Kamar Suite sangat luas, tapi makanan bisa lebih variatif.", date: "08 Jan 2026", status: "Published" },
        { id: 3, guestName: "Siti Aminah", rating: 5, comment: "Pengalaman wellness terbaik di Bali.", date: "05 Jan 2026", status: "Hidden" }
    ]);

    const toggleReviewStatus = (id) => {
        setReviews(reviews.map(rev =>
            rev.id === id
                ? { ...rev, status: rev.status === 'Published' ? 'Hidden' : 'Published' }
                : rev
        ));
    };

    const handleDeleteReview = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) {
            setReviews(reviews.filter(rev => rev.id !== id));
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
                    <h2>Ulasan</h2>
                    <div className="user-info">
                        <span>Halo, Admin</span>
                        <div className="user-avatar">A</div>
                    </div>
                </header>

                <div className="content-area">
                    <div className="ulasan-section">
                        <div className="section-header-flex">
                            <h3>Semua Ulasan Tamu</h3>
                            <div className="search-box">
                                <Search size={18} />
                                <input type="text" placeholder="Cari ulasan..." />
                            </div>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Tamu</th>
                                        <th>Rating</th>
                                        <th>Komentar</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((rev) => (
                                        <tr key={rev.id}>
                                            <td><strong>{rev.guestName}</strong></td>
                                            <td>
                                                <div className="rating-stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            fill={i < rev.rating ? "#f59e0b" : "none"}
                                                            stroke={i < rev.rating ? "#f59e0b" : "#cbd5e1"}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="review-comment-cell">{rev.comment}</td>
                                            <td>
                                                <span className={`badge ${rev.status === 'Published' ? 'success' : 'warning'}`}>
                                                    {rev.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => toggleReviewStatus(rev.id)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteReview(rev.id)}
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