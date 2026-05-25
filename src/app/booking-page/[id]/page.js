'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Calendar, Users, Info, Plus, ChevronDown, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Data Kamar (Simulasi Database)
const roomData = [
    {
        id: "deluxe",
        name: "Deluxe",
        size: "32m²",
        pax: 2,
        bed: "1 twin-king/queen",
        price: 600000,
        availableRooms: 2,
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
        description: "Stay in an individual unique wooden house with stage structure so-called Indonesian R..."
    },
    {
        id: "suite",
        name: "Suite",
        size: "35m²",
        pax: 2,
        bed: "1 twin-king/queen",
        price: 800000,
        availableRooms: 1,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
        description: "Stay in an individual unique wooden house with stage structure so-called Indonesian R..."
    }
];

export default function BookingPage() {
    const router = useRouter();
    const params = useParams();
    const searchParamsHooks = useSearchParams();
    const id = params?.id;

    // ===================== STYLES =====================
    const colors = {
        bg: '#FAFAF7',
        text: '#1A1A1A',
        textMuted: '#6B6B6B',
        accent: '#8B7355',
        accentHover: '#6D5A42',
        border: '#E8E5E0',
        cardBg: '#FFFFFF',
    };

    // State untuk Search Bar & Kalender
    const [searchParams, setSearchParams] = useState({
        checkIn: "",
        checkOut: "",
        nights: "",
        adult: 2,
        child: 0
    });

    // State untuk Package dari DB
    const [dbPackage, setDbPackage] = useState(null);

    // State untuk parameter pencarian yang sudah aktif
    const [appliedNights, setAppliedNights] = useState(1);
    const [appliedCheckIn, setAppliedCheckIn] = useState("");
    const [appliedCheckOut, setAppliedCheckOut] = useState("");

    // Fetch Package Data dari DB jika ID != custom
    useEffect(() => {
        const fetchPackage = async () => {
            if (id && id !== 'custom') {
                const { data, error } = await supabase
                    .from('packages')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error) {
                    console.error("Error fetching package:", error);
                } else {
                    setDbPackage(data);
                }
            }
        };
        fetchPackage();
    }, [id]);

    // Effect untuk membaca Query Params dari URL (jika ada)
    useEffect(() => {
        const qCheckIn = searchParamsHooks.get('checkIn');
        const qCheckOut = searchParamsHooks.get('checkOut');
        const qGuests = searchParamsHooks.get('guests');
        const qNights = searchParamsHooks.get('nights');
        const qReset = searchParamsHooks.get('reset');

        if (qReset === 'true') {
            setSearchParams(prev => ({
                ...prev,
                checkIn: "",
                checkOut: "",
                nights: "",
                adult: 2
            }));
            setAppliedNights(1);
            setAppliedCheckIn("");
            setAppliedCheckOut("");
        } else if (qCheckIn && qCheckOut) {
            const start = new Date(qCheckIn);
            const end = new Date(qCheckOut);
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            if (nights > 0) {
                setSearchParams(prev => ({
                    ...prev,
                    checkIn: qCheckIn,
                    checkOut: qCheckOut,
                    nights: nights,
                    adult: qGuests ? parseInt(qGuests) : prev.adult
                }));
                setAppliedNights(nights);
                setAppliedCheckIn(qCheckIn);
                setAppliedCheckOut(qCheckOut);
            }
        } else if (qNights) {
            const n = parseInt(qNights);
            if (n > 0) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dateIn = tomorrow.toISOString().split('T')[0];

                const start = new Date(dateIn);
                start.setDate(start.getDate() + n);
                const dateOut = start.toISOString().split('T')[0];

                setSearchParams(prev => ({
                    ...prev,
                    checkIn: dateIn,
                    checkOut: dateOut,
                    nights: n
                }));
                setAppliedNights(n);
                setAppliedCheckIn(dateIn);
                setAppliedCheckOut(dateOut);
            }
        } else {
            if (!id || id === 'custom') {
                // Do nothing
            } else {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dateStr = tomorrow.toISOString().split('T')[0];
                setSearchParams(prev => ({ ...prev, checkIn: dateStr }));
                setAppliedCheckIn(dateStr);
            }
        }
    }, [searchParamsHooks, id]);

    // Effect untuk update duration berdasarkan paket yang dipilih
    useEffect(() => {
        const qNights = searchParamsHooks.get('nights');
        if (id && id !== 'custom' && !qNights && dbPackage) {
            const match = dbPackage.duration.match(/(\d+)\s*(?:Night|Malam)/i);
            if (match) {
                const nights = parseInt(match[1]);

                let currentCheckIn = searchParams.checkIn;
                if (!currentCheckIn) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    currentCheckIn = tomorrow.toISOString().split('T')[0];
                }

                const startDate = new Date(currentCheckIn);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + nights);
                const newCheckOut = endDate.toISOString().split('T')[0];

                setSearchParams(prev => ({
                    ...prev,
                    checkIn: currentCheckIn,
                    checkOut: newCheckOut,
                    nights: nights
                }));
                setAppliedNights(nights);
                setAppliedCheckIn(currentCheckIn);
                setAppliedCheckOut(newCheckOut);
            }
        }
    }, [id, searchParams.checkIn, dbPackage]);

    const getRoomPricePerNight = (room) => {
        if (!room) return 0;
        if (id && id !== 'custom') {
            const match = dbPackage?.duration?.match(/(\d+)\s*(?:Night|Malam)/i);
            const packageNights = match ? parseInt(match[1]) : 1;
            const packagePricePerNight = dbPackage ? (dbPackage.price / packageNights) : 0;
            return packagePricePerNight + room.price;
        }
        return room.price;
    };

    const [showRooms, setShowRooms] = useState(false);
    const [activeQtySelector, setActiveQtySelector] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingQty, setBookingQty] = useState(1);

    const [showGuestForm, setShowGuestForm] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [guestInfo, setGuestInfo] = useState({
        title: "Mr.",
        firstName: "",
        lastName: "",
        country: "Indonesia",
        mobile: "+62",
        email: "",
        specialRequest: "",
        otherInfo: "",
        paymentMethod: "XENDIT"
    });

    // ==========================================
    // LOGIKA KALENDER
    // ==========================================
    const diffDays = (dateIn, dateOut) => {
        if (!dateIn || !dateOut) return 0;
        const start = new Date(dateIn);
        const end = new Date(dateOut);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const addDays = (date, days) => {
        if (!date) return "";
        const d = parseInt(days);
        if (isNaN(d)) return "";

        const [y, m, da] = date.split('-').map(Number);
        const result = new Date(y, m - 1, da + d);

        const yy = result.getFullYear();
        const mm = String(result.getMonth() + 1).padStart(2, '0');
        const dd = String(result.getDate()).padStart(2, '0');
        return `${yy}-${mm}-${dd}`;
    };

    const handleCheckInChange = (newIn) => {
        const currentNights = searchParams.nights ? parseInt(searchParams.nights) : 1;
        const newOut = addDays(newIn, currentNights);
        setSearchParams({ ...searchParams, checkIn: newIn, checkOut: newOut, nights: currentNights });
    };

    const handleCheckOutChange = (newOut) => {
        const nights = diffDays(searchParams.checkIn, newOut);
        if (nights > 0) setSearchParams({ ...searchParams, checkOut: newOut, nights: nights });
    };

    const handleNightsChange = (newNights) => {
        if (newNights > 0) {
            const newOut = addDays(searchParams.checkIn, newNights);
            setSearchParams({ ...searchParams, nights: parseInt(newNights), checkOut: newOut });
        }
    };

    // ==========================================
    // HANDLERS PROSES BOOKING
    // ==========================================
    const handleCheckAvailability = () => {
        setAppliedNights(parseInt(searchParams.nights) || 1);
        setAppliedCheckIn(searchParams.checkIn);
        setAppliedCheckOut(searchParams.checkOut);
        setShowRooms(true);
        setShowGuestForm(false);
        setShowSummary(false);
    };

    const handleQuantityChange = (room, qty) => {
        const quantity = parseInt(qty);
        if (quantity > 0) {
            setSelectedRoom(room);
            setBookingQty(quantity);
            setActiveQtySelector(null);
            setShowGuestForm(true);
            if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const handleGuestFormSubmit = (e) => {
        e.preventDefault();
        setShowSummary(true);
    };

    const handleMobileChange = (e) => {
        const value = e.target.value;
        if (/^\+?[0-9]*$/.test(value)) {
            setGuestInfo((prev) => ({ ...prev, mobile: value }));
        }
    };

    const handleCountryChange = (e) => {
        const selectedCountry = e.target.value;
        let phoneCode = "";
        switch (selectedCountry) {
            case "Indonesia": phoneCode = "+62"; break;
            case "Singapore": phoneCode = "+65"; break;
            case "Malaysia": phoneCode = "+60"; break;
            case "Australia": phoneCode = "+61"; break;
            default: phoneCode = "";
        }
        setGuestInfo(prev => ({
            ...prev,
            country: selectedCountry,
            mobile: phoneCode
        }));
    };

    // ==========================================
    // LOGIKA REDIRECT XENDIT
    // ==========================================
    const handlePayment = async () => {
        setIsProcessing(true);

        const roomPricePerNight = getRoomPricePerNight(selectedRoom);
        const totalAmount = roomPricePerNight * appliedNights * bookingQty;
        const bookingId = `TDR${Date.now()}`;
        const packageName = dbPackage ? dbPackage.title : null;

        const invoicePayload = {
            externalId: bookingId,
            amount: totalAmount,
            payerEmail: guestInfo.email,
            paymentMethod: guestInfo.paymentMethod,
            description: selectedRoom.name,
            packageName: packageName,
            checkIn: appliedCheckIn,
            checkOut: appliedCheckOut,
            nights: appliedNights,
            adults: parseInt(searchParams.adult),
            children: parseInt(searchParams.child),
            qty: bookingQty,
            guestInfo: guestInfo,
            successRedirectUrl: `${window.location.origin}/booking/success?bookingId=${bookingId}`,
            failureRedirectUrl: `${window.location.origin}/booking/failed?bookingId=${bookingId}`
        };

        try {
            console.log("🔵 Memulai pembuatan invoice...");
            const response = await fetch('/api/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoicePayload)
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Gagal membuat invoice');
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('currentBooking', JSON.stringify({
                    bookingId,
                    guestInfo,
                    totalAmount
                }));
                window.location.href = data.invoiceUrl;
            }
        } catch (error) {
            console.error("❌ Payment Error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            paddingBottom: '80px',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* ====== GLOBAL STYLES & FONTS ====== */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .search-input-booking {
                    width: 100%;
                    border: none;
                    outline: none;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: #1A1A1A;
                    background: transparent;
                    border-bottom: 1px solid #E8E5E0;
                    padding: 8px 0;
                    transition: border-color 0.3s;
                }
                .search-input-booking:focus {
                    border-color: #8B7355;
                }
                .search-input-booking:disabled {
                    color: #9CA3AF;
                    cursor: not-allowed;
                }

                .booking-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #E8E5E0;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: #1A1A1A;
                    background: #fff;
                    transition: border-color 0.3s, box-shadow 0.3s;
                    outline: none;
                }
                .booking-input:focus {
                    border-color: #8B7355;
                    box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
                }

                .room-card-modern {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    display: grid;
                    grid-template-columns: 240px 1fr 220px;
                    gap: 32px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
                    border: 1px solid #E8E5E0;
                    margin-bottom: 24px;
                    transition: transform 0.3s ease;
                }
                .room-card-modern:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 50px rgba(0,0,0,0.06);
                }

                @media (max-width: 900px) {
                    .room-card-modern {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }
            `}</style>

            {/* ====== HEADER ====== */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(250,250,247,0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${colors.border}`,
                padding: '16px 24px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                        onClick={() => router.push(id && id !== 'custom' ? `/package-detail/${id}` : '/home')}
                        style={{
                            background: 'transparent', border: 'none',
                            color: colors.accent, fontFamily: "'Inter', sans-serif",
                            fontSize: '14px', fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            cursor: 'pointer', transition: 'color 0.3s'
                        }}
                        onMouseEnter={e => e.target.style.color = colors.accentHover}
                        onMouseLeave={e => e.target.style.color = colors.accent}
                    >
                        <ArrowLeft size={18} /> {id && id !== 'custom' ? 'Back to Package' : 'Back to Home'}
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

                {/* 1. SEARCH BAR */}
                <div style={{
                    background: '#fff', borderRadius: '16px', padding: '24px 32px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: `1px solid ${colors.border}`,
                    display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end',
                    animation: 'fadeIn 0.5s ease', marginBottom: '40px'
                }}>
                    <div style={{ flex: '1 1 140px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, display: 'block', marginBottom: '8px' }}>Check In</label>
                        <input type="date" className="search-input-booking" value={searchParams.checkIn} onChange={(e) => handleCheckInChange(e.target.value)} />
                    </div>
                    <div style={{ flex: '1 1 140px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, display: 'block', marginBottom: '8px' }}>Check Out</label>
                        <input
                            type="date" className="search-input-booking"
                            value={searchParams.checkOut}
                            min={addDays(searchParams.checkIn, 1)}
                            onChange={(e) => handleCheckOutChange(e.target.value)}
                            disabled={id && id !== 'custom'}
                        />
                    </div>
                    <div style={{ flex: '0 1 80px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, display: 'block', marginBottom: '8px' }}>Nights</label>
                        <input
                            type="number" min="1" className="search-input-booking"
                            value={searchParams.nights}
                            onChange={(e) => handleNightsChange(e.target.value)}
                            disabled={id && id !== 'custom'}
                        />
                    </div>
                    <div style={{ flex: '0 1 100px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, display: 'block', marginBottom: '8px' }}>Adults</label>
                        <select className="search-input-booking" value={searchParams.adult} onChange={(e) => setSearchParams({ ...searchParams, adult: e.target.value })}>
                            {[1, 2].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '0 1 100px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, display: 'block', marginBottom: '8px' }}>Children</label>
                        <select className="search-input-booking" value={searchParams.child} onChange={(e) => setSearchParams({ ...searchParams, child: e.target.value })}>
                            {[0, 1, 2].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleCheckAvailability}
                            style={{
                                background: colors.accent, color: '#fff', border: 'none',
                                padding: '12px 28px', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: '600', fontSize: '14px', transition: 'background 0.3s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={e => e.target.style.background = colors.accentHover}
                            onMouseLeave={e => e.target.style.background = colors.accent}
                        >
                            Check Availability
                        </button>
                    </div>
                </div>

                {/* 2. ROOM LISTING */}
                {showRooms && !showGuestForm && (
                    <div style={{ animation: 'fadeIn 0.6s ease' }}>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', marginBottom: '24px', color: colors.text }}>
                            Select Your Room
                        </h2>
                        {roomData.map((room) => (
                            <div key={room.id} className="room-card-modern">
                                <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
                                    <img src={room.image} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: colors.text, margin: 0 }}>
                                            {room.name}
                                        </h3>
                                        <span style={{
                                            background: '#FDF4F4', color: '#DC2626', fontSize: '12px', fontWeight: '600',
                                            padding: '4px 10px', borderRadius: '12px'
                                        }}>
                                            {room.availableRooms} {room.availableRooms > 1 ? "Rooms" : "Room"} Left!
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: colors.textMuted, marginBottom: '12px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Info size={14} /> {room.size}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {room.pax} Pax</span>
                                        <span>• {room.bed}</span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: 1.6, marginBottom: '16px' }}>
                                        {room.description}
                                    </p>
                                    <button style={{
                                        background: 'transparent', border: 'none', color: colors.accent,
                                        fontWeight: '600', fontSize: '13px', padding: 0, cursor: 'pointer', textAlign: 'left',
                                        textDecoration: 'underline'
                                    }}>
                                        View Room Details
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', borderLeft: `1px solid ${colors.border}`, paddingLeft: '24px' }}>
                                    <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>
                                        {appliedNights > 1 ? `Total for ${appliedNights} Nights` : "Start From"}
                                    </p>
                                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.text, marginBottom: '20px' }}>
                                        IDR {(getRoomPricePerNight(room) * appliedNights).toLocaleString()}
                                    </h2>
                                    {activeQtySelector === room.id ? (
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <select
                                                className="booking-input"
                                                defaultValue=""
                                                onChange={(e) => handleQuantityChange(room, e.target.value)}
                                                style={{ appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}
                                            >
                                                <option value="" disabled>Select Qty</option>
                                                {[...Array(room.availableRooms)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1} Unit</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: colors.textMuted }} />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setActiveQtySelector(room.id)}
                                            style={{
                                                width: '100%', background: colors.accent, color: '#fff', border: 'none',
                                                padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '14px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                cursor: 'pointer', transition: 'background 0.3s'
                                            }}
                                            onMouseEnter={e => e.target.style.background = colors.accentHover}
                                            onMouseLeave={e => e.target.style.background = colors.accent}
                                        >
                                            Add Room <Plus size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. GUEST INFORMATION FORM */}
                {showGuestForm && (
                    <div style={{ animation: 'fadeIn 0.6s ease', maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: colors.text, marginBottom: '8px' }}>
                                Guest Information
                            </h2>
                            <p style={{ color: colors.textMuted, fontSize: '15px' }}>Fill the following form to complete your reservation.</p>
                        </div>

                        <form onSubmit={handleGuestFormSubmit} style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: `1px solid ${colors.border}` }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>Title</label>
                                    <select className="booking-input" value={guestInfo.title} onChange={(e) => setGuestInfo({ ...guestInfo, title: e.target.value })}>
                                        <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>First Name *</label>
                                    <input type="text" className="booking-input" required value={guestInfo.firstName} onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>Last Name *</label>
                                    <input type="text" className="booking-input" required value={guestInfo.lastName} onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>Country</label>
                                    <select className="booking-input" value={guestInfo.country} onChange={handleCountryChange}>
                                        <option>Indonesia</option><option>Singapore</option><option>Malaysia</option><option>Australia</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>Mobile Phone *</label>
                                    <input type="text" className="booking-input" required value={guestInfo.mobile} onChange={handleMobileChange} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>Email *</label>
                                    <input type="email" className="booking-input" required value={guestInfo.email} onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>Special Request</label>
                                <textarea className="booking-input" rows="3" value={guestInfo.specialRequest} onChange={(e) => setGuestInfo({ ...guestInfo, specialRequest: e.target.value })} style={{ resize: 'vertical' }} />
                            </div>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>Other Info (e.g. flight number)</label>
                                <textarea className="booking-input" rows="2" value={guestInfo.otherInfo} onChange={(e) => setGuestInfo({ ...guestInfo, otherInfo: e.target.value })} style={{ resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: `1px solid ${colors.border}`, paddingTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowGuestForm(false)}
                                    style={{
                                        background: 'transparent', border: `1px solid ${colors.border}`, color: colors.text,
                                        padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={e => e.target.style.background = '#f1f1f1'}
                                    onMouseLeave={e => e.target.style.background = 'transparent'}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        background: colors.accent, color: '#fff', border: 'none',
                                        padding: '12px 32px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.3s'
                                    }}
                                    onMouseEnter={e => e.target.style.background = colors.accentHover}
                                    onMouseLeave={e => e.target.style.background = colors.accent}
                                >
                                    Continue to Book
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>

            {/* 4. POP-UP SUMMARY (Glassmorphism) */}
            {showSummary && selectedRoom && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 999,
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
                        animation: 'modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{ padding: '24px 32px', borderBottom: `1px solid ${colors.border}` }}>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: colors.text, margin: 0 }}>
                                Booking Confirmation
                            </h3>
                        </div>
                        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '14px' }}>
                                <span style={{ color: colors.textMuted, fontWeight: '500' }}>Guest Name</span>
                                <span style={{ color: colors.text, fontWeight: '600' }}>{guestInfo.title} {guestInfo.firstName} {guestInfo.lastName}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '14px' }}>
                                <span style={{ color: colors.textMuted, fontWeight: '500' }}>{id && id !== 'custom' ? 'Package' : 'Room'}</span>
                                <span style={{ color: colors.text, fontWeight: '600' }}>{id && id !== 'custom' ? (dbPackage?.title || selectedRoom.name) : selectedRoom.name}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '14px' }}>
                                <span style={{ color: colors.textMuted, fontWeight: '500' }}>Units</span>
                                <span style={{ color: colors.text, fontWeight: '600' }}>{bookingQty} {selectedRoom.name} Room(s)</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '14px' }}>
                                <span style={{ color: colors.textMuted, fontWeight: '500' }}>Stay Duration</span>
                                <span style={{ color: colors.text, fontWeight: '600' }}>{appliedCheckIn} to {appliedCheckOut} <br /><span style={{ color: colors.accent }}>({appliedNights} Nights)</span></span>
                            </div>

                            <div style={{
                                marginTop: '16px', background: '#FAFAF7', padding: '20px', borderRadius: '12px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span style={{ color: colors.textMuted, fontSize: '14px', fontWeight: '500' }}>Total Payment</span>
                                <span style={{ color: colors.accent, fontSize: '22px', fontWeight: '700' }}>
                                    IDR {(getRoomPricePerNight(selectedRoom) * appliedNights * bookingQty).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div style={{ padding: '24px 32px', background: '#FAFAF7', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setShowSummary(false)} disabled={isProcessing}
                                style={{
                                    background: 'transparent', border: `1px solid ${colors.border}`, color: colors.text,
                                    padding: '12px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Edit Data
                            </button>
                            <button
                                onClick={handlePayment} disabled={isProcessing}
                                style={{
                                    background: colors.accent, color: '#fff', border: 'none',
                                    padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    opacity: isProcessing ? 0.7 : 1
                                }}
                            >
                                {isProcessing ? (
                                    <><Loader2 className="animate-spin" size={16} /> Processing...</>
                                ) : (
                                    "Confirm & Pay"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}