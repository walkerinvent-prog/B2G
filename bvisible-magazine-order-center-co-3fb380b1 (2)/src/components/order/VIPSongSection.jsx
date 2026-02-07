import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Music, Upload, X, Loader2, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VIPSongSection({ formData, setFormData }) {
  const [uploading, setUploading] = useState({});
  const [previews, setPreviews] = useState(formData.vip_photos || Array(6).fill(null));

  const handleToggle = (checked) => {
    setFormData(prev => ({ 
      ...prev, 
      vip_song_addon: checked,
      vip_photos: checked ? prev.vip_photos || [] : []
    }));
  };

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => {
        const updated = [...prev];
        updated[index] = reader.result;
        return updated;
      });
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(prev => ({ ...prev, [index]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => {
        const photos = [...(prev.vip_photos || Array(6).fill(null))];
        photos[index] = file_url;
        return { ...prev, vip_photos: photos };
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(prev => ({ ...prev, [index]: false }));
    }
  };

  const removePhoto = (index) => {
    setPreviews(prev => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    setFormData(prev => {
      const photos = [...(prev.vip_photos || [])];
      photos[index] = null;
      return { ...prev, vip_photos: photos };
    });
  };

  const slotLabels = [
    "Photo 1", "Photo 2", "Photo 3", "Photo 4", "With Friends", "School or Church"
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#6C3BFF] to-[#FFD60A] flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              VIP Graduate Song Package
            </h2>
            <p className="text-white/60 text-sm">We create a memorable & personalized song as a slideshow video tribute.</p>
          </div>
          </div>
          <div className="flex items-center gap-3">
          <span className="text-[#FFD60A] font-bold text-xl">$44.95</span>
          <span className="text-white/60">•</span>
          <span className="text-[#FFD60A] font-bold">Add-On</span>
          <Switch
            checked={formData.vip_song_addon || false}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-[#FFD60A]"
          />
        </div>
      </div>

      {formData.vip_song_addon && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-gradient-to-r from-[#FFD60A]/10 to-[#6C3BFF]/10 rounded-xl p-4 border border-[#FFD60A]/20">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#FFD60A]" />
              <p className="text-white font-medium">Upload up to 6 photos for your VIP video tribute</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {slotLabels.map((label, index) => (
              <div key={index} className="relative">
                {previews[index] ? (
                  <div className="relative group aspect-square">
                    <img
                      src={previews[index]}
                      alt={label}
                      className="w-full h-full object-cover rounded-xl border-2 border-[#6C3BFF]"
                    />
                    {uploading[index] && (
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, index)}
                      className="hidden"
                    />
                    <div className="aspect-square border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center hover:border-[#6C3BFF] transition-colors group">
                      <Upload className="w-6 h-6 text-white/40 group-hover:text-[#6C3BFF] transition-colors mb-1" />
                      <span className={`text-center px-1 ${index >= 4 ? 'text-2xl font-bold text-[#FFD60A]' : 'text-xs text-white/40'}`}>{label}</span>
                    </div>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}