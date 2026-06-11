"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard, Package, CalendarCheck, Settings,
    LogOut, MessageSquare, UserCheck, Plus, Edit, Trash2, ArrowLeft, Save, Eye,
    ZoomIn, ZoomOut, Crop
} from 'lucide-react';


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

    // Image Cropper States
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState("");
    const [cropImageName, setCropImageName] = useState("package-image.jpg");
    const [cropZoom, setCropZoom] = useState(1);
    const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
    const [imageDims, setImageDims] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isImageLoading, setIsImageLoading] = useState(false);
    
    const imgRef = React.useRef(null);
    const viewportRef = React.useRef(null);

    // Dynamic drag-drop listener for the window boundary
    useEffect(() => {
        if (!isDragging) return;

        const handleWindowMouseMove = (e) => {
            handleDragMove(e.clientX, e.clientY);
        };
        
        const handleWindowTouchMove = (e) => {
            if (e.touches.length === 1) {
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleWindowMouseUp = () => {
            handleEndDrag();
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
        window.addEventListener('touchmove', handleWindowTouchMove);
        window.addEventListener('touchend', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
            window.removeEventListener('touchmove', handleWindowTouchMove);
            window.removeEventListener('touchend', handleWindowMouseUp);
        };
    }, [isDragging, dragStart, cropOffset, cropZoom, imageDims]);

    // Handlers for image loading and zoom/panning
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCropImageName(file.name);
            const objectUrl = URL.createObjectURL(file);
            setCropImageSrc(objectUrl);
            setIsImageLoading(true);
            setIsCropModalOpen(true);
            e.target.value = "";
        }
    };

    const handleAdjustExistingImage = () => {
        if (imagePreview) {
            setCropImageSrc(imagePreview);
            let filename = 'package-image.jpg';
            if (imageFile) {
                filename = imageFile.name;
            } else if (formData.image_url) {
                filename = formData.image_url.split('/').pop() || 'package-image.jpg';
            }
            setCropImageName(filename);
            setIsImageLoading(true);
            setIsCropModalOpen(true);
        }
    };

    const handleImageLoad = (e) => {
        setIsImageLoading(false);
        const img = e.target;
        const viewport = viewportRef.current;
        if (!viewport) return;

        const vWidth = viewport.clientWidth;
        const vHeight = viewport.clientHeight;
        const vRatio = vWidth / vHeight;

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const imgRatio = imgWidth / imgHeight;

        let baseScale = 1;
        if (imgRatio > vRatio) {
            baseScale = vHeight / imgHeight;
        } else {
            baseScale = vWidth / imgWidth;
        }

        const renderW = imgWidth * baseScale;
        const renderH = imgHeight * baseScale;

        // Centered coordinates
        const initialX = (vWidth - renderW) / 2;
        const initialY = (vHeight - renderH) / 2;

        setImageDims({
            naturalWidth: imgWidth,
            naturalHeight: imgHeight,
            baseScale,
            renderWidth: renderW,
            renderHeight: renderH,
            vWidth,
            vHeight
        });

        setCropOffset({ x: initialX, y: initialY });
        setCropZoom(1);
    };

    const handleZoomChange = (e) => {
        const newZoom = parseFloat(e.target.value);
        if (!imageDims || !viewportRef.current) {
            setCropZoom(newZoom);
            return;
        }

        const vWidth = imageDims.vWidth;
        const vHeight = imageDims.vHeight;
        const cx = vWidth / 2;
        const cy = vHeight / 2;
        const prevZoom = cropZoom;

        const newW = imageDims.renderWidth * newZoom;
        const newH = imageDims.renderHeight * newZoom;

        let newX = cx - (cx - cropOffset.x) * (newZoom / prevZoom);
        let newY = cy - (cy - cropOffset.y) * (newZoom / prevZoom);

        newX = Math.max(vWidth - newW, Math.min(0, newX));
        newY = Math.max(vHeight - newH, Math.min(0, newY));

        setCropZoom(newZoom);
        setCropOffset({ x: newX, y: newY });
    };

    const handleStartDrag = (clientX, clientY) => {
        if (!imageDims) return;
        setIsDragging(true);
        setDragStart({
            x: clientX - cropOffset.x,
            y: clientY - cropOffset.y
        });
    };

    const handleDragMove = (clientX, clientY) => {
        if (!isDragging || !imageDims) return;
        let newX = clientX - dragStart.x;
        let newY = clientY - dragStart.y;

        const wActual = imageDims.renderWidth * cropZoom;
        const hActual = imageDims.renderHeight * cropZoom;

        newX = Math.max(imageDims.vWidth - wActual, Math.min(0, newX));
        newY = Math.max(imageDims.vHeight - hActual, Math.min(0, newY));

        setCropOffset({ x: newX, y: newY });
    };

    const handleEndDrag = () => {
        setIsDragging(false);
    };

    const applyCrop = () => {
        if (!imageDims || !imgRef.current) return;

        const canvas = document.createElement('canvas');
        const targetWidth = 1200;
        const targetHeight = 800;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const scaleCanvas = targetWidth / imageDims.vWidth;
        const wDraw = imageDims.renderWidth * cropZoom * scaleCanvas;
        const hDraw = imageDims.renderHeight * cropZoom * scaleCanvas;
        const xDraw = cropOffset.x * scaleCanvas;
        const yDraw = cropOffset.y * scaleCanvas;

        ctx.drawImage(imgRef.current, xDraw, yDraw, wDraw, hDraw);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], cropImageName, { type: 'image/jpeg', lastModified: Date.now() });
                setImageFile(file);
                
                if (imagePreview && imagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePreview);
                }
                
                setImagePreview(URL.createObjectURL(file));
                setIsCropModalOpen(false);
            }
        }, 'image/jpeg', 0.92);
    };

    const onMouseDown = (e) => {
        e.preventDefault();
        handleStartDrag(e.clientX, e.clientY);
    };

    const onTouchStart = (e) => {
        if (e.touches.length === 1) {
            handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

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
        setCropImageSrc("");
        setCropZoom(1);
        setCropOffset({ x: 0, y: 0 });
        setImageDims(null);
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

    return (
        <>
            <style jsx>{`
                .packages-container { padding: 20px; }
                
                .package-form-container {
                    background: white;
                    padding: 32px 40px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0,0,0,0.04);
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .form-group.full-width { grid-column: span 2; }
                
                .form-group label {
                    font-weight: 600;
                    color: #1A1A1A;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .form-group input, .form-group textarea, .form-group select {
                    padding: 14px;
                    border: 1px solid #E8E5E0;
                    border-radius: 10px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.3s, box-shadow 0.3s;
                    font-family: 'Inter', sans-serif;
                }
                
                .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
                    border-color: #8B7355;
                    box-shadow: 0 0 0 3px rgba(139,115,85, 0.1);
                }
                
                .file-input-custom {
                    padding: 12px;
                    background: #FAFAF7;
                    border: 2px dashed #E8E5E0;
                    cursor: pointer;
                    border-radius: 10px;
                    text-align: center;
                    transition: border-color 0.3s;
                }
                
                .file-input-custom:hover {
                    border-color: #8B7355;
                }
                
                .duration-inputs { display: flex; align-items: center; gap: 12px; }
                .duration-field { width: 80px !important; text-align: center; }
                .duration-label { font-size: 14px; color: #6B6B6B; font-weight: 500; }
                
                .preview-box {
                    width: 100%; height: 200px;
                    border-radius: 12px; border: 1px solid #E8E5E0;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden; background: #FAFAF7; margin-top: 12px;
                }
                
                .preview-img { width: 100%; height: 100%; object-fit: cover; }
                
                .form-actions { display: flex; gap: 16px; justify-content: flex-end; margin-top: 32px; }
                
                .btn-primary {
                    background: #1A1A1A; color: white; border: none;
                    padding: 14px 28px; border-radius: 10px; cursor: pointer;
                    font-weight: 600; display: flex; align-items: center;
                    font-family: 'Inter', sans-serif; letter-spacing: 0.5px;
                    transition: background 0.3s, transform 0.2s;
                }
                
                .btn-primary:hover { background: #8B7355; transform: translateY(-2px); }
                
                .btn-secondary {
                    background: #FAFAF7; color: #1A1A1A; border: 1px solid #E8E5E0;
                    padding: 14px 28px; border-radius: 10px; cursor: pointer;
                    font-weight: 600; font-family: 'Inter', sans-serif; transition: all 0.3s;
                }
                
                .btn-secondary:hover { background: #E8E5E0; }
                
                .btn-back {
                    background: none; border: none; padding: 0; margin-bottom: 24px;
                    display: flex; align-items: center; gap: 8px; color: #6B6B6B;
                    cursor: pointer; font-size: 14px; font-weight: 600; text-transform: uppercase;
                    transition: color 0.3s;
                }
                
                .btn-back:hover { color: #8B7355; }
                
                .itinerary-section {
                    margin-top: 24px; padding: 24px; background: #FAFAF7;
                    border-radius: 12px; border: 1px solid #E8E5E0;
                }
                
                .itinerary-day-item {
                    background: white; padding: 20px; border-radius: 10px;
                    margin-bottom: 16px; border-left: 4px solid #8B7355;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                }
                
                .itinerary-day-item h4 { margin-bottom: 12px; color: #1A1A1A; font-size: 15px; font-weight: 600; }
                .itinerary-day-item textarea { width: 100%; min-height: 80px; padding: 12px; border: 1px solid #E8E5E0; border-radius: 8px; resize: vertical; }
                .helper-text { font-size: 12px; color: #6B6B6B; margin-bottom: 16px; font-style: italic; }
                
                .package-detail-container {
                    background: white; padding: 40px; border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04);
                    max-width: 900px; margin: 0 auto;
                }
                
                .detail-header { display: flex; gap: 32px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E8E5E0; }
                .detail-image-wrapper { width: 320px; height: 220px; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
                .detail-info h3 { font-family: 'Playfair Display', serif; font-size: 28px; color: #1A1A1A; margin-bottom: 12px; }
                .detail-price { font-size: 22px; font-weight: 700; color: #8B7355; margin-bottom: 16px; }
                
                .detail-section { margin-bottom: 32px; }
                .detail-section h4 {
                    color: #1A1A1A; border-left: 4px solid #8B7355; padding-left: 12px;
                    margin-bottom: 16px; font-size: 16px; font-weight: 600; text-transform: uppercase;
                }
                .detail-section p { line-height: 1.8; color: #6B6B6B; font-size: 15px; }
                
                .features-list { display: flex; flex-wrap: wrap; gap: 12px; }
                .feature-tag {
                    background: transparent; color: #8B7355; padding: 6px 14px;
                    border-radius: 6px; font-size: 13px; font-weight: 600;
                    border: 1px solid rgba(139,115,85, 0.2); text-transform: uppercase;
                }
                
                .view-itinerary-grid { display: grid; gap: 16px; }
                .view-itinerary-item { background: #FAFAF7; padding: 20px; border-radius: 10px; border: 1px solid #E8E5E0; }
                .view-itinerary-item b { display: block; margin-bottom: 8px; color: #1A1A1A; font-weight: 600; }
                
                .packages-overview-section { background: white; border-radius: 16px; padding: 32px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                .action-btns { display: flex; gap: 8px; }
                .action-btns button {
                    background: #FAFAF7; border: 1px solid #E8E5E0; padding: 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;
                }
                .view-btn { color: #8B7355; }
                .view-btn:hover { background: #8B7355; color: white; }
                .edit-btn { color: #8B7355; }
                .edit-btn:hover { background: #8B7355; color: white; }
                .delete-btn { color: #EF4444; }
                .delete-btn:hover { background: #EF4444; color: white; border-color: #EF4444; }
                .badge.success { background: #D1FAE5; color: #059669; }
                .badge.danger { background: #FEE2E2; color: #DC2626; }
                
                .section-header-with-button { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .section-header-with-button h3 { font-family: 'Playfair Display', serif; font-size: 20px; color: #1A1A1A; margin: 0; }
                .add-btn {
                    background: #1A1A1A; color: white; border: none; padding: 12px 20px;
                    border-radius: 8px; cursor: pointer; font-weight: 600; font-family: 'Inter', sans-serif;
                    display: flex; align-items: center; gap: 8px; transition: background 0.3s;
                }
                .add-btn:hover { background: #8B7355; }

                /* Premium Cropper CSS styling */
                .crop-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(18, 18, 16, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .crop-modal-container {
                    background: white;
                    width: 90%;
                    max-width: 580px;
                    border-radius: 20px;
                    padding: 28px;
                    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes scaleUp {
                    from { transform: scale(0.95) translateY(10px); }
                    to { transform: scale(1) translateY(0); }
                }

                .crop-modal-header h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 22px;
                    color: #1A1A1A;
                    margin: 0 0 4px 0;
                    font-weight: 600;
                }

                .crop-modal-subtitle {
                    font-size: 13px;
                    color: #6B6B6B;
                    margin: 0;
                    font-family: 'Inter', sans-serif;
                }

                .crop-viewport-wrapper {
                    width: 100%;
                    aspect-ratio: 3/2;
                    background: #141412;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    border: 1px solid #E8E5E0;
                    box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);
                }

                .crop-viewport {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    cursor: move;
                    touch-action: none;
                }

                .crop-loading-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(26, 26, 24, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #E8E5E0;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 10;
                }

                .crop-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .crop-zoom-slider-container {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: #FAFAF7;
                    padding: 12px 20px;
                    border-radius: 10px;
                    border: 1px solid #E8E5E0;
                }

                .slider-icon {
                    color: #8B7355;
                }

                .crop-zoom-slider {
                    flex: 1;
                    -webkit-appearance: none;
                    appearance: none;
                    height: 6px;
                    border-radius: 3px;
                    background: #E8E5E0;
                    outline: none;
                    transition: background 0.3s;
                }

                .crop-zoom-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #8B7355;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                    transition: transform 0.1s;
                }

                .crop-zoom-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                }

                .crop-instructions {
                    text-align: center;
                }

                .crop-instructions p {
                    font-size: 12px;
                    color: #6B6B6B;
                    margin: 0;
                    font-family: 'Inter', sans-serif;
                }

                .crop-modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 8px;
                }
            `}</style>
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
                                        <label>Gambar Paket (Rekomendasi 3:2)</label>
                                        <input type="file" accept="image/*" className="file-input-custom" onChange={handleFileChange} />
                                        <div className="preview-box" style={{ position: 'relative' }}>
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} className="preview-img" alt="Preview" />
                                                    <button
                                                        type="button"
                                                        onClick={handleAdjustExistingImage}
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: '12px',
                                                            right: '12px',
                                                            background: 'rgba(26, 26, 26, 0.8)',
                                                            backdropFilter: 'blur(4px)',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            transition: 'background 0.3s'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#8B7355'}
                                                        onMouseLeave={(e) => e.target.style.background = 'rgba(26, 26, 26, 0.8)'}
                                                    >
                                                        <Edit size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Sesuaikan Posisi
                                                    </button>
                                                </>
                                            ) : (
                                                <span>Pratinjau Gambar</span>
                                            )}
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

                {isCropModalOpen && (
                    <div className="crop-modal-overlay">
                        <div className="crop-modal-container">
                            <div className="crop-modal-header">
                                <h3>Sesuaikan Gambar Paket</h3>
                                <p className="crop-modal-subtitle">Geser dan atur perbesaran gambar agar pas dengan bingkai (3:2)</p>
                            </div>
                            
                            <div className="crop-viewport-wrapper">
                                <div 
                                    ref={viewportRef}
                                    className="crop-viewport"
                                    onMouseDown={onMouseDown}
                                    onTouchStart={onTouchStart}
                                >
                                    {isImageLoading && (
                                        <div className="crop-loading-overlay">
                                            <span>Memuat Gambar...</span>
                                        </div>
                                    )}
                                    {cropImageSrc && (
                                        <img
                                            ref={imgRef}
                                            src={cropImageSrc}
                                            crossOrigin="anonymous"
                                            onLoad={handleImageLoad}
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                width: imageDims ? `${imageDims.renderWidth}px` : 'auto',
                                                height: imageDims ? `${imageDims.renderHeight}px` : 'auto',
                                                transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                                                transformOrigin: 'top left',
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                                maxWidth: 'none'
                                            }}
                                            alt="Crop preview"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="crop-controls">
                                <div className="crop-zoom-slider-container">
                                    <ZoomOut size={16} className="slider-icon" />
                                    <input 
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="0.01"
                                        value={cropZoom}
                                        onChange={handleZoomChange}
                                        className="crop-zoom-slider"
                                        disabled={isImageLoading || !imageDims}
                                    />
                                    <ZoomIn size={16} className="slider-icon" />
                                </div>
                                <div className="crop-instructions">
                                    <p>💡 <b>Tips:</b> Klik dan seret gambar untuk menggeser posisinya.</p>
                                </div>
                            </div>

                            <div className="crop-modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => {
                                        if (cropImageSrc && cropImageSrc.startsWith('blob:') && cropImageSrc !== imagePreview) {
                                            URL.revokeObjectURL(cropImageSrc);
                                        }
                                        setIsCropModalOpen(false);
                                    }}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-primary" 
                                    onClick={applyCrop}
                                    disabled={isImageLoading || !imageDims}
                                >
                                    Terapkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
}