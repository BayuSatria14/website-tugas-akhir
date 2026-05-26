"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Settings,
    LogOut, MessageSquare, UserCheck, Loader2, Send, User, ChevronRight, ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
            // Format hari ini untuk perbandingan filter otomatis
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            // Ambil hanya yang booking paket (package_name not null), status CONFIRMED/PAID
            // dan check_out >= hari ini (otomatis menghapus/menyembunyikan data masa lalu)
            const { data, error } = await supabase
                .from('reservations')
                .select('*, guests(*)')
                .not('package_name', 'is', null)
                .gte('check_out', today)
                .or('payment_status.eq.CONFIRMED,payment_status.eq.PAID')
                .order('check_in', { ascending: true });

            if (error) throw error;
            setPackageGuests(data || []);
        } catch (err) {
            console.error("Error:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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

    return (
        <>
            <style jsx>{`
                .guest-list-container { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
                .guest-item-card {
                    background: white; border-radius: 12px; padding: 20px 24px;
                    display: flex; justify-content: space-between; align-items: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04);
                    cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s;
                }
                .guest-item-card:hover { border-color: #8B7355; box-shadow: 0 12px 30px rgba(0,0,0,0.06); transform: translateY(-4px); }
                .guest-item-info { display: flex; align-items: center; gap: 16px; }
                .avatar-small {
                    width: 48px; height: 48px; background: rgba(139,115,85,0.1); color: #8B7355;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                }
                .guest-text h4 { margin: 0; font-size: 16px; color: #1A1A1A; font-weight: 600; font-family: 'Playfair Display', serif; }
                .guest-text p { margin: 4px 0 0; font-size: 13px; color: #6B6B6B; }
                .back-header {
                    display: flex; align-items: center; gap: 8px; margin-bottom: 24px;
                    cursor: pointer; color: #6B6B6B; font-weight: 600; font-size: 14px; text-transform: uppercase;
                    transition: color 0.3s;
                }
                .back-header:hover { color: #8B7355; }
                .detail-container { background: white; border-radius: 16px; padding: 32px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                .itin-input-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
                .itin-input-group span { font-size: 13px; font-weight: 600; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.5px; }
                .itin-input-group textarea {
                    width: 100%; min-height: 100px; padding: 14px; border: 1px solid #E8E5E0;
                    border-radius: 10px; font-size: 14px; resize: vertical; line-height: 1.6;
                    font-family: 'Inter', sans-serif; transition: border-color 0.3s; outline: none;
                }
                .itin-input-group textarea:focus { border-color: #8B7355; }
                .save-send-btn {
                    width: 100%; background: #1A1A1A; color: white; border: none;
                    padding: 16px; border-radius: 10px; font-weight: 600; letter-spacing: 0.5px;
                    display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer;
                    transition: background 0.3s, transform 0.2s; font-family: 'Inter', sans-serif; margin-top: 24px;
                }
                .save-send-btn:hover:not(:disabled) { background: #8B7355; transform: translateY(-2px); }
                .save-send-btn:disabled { background: #E8E5E0; color: #6B6B6B; cursor: not-allowed; }
            `}</style>

                <header className="main-header">
                    <h2>Manajemen Tamu</h2>
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
                                        <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{selectedGuest.package_name} • {selectedGuest.room_name}</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#8B7355', fontWeight: '600' }}>
                                            {formatDate(selectedGuest.check_in)} - {formatDate(selectedGuest.check_out)}
                                        </p>
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
                                            <p style={{ marginTop: '4px', fontSize: '12px', color: '#8B7355', fontWeight: '600' }}>
                                                {formatDate(res.check_in)} - {formatDate(res.check_out)}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
        </>
    );
}