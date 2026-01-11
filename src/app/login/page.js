'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import Supabase
import "./Login.css";

export default function Login() {
    const router = useRouter();

    const images = ['/yoga1.jpg', '/yoga2.jpg', '/yoga3.jpg', '/yoga4.jpg', '/outdoor1.jpg'];
    const [index, setIndex] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Email dan password harus diisi!");
            return;
        }

        setLoading(true);

        // --- LOGIKA SUPABASE ---
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert("Login gagal: " + error.message);
        } else {
            // Cek role dari tabel profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            alert("Login berhasil!");

            if (profile?.role === 'admin') {
                router.push("/admin/dashboard");
            } else {
                router.push("/home");
            }
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) alert(error.message);
    };

    const handleFacebookLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
        if (error) alert(error.message);
    };

    return (
        <div className="login-container">
            <div className="left-section">
                {images.map((img, i) => (
                    <img key={i} src={img} className={`slideshow-img ${i === index ? "active" : ""}`} alt={`Slide ${i + 1}`} />
                ))}
            </div>

            <div className="right-section">
                <h2>LOGIN</h2>
                <div className="form-group">
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />

                    <div className="password-wrapper">
                        <input type={showPassword ? "text" : "password"} placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </span>
                    </div>

                    <button className="login-btn" onClick={handleLogin} disabled={loading}>
                        {loading ? "LOADING..." : "LOGIN"}
                    </button>
                </div>

                <p className="register-text">
                    Don't have an account? <span onClick={() => router.push("/register")}>Register</span>
                </p>

                <div className="social-login">
                    <div className="divider"><span>Or Continue with</span></div>
                    <div className="social-buttons">
                        <button className="social-btn google-btn" onClick={handleGoogleLogin}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M19.8055 10.2292C19.8055 9.55156 19.7501 8.86719 19.6323 8.19531H10.2002V12.0492H15.6014C15.3773 13.2911 14.6571 14.3898 13.6176 15.0875V17.5867H16.8251C18.7175 15.8449 19.8055 13.2727 19.8055 10.2292Z" fill="#4285F4" />
                                <path d="M10.2002 20.0008C12.9527 20.0008 15.2643 19.1056 16.8321 17.5867L13.6247 15.0875C12.7434 15.6972 11.5991 16.0431 10.2072 16.0431C7.54667 16.0431 5.29798 14.2806 4.51798 11.9097H1.2168V14.4867C2.82246 17.6786 6.33798 20.0008 10.2002 20.0008Z" fill="#34A853" />
                                <path d="M4.51116 11.9097C4.07532 10.6678 4.07532 9.33669 4.51116 8.09473V5.51782H1.21699C-0.146791 8.23669 -0.146791 11.7675 1.21699 14.4864L4.51116 11.9097Z" fill="#FBBC04" />
                                <path d="M10.2002 3.95805C11.6696 3.93555 13.0892 4.47305 14.1633 5.45805L17.0161 2.60555C15.1766 0.904219 12.7364 -0.0298477 10.2002 -0.000181396C6.33798 -0.000181396 2.82246 2.32199 1.2168 5.51782L4.51098 8.09473C5.28421 5.71699 7.53959 3.95805 10.2002 3.95805Z" fill="#EA4335" />
                            </svg> Google
                        </button>
                        <button className="social-btn facebook-btn" onClick={handleFacebookLogin}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 14.9912 3.65684 19.1283 8.4375 19.8785V12.8906H5.89844V10H8.4375V7.79688C8.4375 5.29063 9.93047 3.90625 12.2146 3.90625C13.3084 3.90625 14.4531 4.10156 14.4531 4.10156V6.5625H13.1922C11.95 6.5625 11.5625 7.3334 11.5625 8.125V10H14.3359L13.8926 12.8906H11.5625V19.8785C16.3432 19.1283 20 14.9912 20 10Z" fill="#1877F2" />
                            </svg> Facebook
                        </button>
                    </div>
                </div>

                <div className="welcome-box">
                    <h3 className="welcome">Join Us At</h3>
                    <h3 className="app-title">The Dukuh Retreat Yoga Booking</h3>
                </div>
            </div>
        </div>
    );
}