"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Helper colors for the classic modern theme
const colors = {
    bg: '#FAFAF7',
    sidebar: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#6B6B6B',
    accent: '#8B7355',
    accentHover: '#6D5A42',
    border: '#E8E5E0',
    cardBg: '#FFFFFF',
};

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    // If we are on the admin login page, don't show sidebar
    if (pathname === '/admin') {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            await supabase.auth.signOut();
            localStorage.removeItem("isAdminAuthenticated");
            router.push("/admin");
        }
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/packages', icon: <Package size={20} />, label: 'Kelola Packages' },
        { path: '/admin/guest-management', icon: <UserCheck size={20} />, label: 'Jadwal Kegiatan Tamu' },
        { path: '/admin/reservations', icon: <CalendarCheck size={20} />, label: 'Reservasi' },
        { path: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Ulasan' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Pengaturan' }
    ];

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

                .admin-container {
                    display: flex;
                    min-height: 100vh;
                    background-color: ${colors.bg};
                    font-family: 'Inter', sans-serif;
                    color: ${colors.text};
                }

                .admin-sidebar {
                    width: 260px;
                    background: ${colors.sidebar};
                    border-right: 1px solid ${colors.border};
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    z-index: 10;
                }

                .sidebar-header {
                    padding: 32px 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .admin-logo {
                    background: rgba(139,115,85,0.1);
                    color: ${colors.accent};
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 16px;
                }

                .sidebar-header h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px;
                    font-weight: 600;
                    color: ${colors.text};
                    margin: 0;
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    padding: 0 16px;
                    gap: 8px;
                    flex-grow: 1;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: ${colors.textMuted};
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: left;
                }

                .nav-item:hover {
                    background: rgba(139,115,85, 0.05);
                    color: ${colors.accent};
                }

                .nav-item.active {
                    background: ${colors.accent};
                    color: #fff;
                    font-weight: 600;
                }

                .sidebar-footer {
                    padding: 24px 16px;
                    border-top: 1px solid ${colors.border};
                }

                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 12px 16px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: #EF4444;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .logout-btn:hover {
                    background: #FEF2F2;
                }

                .admin-main {
                    flex-grow: 1;
                    margin-left: 260px;
                    display: flex;
                    flex-direction: column;
                }

                .main-header {
                    background: ${colors.cardBg};
                    padding: 24px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid ${colors.border};
                }

                .main-header h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px;
                    font-weight: 600;
                    color: ${colors.text};
                    margin: 0;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .user-info span {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: ${colors.textMuted};
                }

                .user-avatar {
                    background: rgba(139,115,85,0.1);
                    color: ${colors.accent};
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                }

                .content-area {
                    padding: 40px;
                    flex-grow: 1;
                }

                /* TABLE STYLES REUSED EVERYWHERE */
                .admin-table-container {
                    overflow-x: auto;
                }

                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .admin-table th {
                    text-align: left;
                    padding: 16px;
                    font-size: 13px;
                    font-weight: 600;
                    color: ${colors.textMuted};
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid ${colors.border};
                    background: rgba(0,0,0,0.01);
                }

                .admin-table td {
                    padding: 16px;
                    font-size: 14px;
                    color: ${colors.text};
                    border-bottom: 1px solid rgba(0,0,0,0.04);
                }

                .admin-table tbody tr:hover {
                    background: rgba(0,0,0,0.01);
                }

                .badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .badge.pending { background: #FEF3C7; color: #D97706; }
                .badge.confirmed, .badge.paid { background: #D1FAE5; color: #059669; }
                .badge.cancelled { background: #FEE2E2; color: #DC2626; }
            `}</style>
            
            <div className="admin-container">
                <aside className="admin-sidebar">
                    <div className="sidebar-header">
                        <div className="admin-logo">TD</div>
                        <h3>Admin Panel</h3>
                    </div>
                    <nav className="sidebar-nav">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                                onClick={() => router.push(item.path)}
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </nav>
                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={20} /> Keluar
                        </button>
                    </div>
                </aside>
                <main className="admin-main">
                    {children}
                </main>
            </div>
        </>
    );
}
