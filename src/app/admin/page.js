"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

    const colors = {
        bg: '#FAFAF7',
        text: '#1A1A1A',
        textMuted: '#6B6B6B',
        accent: '#8B7355',
        border: '#E8E5E0',
        cardBg: '#FFFFFF',
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', backgroundColor: colors.bg,
            fontFamily: "'Inter', sans-serif"
        }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
                
                .admin-login-card {
                    background: ${colors.cardBg};
                    padding: 48px 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
                    width: 100%;
                    max-width: 440px;
                    border: 1px solid rgba(0,0,0,0.03);
                }

                .admin-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .admin-input {
                    width: 100%;
                    padding: 14px 14px 14px 44px;
                    border: 1px solid ${colors.border};
                    border-radius: 10px;
                    font-size: 14px;
                    font-family: 'Inter', sans-serif;
                    box-sizing: border-box;
                    transition: border-color 0.3s, box-shadow 0.3s;
                    color: ${colors.text};
                }

                .admin-input:focus {
                    outline: none;
                    border-color: ${colors.accent};
                    box-shadow: 0 0 0 3px rgba(139,115,85, 0.1);
                }

                .admin-icon-left {
                    position: absolute;
                    left: 14px;
                    color: #A0AEC0;
                    transition: color 0.3s;
                }
                
                .admin-input:focus + .admin-icon-left,
                .admin-input-wrapper:focus-within .admin-icon-left {
                    color: ${colors.accent};
                }

                .admin-icon-right {
                    position: absolute;
                    right: 14px;
                    cursor: pointer;
                    color: #A0AEC0;
                    display: flex;
                    align-items: center;
                    transition: color 0.3s;
                }

                .admin-icon-right:hover {
                    color: ${colors.accent};
                }

                .admin-btn {
                    width: 100%;
                    padding: 14px;
                    background-color: ${colors.text};
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    font-family: 'Inter', sans-serif;
                    margin-top: 24px;
                    transition: background-color 0.3s, transform 0.2s;
                    letter-spacing: 0.5px;
                }

                .admin-btn:hover:not(:disabled) {
                    background-color: ${colors.accent};
                    transform: translateY(-2px);
                }
                
                .admin-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="admin-login-card">
                <div style={{ textAlign: 'center', marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        background: 'rgba(139,115,85,0.1)', padding: '16px',
                        borderRadius: '50%', marginBottom: '20px'
                    }}>
                        <ShieldAlert size={36} color={colors.accent} />
                    </div>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        margin: 0, color: colors.text, fontSize: '28px', fontWeight: '600'
                    }}>Admin Portal</h2>
                    <p style={{
                        color: colors.textMuted, marginTop: '8px', fontSize: '14px',
                        textTransform: 'uppercase', letterSpacing: '1px'
                    }}>The Dukuh Retreat</p>
                </div>

                <form onSubmit={handleAdminLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block', marginBottom: '8px', fontSize: '13px',
                            fontWeight: '600', color: colors.text, textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>Email Address</label>
                        <div className="admin-input-wrapper">
                            <Mail size={18} className="admin-icon-left" />
                            <input
                                type="email"
                                className="admin-input"
                                placeholder="Enter admin email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{
                            display: 'block', marginBottom: '8px', fontSize: '13px',
                            fontWeight: '600', color: colors.text, textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>Password</label>
                        <div className="admin-input-wrapper">
                            <Lock size={18} className="admin-icon-left" />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="admin-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="admin-icon-right"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="admin-btn" disabled={loading}>
                        {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
                    </button>
                </form>
            </div>
        </div>
    );
}