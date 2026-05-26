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



    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyText, setReplyText] = useState('');

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const toggleReviewStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Published' ? 'Hidden' : 'Published';
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ status: newStatus })
                .eq('id', id);
            
            if (error) throw error;
            
            setReviews(reviews.map(rev =>
                rev.id === id ? { ...rev, status: newStatus } : rev
            ));
        } catch (error) {
            console.error("Error updating review status:", error);
            alert("Gagal memperbarui status ulasan.");
        }
    };

    const handleDeleteReview = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) {
            try {
                const { error } = await supabase
                    .from('reviews')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                setReviews(reviews.filter(rev => rev.id !== id));
            } catch (error) {
                console.error("Error deleting review:", error);
                alert("Gagal menghapus ulasan.");
            }
        }
    };

    const handleOpenReplyInput = (id, existingReply) => {
        setActiveReplyId(id);
        setReplyText(existingReply || '');
    };

    const handleSaveReply = async (id) => {
        if (!replyText.trim()) {
            alert("Balasan tidak boleh kosong.");
            return;
        }
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ admin_reply: replyText })
                .eq('id', id);
            
            if (error) throw error;
            
            setReviews(reviews.map(rev =>
                rev.id === id ? { ...rev, admin_reply: replyText } : rev
            ));
            setActiveReplyId(null);
            setReplyText('');
        } catch (error) {
            console.error("Error saving admin reply:", error);
            alert("Gagal menyimpan balasan.");
        }
    };

    const handleDeleteReply = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus balasan ini?")) {
            try {
                const { error } = await supabase
                    .from('reviews')
                    .update({ admin_reply: null })
                    .eq('id', id);
                
                if (error) throw error;
                
                setReviews(reviews.map(rev =>
                    rev.id === id ? { ...rev, admin_reply: null } : rev
                ));
            } catch (error) {
                console.error("Error deleting admin reply:", error);
                alert("Gagal menghapus balasan.");
            }
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
                                            <td>
                                                <strong>{rev.guestName}</strong>
                                                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                                                    {new Date(rev.created_at || rev.date).toLocaleDateString('id-ID')}
                                                </div>
                                            </td>
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
                                             <td className="review-comment-cell">
                                                 <div style={{ wordBreak: 'break-word' }}>{rev.comment}</div>
                                                 
                                                 {activeReplyId === rev.id ? (
                                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                                                         <textarea 
                                                             value={replyText} 
                                                             onChange={(e) => setReplyText(e.target.value)}
                                                             placeholder="Tulis balasan..."
                                                             style={{ 
                                                                 width: '100%', minHeight: '60px', padding: '8px', 
                                                                 borderRadius: '6px', border: '1px solid #8B7355', 
                                                                 fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none',
                                                                 resize: 'vertical'
                                                             }}
                                                         />
                                                         <div style={{ display: 'flex', gap: '8px' }}>
                                                             <button 
                                                                 onClick={() => handleSaveReply(rev.id)}
                                                                 style={{ 
                                                                     background: '#8B7355', color: '#fff', border: 'none', 
                                                                     padding: '4px 10px', borderRadius: '4px', fontSize: '11px', 
                                                                     cursor: 'pointer', fontWeight: '500' 
                                                                 }}
                                                             >
                                                                 Simpan
                                                             </button>
                                                             <button 
                                                                 onClick={() => { setActiveReplyId(null); setReplyText(''); }}
                                                                 style={{ 
                                                                     background: '#fff', color: '#6B6B6B', border: '1px solid #E8E5E0', 
                                                                     padding: '4px 10px', borderRadius: '4px', fontSize: '11px', 
                                                                     cursor: 'pointer' 
                                                                 }}
                                                             >
                                                                 Batal
                                                             </button>
                                                         </div>
                                                     </div>
                                                 ) : rev.admin_reply ? (
                                                     <div style={{ 
                                                         marginTop: '8px', padding: '8px 12px', 
                                                         background: '#FAFAF7', borderRadius: '6px', 
                                                         borderLeft: '3px solid #8B7355', fontSize: '13px',
                                                         color: '#444'
                                                     }}>
                                                         <span style={{ fontWeight: '600', color: '#8B7355', display: 'block', marginBottom: '2px' }}>Balasan Admin:</span>
                                                         <div style={{ wordBreak: 'break-word' }}>{rev.admin_reply}</div>
                                                         <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                                             <button 
                                                                 onClick={() => handleOpenReplyInput(rev.id, rev.admin_reply)}
                                                                 style={{ background: 'none', border: 'none', color: '#8B7355', fontSize: '11px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                                             >
                                                                 Edit
                                                             </button>
                                                             <button 
                                                                 onClick={() => handleDeleteReply(rev.id)}
                                                                 style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                                             >
                                                                 Hapus
                                                             </button>
                                                         </div>
                                                     </div>
                                                 ) : (
                                                     <div style={{ marginTop: '8px' }}>
                                                         <button 
                                                             onClick={() => handleOpenReplyInput(rev.id, '')}
                                                             style={{ 
                                                                 background: 'none', border: 'none', color: '#8B7355', 
                                                                 fontSize: '12px', cursor: 'pointer', padding: 0, 
                                                                 display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' 
                                                             }}
                                                         >
                                                             <MessageSquare size={14} /> Balas Ulasan
                                                         </button>
                                                     </div>
                                                 )}
                                             </td>
                                            <td>
                                                <span className={`badge ${rev.status === 'Published' ? 'success' : 'warning'}`}>
                                                    {rev.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => toggleReviewStatus(rev.id, rev.status)}
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