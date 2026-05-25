"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, Search, Star, Eye, Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ReviewsPage() {
    const router = useRouter();
    const pathname = usePathname();



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
        <>
            <style jsx>{`
                .ulasan-section { background: white; border-radius: 16px; padding: 32px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .section-header-flex h3 { font-family: 'Playfair Display', serif; font-size: 20px; color: #1A1A1A; margin: 0; }
                .search-box {
                    display: flex; align-items: center; gap: 10px; background: #FAFAF7;
                    padding: 10px 16px; border-radius: 10px; border: 1px solid #E8E5E0; transition: border-color 0.3s;
                }
                .search-box:focus-within { border-color: #8B7355; }
                .search-box input { border: none; background: transparent; outline: none; font-family: 'Inter', sans-serif; font-size: 14px; color: #1A1A1A; }
                .rating-stars { display: flex; gap: 2px; }
                .review-comment-cell { max-width: 300px; line-height: 1.5; color: #6B6B6B; }
                .action-btns { display: flex; gap: 8px; }
                .action-btns button {
                    background: #FAFAF7; border: 1px solid #E8E5E0; padding: 8px; border-radius: 6px; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center;
                }
                .edit-btn { color: #8B7355; }
                .edit-btn:hover { background: #8B7355; color: white; }
                .delete-btn { color: #EF4444; }
                .delete-btn:hover { background: #EF4444; color: white; border-color: #EF4444; }
                .badge.success { background: #D1FAE5; color: #059669; }
                .badge.warning { background: #FEF3C7; color: #D97706; }
            `}</style>

                <header className="main-header">
                    <h2>Ulasan</h2>
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
        </>
    );
}