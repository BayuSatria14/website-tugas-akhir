'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import Supabase
import "./Register.css";

export default function Register() {
    const router = useRouter();

    // Gambar slideshow
    const images = ['/yoga1.jpg', '/yoga2.jpg', '/yoga3.jpg', '/yoga4.jpg', '/outdoor1.jpg'];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    const countries = [
        { name: "Indonesia", dial: "+62", flag: "https://flagcdn.com/w40/id.png" },
        { name: "United States", dial: "+1", flag: "https://flagcdn.com/w40/us.png" },
        { name: "Singapore", dial: "+65", flag: "https://flagcdn.com/w40/sg.png" },
        { name: "Australia", dial: "+61", flag: "https://flagcdn.com/w40/au.png" },
    ];

    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form data
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            alert("Semua field harus diisi!");
            return;
        }
        if (password.length < 6) {
            alert("Password minimal 6 karakter!");
            return;
        }
        if (password !== confirmPassword) {
            alert("Password dan konfirmasi password tidak cocok!");
            return;
        }

        setLoading(true);
        const fullPhoneNumber = selectedCountry.dial + phone;

        // --- LOGIKA SUPABASE ---
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: fullPhoneNumber,
                },
            },
        });

        if (error) {
            alert("Registrasi Gagal: " + error.message);
        } else {
            alert("Registrasi berhasil! Silakan cek email untuk verifikasi lalu silakan login.");
            router.push("/login");
        }
        setLoading(false);
    };

    return (
        <div className="register-container">
            <div className="left-section">
                {images.map((img, i) => (
                    <img key={i} src={img} className={`slideshow-img ${i === index ? "active" : ""}`} alt={`Slide ${i + 1}`} />
                ))}
            </div>

            <div className="right-section">
                <h2>REGISTER</h2>
                <div className="form-group">
                    <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />

                    <div className="phone-container">
                        <div className="country-select" onClick={() => setShowDropdown(!showDropdown)}>
                            <img src={selectedCountry.flag} alt="flag" className="flag" />
                            <span className="dial">{selectedCountry.dial}</span>
                        </div>

                        {showDropdown && (
                            <div className="dropdown">
                                {countries.map((c, i) => (
                                    <div key={i} className="dropdown-item" onClick={() => { setSelectedCountry(c); setShowDropdown(false); }}>
                                        <img src={c.flag} alt={c.name} className="flag" />
                                        <span>{c.name} ({c.dial})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input type="text" className="phone-input" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div className="password-wrapper">
                        <input type={showPassword ? "text" : "password"} placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </span>
                    </div>

                    <div className="password-wrapper">
                        <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </span>
                    </div>

                    <button className="register-btn" onClick={handleRegister} disabled={loading}>
                        {loading ? "PROCESSING..." : "CREATE ACCOUNT"}
                    </button>
                </div>

                <p className="login-text">
                    Already have an account? <span onClick={() => router.push("/login")}>Login</span>
                </p>

                <div className="welcome-box">
                    <h3 className="welcome">Join Us At</h3>
                    <h3 className="app-title">The Dukuh Retreat Yoga Booking</h3>
                </div>
            </div>
        </div>
    );
}