'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2, ArrowLeft, ChevronLeft } from 'lucide-react';

export default function PaymentSimulationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingData, setBookingData] = useState(null);

    const bookingId = searchParams.get('bookingId');
    const amount = searchParams.get('amount') || "0";
    const paymentMethod = searchParams.get('paymentMethod');

    useEffect(() => {
        // Try to get more details from localStorage if available
        const savedBooking = localStorage.getItem('currentBooking');
        if (savedBooking) {
            setBookingData(JSON.parse(savedBooking));
        }
    }, []);

    const [selectedBank, setSelectedBank] = useState(null);
    const [selectedCardType, setSelectedCardType] = useState(null);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: ''
    });

    const handleCardInput = (field, value) => {
        let cleanValue = value.replace(/\D/g, ''); // Only numbers

        if (field === 'number') {
            if (cleanValue.length > 16) return;
            // Format: 1234 5678 1234 5678
            let formatted = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
            setCardDetails(prev => ({ ...prev, number: formatted }));
        } else if (field === 'expiry') {
            if (cleanValue.length > 4) return; // MMYY
            let formatted = cleanValue;
            if (cleanValue.length >= 2) {
                formatted = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2);
            }
            setCardDetails(prev => ({ ...prev, expiry: formatted }));
        } else if (field === 'cvv') {
            if (cleanValue.length > 3) return;
            setCardDetails(prev => ({ ...prev, cvv: cleanValue }));
        }
    };

    const isPaymentReady = () => {
        if (paymentMethod === 'BANK_TRANSFER' && !selectedBank) return false;
        if (paymentMethod === 'CREDIT_CARD') {
            if (!selectedCardType) return false;
            // Remove spaces for validation
            if (cardDetails.number.replace(/\s/g, '').length !== 16) return false;
            if (cardDetails.expiry.length !== 5) return false; // MM/YY
            if (cardDetails.cvv.length !== 3) return false;
        }
        return true;
    };

    const handleSimulatePayment = async () => {
        if (!isPaymentReady()) {
            alert("Please select a Bank or Card Type first!");
            return;
        }

        setIsProcessing(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Redirect to success URL
        router.push(`/booking/success?bookingId=${bookingId || 'TEST-123'}`);
    };

    const handleCancel = () => {
        router.push('/booking/failed');
    };

    const LOGO_URLS = {
        BCA: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
        Mandiri: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg",
        BNI: "https://jasalogocepat.com/wp-content/uploads/2023/12/Logo-Bank-BNI-PNG.png",
        BRI: "https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg",
        Permata: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Permata_Bank_%282024%29.svg/1280px-Permata_Bank_%282024%29.svg.png?20240929144104",
        Visa: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
        Mastercard: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
    };

    const renderPaymentDetails = () => {
        let title = "";
        let content = null;

        if (paymentMethod === 'QRIS') {
            title = "QRIS / E-Wallet";
            content = (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <p style={{ fontWeight: '600', marginBottom: '10px', fontSize: '0.9rem', color: '#6b7280' }}>Scan QR Code</p>
                    <div style={{
                        width: '180px',
                        height: '180px',
                        background: '#f0f0f0',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #ccc'
                    }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            [ DUMMY QR CODE ]<br /><br />
                            IDR {parseInt(amount).toLocaleString()}
                        </div>
                    </div>
                </div>
            );
        } else if (paymentMethod === 'BANK_TRANSFER') {
            title = "Bank Transfer (VA)";
            if (!selectedBank) {
                content = (
                    <div style={{ margin: '1rem 0' }}>
                        <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#4b5563' }}>Select Bank:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {['BCA', 'Mandiri', 'BNI', 'BRI', 'Permata'].map((bank) => (
                                <button
                                    key={bank}
                                    onClick={() => setSelectedBank(bank)}
                                    style={{
                                        padding: '10px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        background: 'white',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        color: '#374151',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {LOGO_URLS[bank] && <img src={LOGO_URLS[bank]} alt={bank} style={{ height: '30px', objectFit: 'contain' }} />}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            } else {
                content = (
                    <div style={{ margin: '1rem 0' }}>
                        <button
                            onClick={() => setSelectedBank(null)}
                            style={{
                                fontSize: '0.8rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <ChevronLeft size={16} /> Change Bank
                        </button>
                        <div style={{ background: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                {LOGO_URLS[selectedBank] && <img src={LOGO_URLS[selectedBank]} alt={selectedBank} style={{ height: '24px' }} />}
                                <p style={{ fontSize: '0.9rem', color: '#92400e' }}>Virtual Account</p>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px', color: '#b45309' }}>8800 1234 5678 900</p>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Check for automatic verification</p>
                        </div>
                    </div>
                );
            }
        } else if (paymentMethod === 'CREDIT_CARD') {
            title = "Credit Card Payment";
            if (!selectedCardType) {
                content = (
                    <div style={{ margin: '1rem 0' }}>
                        <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#4b5563' }}>Select Card Type:</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setSelectedCardType('Visa')}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    color: '#1a1f71',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '10px'
                                }}
                            >
                                <img src={LOGO_URLS['Visa']} alt="Visa" style={{ height: '35px', objectFit: 'contain' }} />
                            </button>
                            <button
                                onClick={() => setSelectedCardType('Mastercard')}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    color: '#eb001b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '10px'
                                }}
                            >
                                <img src={LOGO_URLS['Mastercard']} alt="Mastercard" style={{ height: '35px', objectFit: 'contain' }} />
                            </button>
                        </div>
                    </div>
                );
            } else {
                content = (
                    <div style={{ margin: '1rem 0' }}>
                        <button
                            onClick={() => setSelectedCardType(null)}
                            style={{
                                fontSize: '0.8rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <ChevronLeft size={16} /> Change Card
                        </button>
                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                <img src={LOGO_URLS[selectedCardType]} alt={selectedCardType} style={{ height: '24px' }} />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Card Number (16 digits)</label>
                                <input
                                    value={cardDetails.number}
                                    onChange={(e) => handleCardInput('number', e.target.value)}
                                    placeholder="0000 0000 0000 0000"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', letterSpacing: '1px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Expiry (MM/YY)</label>
                                    <input
                                        value={cardDetails.expiry}
                                        onChange={(e) => handleCardInput('expiry', e.target.value)}
                                        placeholder="MM/YY"
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', textAlign: 'center' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>CVV (3 digits)</label>
                                    <input
                                        type="password"
                                        value={cardDetails.cvv}
                                        onChange={(e) => handleCardInput('cvv', e.target.value)}
                                        placeholder="123"
                                        maxLength={3}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', textAlign: 'center' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        }

        if (!title) return null;

        return (
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Selected Payment Method:</p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>
                    {title}
                </h3>
                {content}
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                maxWidth: '450px',
                width: '100%'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: '#eff6ff',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <CreditCard size={32} color="#2563eb" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Payment Simulation</h2>
                    <p style={{ color: '#6b7280' }}>Xendit Checkout Demo</p>
                </div>

                {renderPaymentDetails()}

                <div style={{ marginBottom: '2rem', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#6b7280' }}>Booking ID</span>
                        <span style={{ fontWeight: '600' }}>{bookingId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Total Amount</span>
                        <span style={{ fontWeight: 'bold', color: '#059669' }}>
                            IDR {parseInt(amount).toLocaleString()}
                        </span>
                    </div>
                    {bookingData && (
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e5e7eb' }}>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Guest: {bookingData.guestInfo?.firstName} {bookingData.guestInfo?.lastName}
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing || !isPaymentReady()}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: isPaymentReady() ? '#2563eb' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        cursor: (isProcessing || !isPaymentReady()) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        transition: '0.3s'
                    }}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> Processing...
                        </>
                    ) : (
                        !isPaymentReady() ? 'Select Payment Details' : 'Pay Now (Simulate)'
                    )}
                </button>

                <button
                    onClick={handleCancel}
                    disabled={isProcessing}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'transparent',
                        color: '#4b5563',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: isProcessing ? 'not-allowed' : 'pointer'
                    }}
                >
                    Cancel Transaction
                </button>
            </div>
        </div>
    );
}
