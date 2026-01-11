"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Pastikan path ini benar
import './Admin.css';

export default function AdminLogin() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Login menggunakan Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            // 2. Cek Role di tabel Profiles
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError || profile?.role !== 'admin') {
                // Jika bukan admin, paksa logout dan beri peringatan
                await supabase.auth.signOut();
                alert("Akses Ditolak! Akun ini bukan Administrator.");
                setLoading(false);
                return;
            }

            // 3. Jika Berhasil
            alert("Login Admin Berhasil!");
            router.push("/admin/dashboard");

        } catch (error) {
            alert("Login Gagal: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <ShieldAlert size={48} className="admin-icon" />
                    <h2>Admin Portal</h2>
                    <p>The Dukuh Retreat Management</p>
                </div>

                <form onSubmit={handleAdminLogin}>
                    <div className="admin-form-group">
                        <label>Email Admin</label>
                        <div className="admin-input-wrapper">
                            <Mail size={18} className="input-icon-left" />
                            <input
                                type="email"
                                placeholder="Masukkan email admin"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label>Password</label>
                        <div className="admin-input-wrapper">
                            <Lock size={18} className="input-icon-left" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="eye-icon-right"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? 'AUTHENTICATING...' : 'LOGIN SYSTEM'}
                    </button>
                </form>
            </div>
        </div>
    );
}