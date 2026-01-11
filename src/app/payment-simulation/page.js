'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2, ChevronLeft, QrCode } from 'lucide-react';

export default function PaymentSimulationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingData, setBookingData] = useState(null);

    const bookingId = searchParams.get('bookingId');
    const amount = searchParams.get('amount') || "0";
    // Allow fallback if not in URL
    const initialPaymentMethod = searchParams.get('paymentMethod');

    const [currentMethod, setCurrentMethod] = useState(initialPaymentMethod);
    const [selectedBank, setSelectedBank] = useState(null);
    const [selectedCardType, setSelectedCardType] = useState(null);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

    useEffect(() => {
        // Try to get more details from localStorage if available
        const savedBooking = localStorage.getItem('currentBooking');
        if (savedBooking) {
            setBookingData(JSON.parse(savedBooking));
        }
    }, []);

    const handleCardInput = (field, value) => {
        let cleanValue = value.replace(/\D/g, ''); // Only numbers
        if (field === 'number') {
            if (cleanValue.length > 16) return;
            let formatted = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
            setCardDetails(prev => ({ ...prev, number: formatted }));
        } else if (field === 'expiry') {
            if (cleanValue.length > 4) return; // MMYY
            let formatted = cleanValue;
            if (cleanValue.length >= 2) formatted = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2);
            setCardDetails(prev => ({ ...prev, expiry: formatted }));
        } else if (field === 'cvv') {
            if (cleanValue.length > 3) return;
            setCardDetails(prev => ({ ...prev, cvv: cleanValue }));
        }
    };

    const isPaymentReady = () => {
        if (!currentMethod) return false;
        if (currentMethod === 'BANK_TRANSFER' && !selectedBank) return false;
        if (currentMethod === 'CREDIT_CARD') {
            if (!selectedCardType) return false;
            if (cardDetails.number.replace(/\s/g, '').length !== 16) return false;
            if (cardDetails.expiry.length !== 5) return false;
            if (cardDetails.cvv.length !== 3) return false;
        }
        return true;
    };

    const handleSimulatePayment = async () => {
        if (!isPaymentReady()) return;

        setIsProcessing(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Call Webhook Simulation (Optional, but good for testing)
        // In real Xendit, Xendit calls your webhook. Here we manually trigger it or just redirect.
        try {
            await fetch('/api/xendit-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    external_id: bookingId,
                    status: 'PAID', // Simulating callback
                    amount: amount
                })
            });
        } catch (e) {
            console.error("Webhook trigger failed", e);
        }

        router.push(`/booking/success?bookingId=${bookingId || 'TEST-123'}`);
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

    const renderMethodSelection = () => (
        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Select Payment Method:</p>
            <button
                onClick={() => setCurrentMethod('BANK_TRANSFER')}
                style={{
                    padding: '15px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold'
                }}
            >
                Bank Transfer (VA)
            </button>
            <button
                onClick={() => setCurrentMethod('CREDIT_CARD')}
                style={{
                    padding: '15px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold'
                }}
            >
                <CreditCard size={20} /> Credit Card
            </button>
            <button
                onClick={() => setCurrentMethod('QRIS')}
                style={{
                    padding: '15px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold'
                }}
            >
                <QrCode size={20} /> QRIS
            </button>
        </div>
    );

    const renderPaymentDetails = () => {
        if (!currentMethod) return renderMethodSelection();

        let title = "";
        let content = null;

        if (currentMethod === 'QRIS') {
            title = "QRIS";
            content = (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <div style={{
                        width: '200px', height: '200px', background: 'white', margin: '0 auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #000'
                    }}>
                        {/* Placeholder QR */}
                        <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SimulatePayment"
                            alt="QRIS"
                        />
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>Scan with any e-wallet</p>
                </div>
            );
        } else if (currentMethod === 'BANK_TRANSFER') {
            title = "Bank Transfer";
            if (!selectedBank) {
                content = (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '1rem 0' }}>
                        {['BCA', 'Mandiri', 'BNI', 'BRI', 'Permata'].map((bank) => (
                            <button
                                key={bank}
                                onClick={() => setSelectedBank(bank)}
                                style={{
                                    height: '60px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '5px'
                                }}
                            >
                                <img src={LOGO_URLS[bank]} alt={bank} style={{ maxHeight: '30px', maxWidth: '100%', objectFit: 'contain' }} />
                            </button>
                        ))}
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
                        <div style={{ textAlign: 'center', padding: '20px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                            <img src={LOGO_URLS[selectedBank]} alt={selectedBank} style={{ height: '30px', marginBottom: '10px' }} />
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>8800 1234 5678</p>
                        </div>
                    </div>
                );
            }
        } else if (currentMethod === 'CREDIT_CARD') {
            title = "Credit Card";
            if (!selectedCardType) {
                content = (
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '1rem 0' }}>
                        {['Visa', 'Mastercard'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedCardType(type)}
                                style={{
                                    width: '100px',
                                    height: '60px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px'
                                }}
                            >
                                <img src={LOGO_URLS[type]} alt={type} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            </button>
                        ))}
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
                            <img src={LOGO_URLS[selectedCardType]} alt={selectedCardType} style={{ height: '20px', marginBottom: '10px', display: 'block', marginLeft: 'auto' }} />
                            <input
                                value={cardDetails.number}
                                onChange={(e) => handleCardInput('number', e.target.value)}
                                placeholder="0000 0000 0000 0000"
                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    value={cardDetails.expiry}
                                    onChange={(e) => handleCardInput('expiry', e.target.value)}
                                    placeholder="MM/YY"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                                <input
                                    type="password"
                                    value={cardDetails.cvv}
                                    onChange={(e) => handleCardInput('cvv', e.target.value)}
                                    placeholder="CVV"
                                    maxLength={3}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                        </div>
                    </div>
                );
            }
        }

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{title}</h3>
                    {!initialPaymentMethod && (
                        <button onClick={() => setCurrentMethod(null)} style={{ fontSize: '0.8rem', color: '#6b7280' }}>Change</button>
                    )}
                </div>
                {content}
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '20px' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', maxWidth: '450px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Payment Simulation</h2>
                    <p style={{ color: '#6b7280' }}>Total: IDR {parseInt(amount).toLocaleString()}</p>
                </div>

                {renderPaymentDetails()}

                <button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing || !isPaymentReady()}
                    style={{
                        width: '100%', padding: '0.9rem', marginTop: '1rem',
                        background: isPaymentReady() ? '#2563eb' : '#cbd5e1',
                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold',
                        cursor: isPaymentReady() ? 'pointer' : 'not-allowed',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                    }}
                >
                    {isProcessing ? <><Loader2 className="animate-spin" /> Processing...</> : 'Pay Now'}
                </button>
            </div>
        </div>
    );
}
