import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Camera, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PhotoUploadSection({ formData, setFormData, errors }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(formData.main_photo_url || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, main_photo_url: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPreview(null);
    setFormData(prev => ({ ...prev, main_photo_url: null }));
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#FFD60A] to-[#20D4AB] flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Magazine Cover Photo
            </h2>
            <p className="text-white/60 text-sm">Upload 1 high-resolution portrait photo</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-[#FFD60A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            $29.95
          </div>
          <p className="text-white/50 text-xs">Base design fee</p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {preview ? (
          <div className="relative group">
            <div className="w-72 h-96 rounded-2xl overflow-hidden border-4 border-[#FFD60A] shadow-2xl shadow-yellow-500/20">
              <img
                src={preview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={removePhoto}
              className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] rounded-full">
              <span className="text-white text-sm font-medium">Cover Photo</span>
            </div>
          </div>
        ) : (
          <label className={`cursor-pointer w-full max-w-md ${errors.main_photo_url ? 'ring-2 ring-red-500 rounded-2xl' : ''}`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-white/30 rounded-2xl p-12 text-center hover:border-[#FFD60A] transition-colors group">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#FFD60A]/20 to-[#6C3BFF]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-[#FFD60A]" />
              </div>
              <p className="text-white text-lg font-medium mb-2">Click to upload your photo</p>
              <p className="text-white/50 text-sm">High-resolution portrait recommended</p>
              <p className="text-white/40 text-xs mt-2">JPG, PNG up to 10MB</p>
            </div>
          </label>
        )}
        {errors.main_photo_url && <p className="text-red-400 text-sm mt-4">{errors.main_photo_url}</p>}
      </div>
    </div>
  );
}