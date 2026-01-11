"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import './Admin.css';

export default function AdminLogin() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleAdminLogin = (e) => {
        e.preventDefault();
        // Validasi sesuai kode asli
        if (email === "admin@thedukuh.com" && password === "admin123") {
            localStorage.setItem("isAdminAuthenticated", "true");
            alert("Login Admin Berhasil!");
            router.push("/admin/dashboard");
        } else {
            alert("Akses Ditolak! Hanya untuk Administrator.");
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
                        <label>Email</label>
                        <div className="admin-input-wrapper">
                            <Mail size={18} className="input-icon-left" />
                            <input
                                type="email"
                                placeholder="admin@thedukuh.com"
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

                    <button type="submit" className="admin-login-btn">
                        LOGIN
                    </button>
                </form>
            </div>
        </div>
    );
}