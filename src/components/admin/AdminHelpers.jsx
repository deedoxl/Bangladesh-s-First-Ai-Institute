import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import Button from '../ui/Button';
import { uploadToCloudinary } from '../../lib/uploadImage';

// --- Image Upload Logic (Converted to Standalone Helper) ---
export const handleImageUpload = (file, callback) => {
    if (!file) return;

    // Limits
    const MAX_WIDTH = 800;
    const MAX_MB = 1;

    if (file.size > MAX_MB * 1024 * 1024) {
        alert(`File too large. Please use image under ${MAX_MB} MB.`);
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG 0.7
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

// --- Helper Components ---

export const InputGroup = ({ label, value, onChange, type = "text" }) => (
    <div className="space-y-1">
        <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-deedox-accent-primary outline-none transition-colors"
        />
    </div>
);

export const TextAreaGroup = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">{label}</label>
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-deedox-accent-primary outline-none transition-colors h-32 resize-none"
        />
    </div>
);

export const ImageUploader = ({ label, value, onChange }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            onChange(url);
            alert("Image uploaded successfully!");
        } catch (err) {
            console.error(err);
            alert("Upload failed. Check console.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-xs text-deedox-text-muted uppercase font-bold tracking-wide">{label}</label>
            <div className="flex gap-4 items-start">
                {/* Preview */}
                <div className="w-20 h-20 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-deedox-accent-primary"></div>
                    ) : (
                        value ? <img src={value} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-white/20" />
                    )}
                </div>

                <div className="flex-grow space-y-2">
                    {/* File Input Hidden */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {/* Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline" className="text-xs py-2 px-3 gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                        <input
                            type="text"
                            placeholder="Or paste URL..."
                            value={value?.startsWith('data:') ? '(Data URL - Please Re-upload)' : value}
                            onChange={e => onChange(e.target.value)}
                            className="flex-grow bg-black/40 border border-white/10 px-3 rounded-lg text-xs text-white outline-none"
                        />
                    </div>
                    <p className="text-[10px] text-deedox-text-muted">Uploads to Supabase Storage (Public URL).</p>
                </div>
            </div>
        </div>
    );
};
