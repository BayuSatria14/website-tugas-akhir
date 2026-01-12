"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Settings,
    LogOut, MessageSquare, UserCheck, Loader2, Send, User, ChevronRight, ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
// Menggunakan Dashboard.css untuk layout utama (Sidebar & Header)
import '../dashboard/Dashboard.css';

export default function GuestManagementPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [packageGuests, setPackageGuests] = useState([]);
    const [selectedGuest, setSelectedGuest] = useState(null); // State untuk tamu yang dipilih
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

    // FUNGSI YANG BARU ANDA BERIKAN (SUDAH TERINTEGRASI)
    const handleUpdateItinerary = async (resId, newItinerary, guestEmail) => {
        if (!window.confirm("Simpan perubahan jadwal dan kirim email ke tamu?")) return;

        setIsUpdating(true);
        try {
            // 1. Simpan ke database
            const { error } = await supabase
                .from('reservations')
                .update({ itinerary: newItinerary })
                .eq('id', resId);

            if (error) throw error;

            // 2. Susun HTML Email baru sesuai permintaan Anda
            const htmlUpdate = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h3 style="color: #4f46e5;">📢 Pembaruan Jadwal Kegiatan</h3>
                    <p>Halo, terdapat perubahan pada jadwal kegiatan untuk kunjungan Anda di <b>The Dukuh Retreat</b>. Berikut jadwal terbaru Anda:</p>
                    <table width="100%" border="1" cellpadding="10" style="border-collapse: collapse; border: 1px solid #ddd;">
                        <tr style="background: #f8fafc;"><th>Hari</th><th>Aktivitas</th></tr>
                        ${newItinerary.map(i => `
                            <tr><td align="center"><b>${i.day}</b></td><td>${i.activities}</td></tr>
                        `).join('')}
                    </table>
                    <p style="margin-top: 20px;">Jika ada pertanyaan, silakan hubungi kami melalui WhatsApp.</p>
                </div>
            `;

            // 3. Panggil API Send Update
            const response = await fetch('/api/send-email-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: guestEmail,
                    subject: "UPDATE JADWAL: Kegiatan Wellness Anda",
                    html: htmlUpdate
                })
            });

            const resData = await response.json();
            if (!response.ok) throw new Error(resData.error);

            alert("Berhasil! Jadwal diupdate dan email notifikasi telah dikirim ke tamu.");
            fetchPackageGuests();
            // Setelah berhasil, tetap di halaman editor atau bisa di-null-kan jika ingin balik ke list
            // setSelectedGuest(null); 
        } catch (err) {
            alert("Gagal: " + err.message);
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
            <style jsx>{`
                .guest-list-container { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
                .guest-item-card {
                    background: white; border-radius: 12px; padding: 16px 20px;
                    display: flex; justify-content: space-between; align-items: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;
                    cursor: pointer; transition: all 0.2s ease;
                }
                .guest-item-card:hover { border-color: #4f46e5; background-color: #f9fafb; transform: translateX(4px); }
                .guest-item-info { display: flex; align-items: center; gap: 15px; }
                .avatar-small {
                    width: 40px; height: 40px; background: #4f46e510; color: #4f46e5;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                }
                .guest-text h4 { margin: 0; font-size: 15px; color: #1f2937; font-weight: 600; }
                .guest-text p { margin: 2px 0 0; font-size: 12px; color: #6b7280; }
                .back-header {
                    display: flex; align-items: center; gap: 8px; margin-bottom: 20px;
                    cursor: pointer; color: #4f46e5; font-weight: 600; font-size: 14px;
                }
                .detail-container { background: white; border-radius: 12px; padding: 24px; border: 1px solid #f0f0f0; }
                .itin-input-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 6px; }
                .itin-input-group span { font-size: 12px; font-weight: 700; color: #4f46e5; text-transform: uppercase; }
                .itin-input-group textarea {
                    width: 100%; min-height: 100px; padding: 12px; border: 1px solid #d1d5db;
                    border-radius: 8px; font-size: 14px; resize: vertical; line-height: 1.5;
                }
                .save-send-btn {
                    width: 100%; background: #4f46e5; color: white; border: none;
                    padding: 14px; border-radius: 8px; font-weight: 600;
                    display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer;
                }
                .save-send-btn:disabled { background: #9ca3af; cursor: not-allowed; }
            `}</style>

            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-logo">TD</div>
                    <h3>Admin Panel</h3>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button key={item.path} className={`nav-item ${pathname === item.path ? 'active' : ''}`} onClick={() => router.push(item.path)}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={() => router.push("/admin")}><LogOut size={20} /> Keluar</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="main-header">
                    <h2>Manajemen Tamu</h2>
                    <div className="user-info">
                        <span>Halo, Admin</span>
                        <div className="user-avatar">A</div>
                    </div>
                </header>

                <div className="content-area">
                    {isLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px' }}><Loader2 className="animate-spin" /> Memuat data...</div>
                    ) : selectedGuest ? (
                        /* EDITOR JADWAL */
                        <div>
                            <div className="back-header" onClick={() => setSelectedGuest(null)}>
                                <ArrowLeft size={18} /> Kembali ke Daftar Tamu
                            </div>
                            <div className="detail-container">
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
                                    <div className="avatar-small" style={{ width: '48px', height: '48px' }}><User size={26} /></div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{selectedGuest.guests?.first_name} {selectedGuest.guests?.last_name}</h3>
                                        <p style={{ margin: 0, color: '#6b7280' }}>{selectedGuest.package_name} • {selectedGuest.room_name}</p>
                                    </div>
                                </div>
                                <div className="itinerary-edit-section">
                                    <h5 style={{ fontSize: '14px', marginBottom: '15px' }}>EDIT JADWAL KEGIATAN</h5>
                                    {selectedGuest.itinerary?.map((item, index) => (
                                        <div key={index} className="itin-input-group">
                                            <span>Hari {item.day}</span>
                                            <textarea
                                                value={item.activities}
                                                onChange={(e) => {
                                                    const updated = [...selectedGuest.itinerary];
                                                    updated[index].activities = e.target.value;
                                                    setSelectedGuest({ ...selectedGuest, itinerary: updated });
                                                    setPackageGuests(packageGuests.map(g => g.id === selectedGuest.id ? { ...g, itinerary: updated } : g));
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <button className="save-send-btn" disabled={isUpdating} onClick={() => handleUpdateItinerary(selectedGuest.id, selectedGuest.itinerary, selectedGuest.guests?.email)}>
                                        {isUpdating ? "Mengirim..." : <><Send size={18} /> Simpan & Kirim Update</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* DAFTAR TAMU */
                        <div className="guest-list-container">
                            <h4 style={{ color: '#4b5563', fontSize: '14px' }}>Pilih tamu untuk mengatur jadwal:</h4>
                            {packageGuests.map((res) => (
                                <div key={res.id} className="guest-item-card" onClick={() => setSelectedGuest(res)}>
                                    <div className="guest-item-info">
                                        <div className="avatar-small"><User size={20} /></div>
                                        <div className="guest-text">
                                            <h4>{res.guests?.first_name} {res.guests?.last_name}</h4>
                                            <p>{res.package_name} • {res.room_name}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}