"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, Save, User, Bell, Lock, Shield, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
        <>
            <style jsx>{`
                .settings-grid { display: grid; gap: 24px; }
                .stat-card {
                    background: white; border-radius: 16px; padding: 32px;
                    border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }
                .stat-card h3 { font-family: 'Playfair Display', serif; font-size: 20px; color: #1A1A1A; }
                .input-field {
                    width: 100%; padding: 14px; border-radius: 10px; border: 1px solid #E8E5E0;
                    font-size: 14px; font-family: 'Inter', sans-serif; transition: border-color 0.3s;
                }
                .input-field:focus { border-color: #8B7355; outline: none; }
                .input-field.readonly { background-color: #FAFAF7; color: #6B6B6B; cursor: not-allowed; }
                .form-label { display: block; margin-bottom: 8px; font-size: 13px; color: #1A1A1A; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                .btn-save {
                    background-color: #1A1A1A; color: white; padding: 14px 28px; border: none;
                    border-radius: 10px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer;
                    display: flex; alignItems: center; gap: 8px; transition: background 0.3s, transform 0.2s;
                }
                .btn-save:hover:not(:disabled) { background-color: #8B7355; transform: translateY(-2px); }
                .btn-save:disabled { background-color: #E8E5E0; color: #6B6B6B; cursor: not-allowed; }
                .view-btn {
                    background: #FAFAF7; color: #8B7355; border: 1px solid #E8E5E0;
                    padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600;
                    display: flex; align-items: center; gap: 8px; transition: all 0.3s;
                }
                .view-btn:hover { background: #8B7355; color: white; }
            `}</style>
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
                        <div className="stat-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <User size={24} style={{ color: '#8B7355' }} />
                                <h3 style={{ margin: 0 }}>Profil Administrator</h3>
                            </div>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Nama Admin</label>
                                    <input
                                        type="text"
                                        value={adminName}
                                        onChange={(e) => setAdminName(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Email Kontak</label>
                                    <input
                                        type="email"
                                        value={adminEmail}
                                        readOnly
                                        className="input-field readonly"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SEKSI KEAMANAN */}
                        <div className="stat-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <Shield size={24} style={{ color: '#EF4444' }} />
                                <h3 style={{ margin: 0 }}>Keamanan & Autentikasi</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '20px', lineHeight: '1.6' }}>
                                Keamanan akun Anda dikelola melalui Supabase Auth.
                            </p>
                            <button
                                className="view-btn"
                                onClick={() => alert("Gunakan fitur Reset Password pada menu Supabase Auth jika diperlukan.")}
                            >
                                <Lock size={18} /> Ganti Kata Sandi
                            </button>
                        </div>

                        {/* SEKSI NOTIFIKASI */}
                        <div className="stat-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <Bell size={24} style={{ color: '#8B7355' }} />
                                <h3 style={{ margin: 0 }}>Notifikasi Sistem</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#8B7355' }} />
                                <span style={{ fontSize: '14px', color: '#1A1A1A' }}>Aktifkan notifikasi email untuk setiap reservasi baru</span>
                            </div>
                        </div>

                        {/* TOMBOL SIMPAN */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button
                                onClick={handleSaveSettings}
                                disabled={isLoading}
                                className="btn-save"
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
                            </button>
                        </div>
                    </div>
                </div>
        </>
    );
}