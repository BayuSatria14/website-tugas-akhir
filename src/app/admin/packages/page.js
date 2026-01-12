"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard, Package, CalendarCheck, Settings,
    LogOut, MessageSquare, UserCheck, Plus, Edit, Trash2, ArrowLeft, Save, Eye
} from 'lucide-react';
import '../dashboard/Dashboard.css';
import './Packages.css';

export default function PackagesPage() {
    const router = useRouter();
    const pathname = usePathname();

    // States
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list', 'form', atau 'detail'
    const [currentPackage, setCurrentPackage] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        duration_days: '',
        duration_nights: '',
        description: '',
        features: '',
        status: 'Active',
        image_url: '',
        itinerary: []
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('packages')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setPackages(data);
        setIsLoading(false);
    };

    const resetForm = () => {
        setCurrentPackage(null);
        setFormData({
            title: '', price: '', duration_days: '', duration_nights: '',
            description: '', features: '', status: 'Active', image_url: '',
            itinerary: []
        });
        setImageFile(null);
        setImagePreview("");
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
    };

    const handleDayChange = (days) => {
        const numDays = parseInt(days) || 0;
        let newItinerary = [...formData.itinerary];
        if (numDays > newItinerary.length) {
            for (let i = newItinerary.length; i < numDays; i++) {
                newItinerary.push({ day: i + 1, activities: '' });
            }
        } else {
            newItinerary = newItinerary.slice(0, numDays);
        }
        setFormData({ ...formData, duration_days: days, itinerary: newItinerary });
    };

    const handleItineraryChange = (index, value) => {
        const updatedItinerary = [...formData.itinerary];
        updatedItinerary[index] = { ...updatedItinerary[index], activities: value };
        setFormData({ ...formData, itinerary: updatedItinerary });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let finalImageUrl = formData.image_url;
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `packages/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('package-images').upload(filePath, imageFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('package-images').getPublicUrl(filePath);
                finalImageUrl = publicUrl;
            }

            const finalDuration = `${formData.duration_days} Hari ${formData.duration_nights} Malam`;
            const payload = {
                title: formData.title,
                price: parseFloat(formData.price),
                duration: finalDuration,
                description: formData.description,
                features: formData.features,
                status: formData.status,
                image_url: finalImageUrl,
                itinerary: formData.itinerary
            };

            if (currentPackage) {
                await supabase.from('packages').update(payload).eq('id', currentPackage.id);
            } else {
                await supabase.from('packages').insert([payload]);
            }

            alert("Berhasil disimpan!");
            resetForm();
            setView('list');
            fetchPackages();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewClick = (pkg) => {
        setCurrentPackage(pkg);
        setView('detail');
    };

    const handleEditClick = (pkg) => {
        setCurrentPackage(pkg);
        const durationParts = pkg.duration ? pkg.duration.match(/\d+/g) : [];
        setFormData({
            title: pkg.title,
            price: pkg.price,
            duration_days: durationParts ? durationParts[0] || '' : '',
            duration_nights: durationParts ? durationParts[1] || '' : '',
            description: pkg.description || '',
            features: pkg.features || '',
            status: pkg.status,
            image_url: pkg.image_url || '',
            itinerary: pkg.itinerary || []
        });
        setImagePreview(pkg.image_url || "");
        setView('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Hapus paket ini?")) {
            await supabase.from('packages').delete().eq('id', id);
            fetchPackages();
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

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-logo">TD</div>
                    <h3>Admin Panel</h3>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button key={item.path} className={`nav-item ${pathname === item.path ? 'active' : ''}`} onClick={() => router.push(item.path)}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={() => router.push("/admin")}><LogOut size={20} /> Keluar</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="main-header">
                    <h2>{view === 'list' ? 'Kelola Packages' : view === 'detail' ? 'Detail Package' : 'Form Package'}</h2>
                </header>

                <div className="content-area">
                    {view === 'list' ? (
                        <div className="packages-overview-section">
                            <div className="section-header-with-button">
                                <h3>Daftar Paket Wellness</h3>
                                <button className="add-btn" onClick={() => { setView('form'); resetForm(); }}>
                                    <Plus size={20} /> Tambah Paket
                                </button>
                            </div>
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Nama Paket</th>
                                            <th>Durasi</th>
                                            <th>Harga</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? <tr><td colSpan="5">Memuat...</td></tr> :
                                            packages.map((pkg) => (
                                                <tr key={pkg.id}>
                                                    <td><strong>{pkg.title}</strong></td>
                                                    <td>{pkg.duration}</td>
                                                    <td>Rp {pkg.price.toLocaleString('id-ID')}</td>
                                                    <td><span className={`badge ${pkg.status === 'Active' ? 'success' : 'danger'}`}>{pkg.status}</span></td>
                                                    <td>
                                                        <div className="action-btns">
                                                            <button className="view-btn" title="Lihat Detail" onClick={() => handleViewClick(pkg)}><Eye size={16} /></button>
                                                            <button className="edit-btn" title="Edit" onClick={() => handleEditClick(pkg)}><Edit size={16} /></button>
                                                            <button className="delete-btn" title="Hapus" onClick={() => handleDelete(pkg.id)}><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : view === 'detail' ? (
                        <div className="package-detail-container">
                            <button className="btn-back" onClick={() => setView('list')}>
                                <ArrowLeft size={18} /> Kembali
                            </button>

                            <div className="detail-header">
                                <div className="detail-image-wrapper">
                                    <img src={currentPackage.image_url} alt={currentPackage.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div className="detail-info">
                                    <h3>{currentPackage.title}</h3>
                                    <p className="detail-price">Rp {currentPackage.price.toLocaleString('id-ID')}</p>
                                    <p><b>Durasi:</b> {currentPackage.duration}</p>
                                    <span className={`badge ${currentPackage.status === 'Active' ? 'success' : 'danger'}`}>{currentPackage.status}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Deskripsi</h4>
                                <p>{currentPackage.description}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Fasilitas</h4>
                                <div className="features-list">
                                    {currentPackage.features.split(',').map((f, i) => (
                                        <span key={i} className="feature-tag">{f.trim()}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Jadwal Kegiatan (Itinerary)</h4>
                                <div className="view-itinerary-grid">
                                    {currentPackage.itinerary && currentPackage.itinerary.map((item, index) => (
                                        <div key={index} className="view-itinerary-item">
                                            <b>Hari ke-{item.day}</b>
                                            <p style={{ whiteSpace: 'pre-line' }}>{item.activities}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="package-form-container">
                            <button className="btn-back" onClick={() => setView('list')}>
                                <ArrowLeft size={18} /> Kembali ke Daftar
                            </button>

                            <form onSubmit={handleSave}>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Nama Paket Wellness</label>
                                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Harga (Rp)</label>
                                        <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Durasi Paket</label>
                                        <div className="duration-inputs">
                                            <input type="number" className="duration-field" value={formData.duration_days} onChange={(e) => handleDayChange(e.target.value)} required />
                                            <span className="duration-label">Hari</span>
                                            <input type="number" className="duration-field" value={formData.duration_nights} onChange={(e) => setFormData({ ...formData, duration_nights: e.target.value })} required />
                                            <span className="duration-label">Malam</span>
                                        </div>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Deskripsi Paket</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required></textarea>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Fasilitas (Pisahkan dengan koma)</label>
                                        <textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} required></textarea>
                                    </div>
                                    <div className="form-group full-width">
                                        <div className="itinerary-section">
                                            <label>Jadwal Kegiatan (Itinerary)</label>
                                            {formData.itinerary.map((item, index) => (
                                                <div key={index} className="itinerary-day-item">
                                                    <h4>Hari ke-{index + 1}</h4>
                                                    <textarea
                                                        value={item.activities}
                                                        onChange={(e) => handleItineraryChange(index, e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Gambar</label>
                                        <input type="file" accept="image/*" className="file-input-custom" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                                        }} />
                                        <div className="preview-box">
                                            {imagePreview ? <img src={imagePreview} className="preview-img" alt="Preview" /> : <span>Pratinjau Gambar</span>}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="Active">Aktif</option>
                                            <option value="Non Active">Non-Aktif</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setView('list')}>Batal</button>
                                    <button type="submit" className="btn-primary" disabled={isLoading}>
                                        <Save size={18} style={{ marginRight: '8px' }} /> Simpan Paket
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}