"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, Save, User, Bell, Lock, Shield, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Pastikan path import benar sesuai struktur proyek Anda
import '../dashboard/Dashboard.css';

export default function SettingsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);

    // State untuk menyimpan data profil
    const [adminName, setAdminName] = useState("Administrator");
    const [displayName, setDisplayName] = useState("Administrator"); // Nama yang tampil di header
    const [adminEmail, setAdminEmail] = useState("admin@thedukuh.com");
    const [userId, setUserId] = useState(null);

    // ==========================================
    // FETCH DATA PROFIL SAAT HALAMAN DIMUAT
    // ==========================================
    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setAdminEmail(user.email);

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.full_name) {
                    setAdminName(profile.full_name);
                    setDisplayName(profile.full_name); // Set nama di header
                }
            }
        };
        getProfile();
    }, []);

    // ==========================================
    // 1. FUNGSI LOGOUT (MENGGUNAKAN SUPABASE)
    // ==========================================
    const handleLogout = async () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert("Error logout: " + error.message);
            } else {
                // Bersihkan localStorage lama jika masih tersisa
                localStorage.removeItem("isAdminAuthenticated");
                router.push("/admin");
            }
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

    // ==========================================
    // FUNGSI SIMPAN PERUBAHAN KE DATABASE
    // ==========================================
    const handleSaveSettings = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: adminName })
                .eq('id', userId);

            if (error) throw error;

            // Update nama yang tampil di header SETELAH berhasil simpan
            setDisplayName(adminName);
            alert("Pengaturan berhasil disimpan!");
        } catch (error) {
            alert("Gagal menyimpan: " + error.message);
        } finally {
            setIsLoading(false);
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
                    <h2>Pengaturan Sistem</h2>
                    <div className="user-info">
                        {/* Nama di sini akan berubah setelah tombol simpan diklik */}
                        <span>{displayName}</span>
                        <div className="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
                    </div>
                </header>

                <div className="content-area">
                    <div className="settings-grid" style={{ display: 'grid', gap: '24px' }}>

                        {/* SEKSI PROFIL */}
                        <div className="stat-card" style={{ padding: '24px', display: 'block' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <User size={24} style={{ color: '#4f46e5' }} />
                                <h3 style={{ margin: 0 }}>Profil Administrator</h3>
                            </div>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>Nama Admin</label>
                                    <input
                                        type="text"
                                        value={adminName}
                                        onChange={(e) => setAdminName(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>Email Kontak</label>
                                    <input
                                        type="email"
                                        value={adminEmail}
                                        readOnly
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SEKSI KEAMANAN */}
                        <div className="stat-card" style={{ padding: '24px', display: 'block' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <Shield size={24} style={{ color: '#ef4444' }} />
                                <h3 style={{ margin: 0 }}>Keamanan & Autentikasi</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                                Keamanan akun Anda dikelola melalui Supabase Auth.
                            </p>
                            <button
                                className="view-btn"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content', padding: '10px 20px' }}
                                onClick={() => alert("Gunakan fitur Reset Password pada menu Supabase Auth jika diperlukan.")}
                            >
                                <Lock size={18} /> Ganti Kata Sandi
                            </button>
                        </div>

                        {/* SEKSI NOTIFIKASI */}
                        <div className="stat-card" style={{ padding: '24px', display: 'block' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <Bell size={24} style={{ color: '#f59e0b' }} />
                                <h3 style={{ margin: 0 }}>Notifikasi Sistem</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                                <span style={{ fontSize: '14px' }}>Aktifkan notifikasi email untuk setiap reservasi baru</span>
                            </div>
                        </div>

                        {/* TOMBOL SIMPAN */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button
                                onClick={handleSaveSettings}
                                disabled={isLoading}
                                style={{
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    padding: '12px 24px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}