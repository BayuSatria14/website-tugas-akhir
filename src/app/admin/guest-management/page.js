"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, CalendarCheck, Users, Settings,
    LogOut, MessageSquare, UserCheck, Send
} from 'lucide-react';
import '../dashboard/Dashboard.css';

export default function GuestManagementPage() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            localStorage.removeItem("isAdminAuthenticated");
            router.push("/admin");
        }
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/packages', icon: <Package size={20} />, label: 'Kelola Packages' },
        { path: '/admin/guest-management', icon: <UserCheck size={20} />, label: 'Manajemen Tamu' },
        { path: '/admin/reservations', icon: <CalendarCheck size={20} />, label: 'Reservasi' },
        { path: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Ulasan' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Pengaturan' }
    ];

    const [checkedInGuests, setCheckedInGuests] = useState([
        {
            id: 1,
            nama: "Kadek Bayu",
            email: "bayu@retreat.com",
            paket: "Ultimate Wellness",
            room: "Suite 01",
            activities: [
                { id: 101, title: "Yoga Shala", time: "05.15", type: "Wellness", reason: "" },
                { id: 102, title: "Tour Ubud", time: "13.00", type: "Tour", reason: "" }
            ]
        },
        {
            id: 2,
            nama: "Siti Aminah",
            email: "siti@example.com",
            paket: "Weekend Yoga",
            room: "Deluxe 05",
            activities: [
                { id: 201, title: "Morning Yoga", time: "07.00", type: "Wellness", reason: "" }
            ]
        }
    ]);

    const [selectedGuest, setSelectedGuest] = useState(null);

    const handleUpdateActivityData = (guestId, activityId, newTitle, newTime, newReason) => {
        const updatedGuests = checkedInGuests.map(guest => {
            if (guest.id === guestId) {
                const updatedActivities = guest.activities.map(act =>
                    act.id === activityId ? { ...act, title: newTitle, time: newTime, reason: newReason } : act
                );
                const updatedGuest = { ...guest, activities: updatedActivities };
                if (selectedGuest?.id === guestId) setSelectedGuest(updatedGuest);
                return updatedGuest;
            }
            return guest;
        });
        setCheckedInGuests(updatedGuests);
    };

    const handleSendNotification = (guest, activity) => {
        if (!activity.reason || activity.reason.trim() === "") {
            alert("⚠️ Berikan alasan perubahan!");
            return;
        }
        alert(`✅ NOTIFIKASI TERKIRIM!\nKepada: ${guest.nama}\nKegiatan: ${activity.title}\nAlasan: ${activity.reason}`);
    };

    return (
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
                <header className="main-header">
                    <h2>Manajemen Tamu</h2>
                    <div className="user-info">
                        <span>Halo, Admin</span>
                        <div className="user-avatar">A</div>
                    </div>
                </header>

                <div className="content-area">
                    <div className="checkin-layout">
                        <div className="guest-list-panel">
                            <div className="panel-header">
                                <h3>Guest Data</h3>
                            </div>
                            <div className="guest-cards-container">
                                {checkedInGuests.map(guest => (
                                    <div
                                        key={guest.id}
                                        className={`guest-selection-card ${selectedGuest?.id === guest.id ? 'active' : ''}`}
                                        onClick={() => setSelectedGuest(guest)}
                                    >
                                        <div className="guest-info-brief">
                                            <strong>{guest.nama}</strong>
                                            <span>{guest.room} • {guest.paket}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="activity-editor-panel">
                            {selectedGuest ? (
                                <>
                                    <div className="editor-header">
                                        <h4>{selectedGuest.nama}</h4>
                                        <p>{selectedGuest.email}</p>
                                    </div>
                                    <div className="activity-items-list">
                                        {selectedGuest.activities.map(act => (
                                            <div key={act.id} className="activity-row-card">
                                                <div className="field-group">
                                                    <label>Kegiatan</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={act.title}
                                                        onChange={(e) => handleUpdateActivityData(
                                                            selectedGuest.id,
                                                            act.id,
                                                            e.target.value,
                                                            act.time,
                                                            act.reason
                                                        )}
                                                    />
                                                </div>
                                                <div className="field-group time-field">
                                                    <label>Waktu</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={act.time}
                                                        onChange={(e) => handleUpdateActivityData(
                                                            selectedGuest.id,
                                                            act.id,
                                                            act.title,
                                                            e.target.value,
                                                            act.reason
                                                        )}
                                                    />
                                                </div>
                                                <div className="field-group">
                                                    <label>Alasan</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Alasan..."
                                                        value={act.reason}
                                                        onChange={(e) => handleUpdateActivityData(
                                                            selectedGuest.id,
                                                            act.id,
                                                            act.title,
                                                            act.time,
                                                            e.target.value
                                                        )}
                                                    />
                                                </div>
                                                <button
                                                    className="send-notif-btn"
                                                    onClick={() => handleSendNotification(selectedGuest, act)}
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <UserCheck size={48} />
                                    <p>Pilih tamu untuk mengelola jadwal</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}