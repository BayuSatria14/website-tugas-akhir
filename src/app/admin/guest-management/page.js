"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Settings,
    LogOut, MessageSquare, UserCheck, Loader2, Send, User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
// Menggunakan Dashboard.css untuk layout utama (Sidebar & Header)
import '../dashboard/Dashboard.css';

export default function GuestManagementPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [packageGuests, setPackageGuests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchPackageGuests();
    }, []);

    const fetchPackageGuests = async () => {
        setIsLoading(true);
        try {
            // Ambil hanya yang booking paket (package_name not null) dan status CONFIRMED atau PAID
            const { data, error } = await supabase
                .from('reservations')
                .select('*, guests(*)')
                .not('package_name', 'is', null)
                .or('payment_status.eq.CONFIRMED,payment_status.eq.PAID')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPackageGuests(data || []);
        } catch (err) {
            console.error("Error:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateItinerary = async (resId, newItinerary, guestEmail) => {
        if (!window.confirm("Simpan perubahan jadwal dan kirim email notifikasi ke tamu?")) return;

        setIsUpdating(true);
        try {
            // 1. Update ke Database
            const { error } = await supabase
                .from('reservations')
                .update({ itinerary: newItinerary })
                .eq('id', resId);

            if (error) throw error;

            // 2. Kirim email update real-time
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #4f46e5;">Pembaruan Jadwal Kegiatan</h2>
                    <p>Halo, terdapat perubahan pada jadwal kegiatan paket Anda. Berikut adalah jadwal terbaru Anda:</p>
                    <table width="100%" style="border-collapse: collapse; margin-top: 20px;">
                        ${newItinerary.map(i => `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 80px;">Hari ${i.day}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.activities}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <p style="margin-top: 20px;">Sampai jumpa di The Dukuh Retreat!</p>
                </div>
            `;

            await fetch('/api/send-email-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: guestEmail, subject: "Update Jadwal Kegiatan - The Dukuh Retreat", html: emailContent })
            });

            alert("Jadwal berhasil diperbarui & Email terkirim!");
            fetchPackageGuests();
        } catch (err) {
            alert("Gagal update: " + err.message);
        } finally {
            setIsUpdating(false);
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

    return (
        <div className="admin-container">
            {/* INLINE STYLES UNTUK GUEST MANAGEMENT */}
            <style jsx>{`
                .guest-list-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
                    gap: 25px;
                    margin-top: 20px;
                }
                .guest-card-itinerary {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    border: 1px solid #f0f0f0;
                }
                .guest-info-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .avatar-circle {
                    width: 45px;
                    height: 45px;
                    background: #4f46e520;
                    color: #4f46e5;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .guest-meta h4 { margin: 0; color: #1f2937; font-size: 16px; }
                .guest-meta p { margin: 2px 0 0; color: #6b7280; font-size: 13px; }
                
                .itinerary-edit-section h5 {
                    font-size: 14px;
                    color: #374151;
                    margin-bottom: 15px;
                    font-weight: 600;
                }
                .itin-input-group {
                    margin-bottom: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .itin-input-group span {
                    font-size: 12px;
                    font-weight: 600;
                    color: #4f46e5;
                    text-transform: uppercase;
                }
                .itin-input-group textarea {
                    width: 100%;
                    min-height: 80px;
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    resize: vertical;
                    transition: border-color 0.2s;
                }
                .itin-input-group textarea:focus {
                    outline: none;
                    border-color: #4f46e5;
                    ring: 2px solid #4f46e520;
                }
                .save-send-btn {
                    width: 100%;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    margin-top: 10px;
                    transition: background 0.2s;
                }
                .save-send-btn:hover { background: #4338ca; }
                .save-send-btn:disabled { background: #9ca3af; cursor: not-allowed; }

                @media (max-width: 768px) {
                    .guest-list-grid { grid-template-columns: 1fr; }
                }
            `}</style>

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
                    <button className="logout-btn" onClick={() => router.push("/admin")}>
                        <LogOut size={20} /> Keluar
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="main-header">
                    <h2>Manajemen Tamu (Wellness Package)</h2>
                    <div className="user-info">
                        <span>Halo, Admin</span>
                        <div className="user-avatar">A</div>
                    </div>
                </header>

                <div className="content-area">
                    {isLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px' }}>
                            <Loader2 className="animate-spin" /> <span>Memuat data tamu...</span>
                        </div>
                    ) : (
                        <div className="guest-list-grid">
                            {packageGuests.map((res) => (
                                <div key={res.id} className="guest-card-itinerary">
                                    <div className="guest-info-header">
                                        <div className="avatar-circle">
                                            <User size={24} />
                                        </div>
                                        <div className="guest-meta">
                                            <h4>{res.guests?.first_name} {res.guests?.last_name}</h4>
                                            <p>{res.package_name} • {res.room_name}</p>
                                        </div>
                                    </div>

                                    <div className="itinerary-edit-section">
                                        <h5>JADWAL KEGIATAN TAMU</h5>
                                        {res.itinerary && Array.isArray(res.itinerary) ? (
                                            res.itinerary.map((item, index) => (
                                                <div key={index} className="itin-input-group">
                                                    <span>Hari {item.day}</span>
                                                    <textarea
                                                        value={item.activities}
                                                        onChange={(e) => {
                                                            const updated = [...res.itinerary];
                                                            updated[index].activities = e.target.value;
                                                            setPackageGuests(packageGuests.map(g => g.id === res.id ? { ...g, itinerary: updated } : g));
                                                        }}
                                                        placeholder={`Masukkan kegiatan hari ke-${item.day}...`}
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ fontSize: '13px', color: '#ef4444' }}>Data jadwal tidak ditemukan untuk reservasi ini.</p>
                                        )}

                                        <button
                                            className="save-send-btn"
                                            disabled={isUpdating || !res.itinerary}
                                            onClick={() => handleUpdateItinerary(res.id, res.itinerary, res.guests?.email)}
                                        >
                                            {isUpdating ? "Memproses..." : <><Send size={18} /> Simpan & Kirim Update</>}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {packageGuests.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px', gridColumn: '1/-1' }}>
                                    <p style={{ color: '#6b7280' }}>Tidak ada tamu paket yang sudah melakukan pembayaran.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}