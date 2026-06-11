'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/home');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFAF7',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ textAlign: 'center', animation: 'fadeIn 1s ease-out' }}>
        {/* Brand Logo */}
        <div style={{
          animation: 'pulseLogo 2.5s infinite ease-in-out',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <img
            src="/logo_td_1.png"
            alt="The Dukuh Retreat Logo"
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Brand Text */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '28px',
          fontWeight: '600',
          color: '#1A1A1A',
          margin: '0 0 4px',
          letterSpacing: '0.5px'
        }}>
          The Dukuh Retreat
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          fontWeight: '600',
          color: '#8B7355',
          margin: 0,
          letterSpacing: '3px',
          textTransform: 'uppercase'
        }}>
          Yoga & Wellness
        </p>

        {/* Elegant Minimalist Loader */}
        <div style={{
          width: '36px',
          height: '36px',
          border: '2px solid rgba(139, 115, 85, 0.1)',
          borderTop: '2px solid #8B7355',
          borderRadius: '50%',
          animation: 'spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite',
          margin: '40px auto 0'
        }}></div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseLogo {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.92;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}