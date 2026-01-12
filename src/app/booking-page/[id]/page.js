'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation"; // Next.js navigation
import { Calendar, Users, Info, Plus, ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import "./BookingPage.css";


// Data Kamar (Simulasi Database)
const roomData = [
    {
        id: "deluxe",
        name: "Deluxe",
        size: "32m²",
        pax: 2,
        bed: "1 twin-king/queen",
        price: 2100000,
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
        price: 2100000,
        availableRooms: 1,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
        description: "Stay in an individual unique wooden house with stage structure so-called Indonesian R..."
    }
];

export default function BookingPage() {
    const router = useRouter(); // Next.js router
    const params = useParams();
    const searchParamsHooks = useSearchParams(); // Rename to avoid conflict with state
    const id = params?.id;

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
            // Jika reset, kosongkan semua
            setSearchParams(prev => ({
                ...prev,
                checkIn: "",
                checkOut: "",
                nights: "",
                adult: 2
            }));
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
            }
        } else if (qNights) {
            // Case logic: jika ada nights dari URL (misal dari detail package)
            const n = parseInt(qNights);
            if (n > 0) {
                // Set default checkIn besok
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dateIn = tomorrow.toISOString().split('T')[0];

                // Calc checkout
                const start = new Date(dateIn);
                start.setDate(start.getDate() + n);
                const dateOut = start.toISOString().split('T')[0];

                setSearchParams(prev => ({
                    ...prev,
                    checkIn: dateIn,
                    checkOut: dateOut,
                    nights: n
                }));
            }
        } else {

            // Jika id = package id, biarkan effect bawah yang handle.
            if (!id || id === 'custom') {
                // Pastikan kosong
            } else {

                // Kita set default tanggal besok agar tidak blank sama sekali saat pilih paket
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dateStr = tomorrow.toISOString().split('T')[0];
                setSearchParams(prev => ({ ...prev, checkIn: dateStr }));
            }
        }
    }, [searchParamsHooks, id]);

    // Effect untuk update duration berdasarkan paket yang dipilih (Prioritas ke-2 jika by Package)
    useEffect(() => {
        // Jangan override jika sudah ada nights dari URL
        const qNights = searchParamsHooks.get('nights');
        if (id && id !== 'custom' && !qNights && dbPackage) {
            // Parse "3 Days 2 Night" -> ambil angka sebelum "Night"
            const match = dbPackage.duration.match(/(\d+)\s*(?:Night|Malam)/i);
            if (match) {
                const nights = parseInt(match[1]);

                // Gunakan checkIn yang ada, atau default besok jika kosong
                let currentCheckIn = searchParams.checkIn;
                if (!currentCheckIn) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    currentCheckIn = tomorrow.toISOString().split('T')[0];
                }

                // Hitung CheckOut baru berdasarkan CheckIn saat ini + nights
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
            }
        }
    }, [id, searchParams.checkIn, dbPackage]); // Tambahkan dependency checkIn dan dbPackage

    const [showRooms, setShowRooms] = useState(false);
    const [activeQtySelector, setActiveQtySelector] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingQty, setBookingQty] = useState(1);

    // State untuk Alur Form & Pop-up
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // State Loading Pembayaran
    const [isProcessing, setIsProcessing] = useState(false);

    // State Biodata Tamu
    const [guestInfo, setGuestInfo] = useState({
        title: "Mr.",
        firstName: "",
        lastName: "",
        country: "Indonesia",
        mobile: "+62",
        email: "",
        specialRequest: "",
        otherInfo: "",
        paymentMethod: ""
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
        // Allow only numbers and '+' at the beginning
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
    // LOGIKA REDIRECT XENDIT (UPDATED)
    // ==========================================
    const handlePayment = async () => {
        setIsProcessing(true);

        const totalAmount = selectedRoom.price * searchParams.nights * bookingQty;
        const bookingId = `TDR${Date.now()}`;

        // Cari info paket jika ID bukan 'custom'
        const packageName = dbPackage ? dbPackage.title : null; // Jika tidak ada paket, set null

        const invoicePayload = {
            externalId: bookingId,
            amount: totalAmount,
            payerEmail: guestInfo.email,
            paymentMethod: guestInfo.paymentMethod,
            description: selectedRoom.name,
            packageName: packageName,
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
            nights: searchParams.nights,
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
        <div className="booking-page-container">
            {/* 1. SEARCH BAR */}
            <div className="search-availability-bar">
                <div className="search-field">
                    <label>Check In</label>
                    <input type="date" value={searchParams.checkIn} onChange={(e) => handleCheckInChange(e.target.value)} />
                </div>
                <div className="search-field">
                    <label>Check Out</label>
                    <input type="date" value={searchParams.checkOut} min={addDays(searchParams.checkIn, 1)} onChange={(e) => handleCheckOutChange(e.target.value)} />
                </div>
                <div className="search-field small">
                    <label>Nights</label>
                    <input type="number" min="1" value={searchParams.nights} onChange={(e) => handleNightsChange(e.target.value)} />
                </div>
                <div className="search-field">
                    <label>Adult</label>
                    <select value={searchParams.adult} onChange={(e) => setSearchParams({ ...searchParams, adult: e.target.value })}>
                        {[1, 2].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="search-field small">
                    <label>Child</label>
                    <select value={searchParams.child} onChange={(e) => setSearchParams({ ...searchParams, child: e.target.value })}>
                        {[0, 1, 2].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <button className="check-btn" onClick={handleCheckAvailability}>Check Availability</button>
            </div>

            {/* 2. ROOM LISTING */}
            {showRooms && !showGuestForm && (
                <div className="rooms-container">
                    {roomData.map((room) => (
                        <div key={room.id} className="room-card-horizontal">
                            <div className="room-image-box">
                                <img src={room.image} alt={room.name} />
                            </div>
                            <div className="room-details-box">
                                <div className="room-header">
                                    <h3>{room.name}</h3>
                                    <span className="room-left-tag">{room.availableRooms} {room.availableRooms > 1 ? "Rooms" : "Room"} Left!</span>
                                </div>
                                <div className="room-specs">
                                    <span><Info size={14} /> {room.size}</span>
                                    <span><Users size={14} /> {room.pax} Pax</span>
                                    <span>{room.bed}</span>
                                </div>
                                <p className="room-desc">{room.description}</p>
                                <button className="view-detail-btn">View Room Details</button>
                            </div>
                            <div className="room-price-box">
                                <p className="start-from">Start From</p>
                                <h2 className="price-text">IDR {room.price.toLocaleString()}</h2>
                                {activeQtySelector === room.id ? (
                                    <div className="qty-dropdown-wrapper">
                                        <select className="qty-select-custom" defaultValue="" onChange={(e) => handleQuantityChange(room, e.target.value)}>
                                            <option value="" disabled>Select Room</option>
                                            {[...Array(room.availableRooms)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="qty-icon" size={16} />
                                    </div>
                                ) : (
                                    <button className="add-room-btn" onClick={() => setActiveQtySelector(room.id)}>
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
                <div className="guest-info-container">
                    <h2 className="section-title">Guest Information</h2>
                    <p className="section-subtitle">Fill the following form to complete your reservation.</p>
                    <p className="required-notice">* indicates a required field</p>

                    <form onSubmit={handleGuestFormSubmit} className="guest-form">
                        <div className="form-row">
                            <div className="form-group col-title">
                                <label>Title</label>
                                <select value={guestInfo.title} onChange={(e) => setGuestInfo({ ...guestInfo, title: e.target.value })}>
                                    <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
                                </select>
                            </div>
                            <div className="form-group col-name">
                                <label>First Name *</label>
                                <input type="text" required value={guestInfo.firstName} onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })} />
                            </div>
                            <div className="form-group col-name">
                                <label>Last Name *</label>
                                <input type="text" required value={guestInfo.lastName} onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Country</label>
                                <select value={guestInfo.country} onChange={handleCountryChange}>
                                    <option>Indonesia</option>
                                    <option>Singapore</option>
                                    <option>Malaysia</option>
                                    <option>Australia</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mobile Phone *</label>
                                <input type="text" required value={guestInfo.mobile} onChange={handleMobileChange} />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" required value={guestInfo.email} onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Special Request</label>
                            <textarea rows="3" value={guestInfo.specialRequest} onChange={(e) => setGuestInfo({ ...guestInfo, specialRequest: e.target.value })} />
                            <small className="char-count">{guestInfo.specialRequest.length} / 255 characters</small>
                        </div>

                        <h3 className="sub-section-title">Other Info</h3>
                        <div className="form-group">
                            <textarea placeholder="Other info such as your flight number" rows="2" value={guestInfo.otherInfo} onChange={(e) => setGuestInfo({ ...guestInfo, otherInfo: e.target.value })} />
                            <small className="char-count">{guestInfo.otherInfo.length} / 255 characters</small>
                        </div>

                        <h2 className="section-title mt-4">Payment Details</h2>
                        <div className="form-group payment-method-field">
                            <label>Select Payment Method</label>
                            <select required value={guestInfo.paymentMethod} onChange={(e) => setGuestInfo({ ...guestInfo, paymentMethod: e.target.value })}>
                                <option value="" disabled>-Select Payment Method-</option>
                                <option value="CREDIT_CARD">Visa & Master Card (Credit Card)</option>
                                <option value="BANK_TRANSFER">Bank Transfer (VA)</option>
                                <option value="QRIS">QRIS / E-Wallet</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-back" onClick={() => setShowGuestForm(false)}>Back</button>
                            <button type="submit" className="btn-confirm-form">Book</button>
                        </div>
                    </form>
                </div>
            )}

            {/* 4. POP-UP SUMMARY */}
            {showSummary && selectedRoom && (
                <div className="modal-overlay">
                    <div className="summary-modal">
                        <h3>Konfirmasi Pemesanan</h3>
                        <hr />
                        <div className="summary-content">
                            <p><strong>Tamu:</strong> {guestInfo.title} {guestInfo.firstName} {guestInfo.lastName}</p>
                            {/* Logic: Jika ID bukan custom, tampilkan nama paket. Jika custom, tampilkan nama kamar. */}
                            {id && id !== 'custom' ? (
                                <p><strong>Paket:</strong> {dbPackage?.title || selectedRoom.name}</p>
                            ) : (
                                <p><strong>Kamar:</strong> {selectedRoom.name}</p>
                            )}
                            <p><strong>Jumlah Unit:</strong> {bookingQty}</p>
                            <p><strong>Durasi Menginap:</strong> {searchParams.checkIn} s/d {searchParams.checkOut} ({searchParams.nights} Malam)</p>
                            <p><strong>Pembayaran:</strong> {guestInfo.paymentMethod}</p>
                            <div className="total-section">
                                <span>Total Pembayaran:</span>
                                <span className="total-price">IDR {(selectedRoom.price * searchParams.nights * bookingQty).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowSummary(false)}
                                disabled={isProcessing}
                            >
                                Edit Data
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={handlePayment}
                                disabled={isProcessing}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Processing Xendit...
                                    </>
                                ) : (
                                    "Konfirmasi & Bayar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}