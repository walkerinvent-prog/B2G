import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Award, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function HonorRollUploadSection({ formData, setFormData, errors }) {
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingInside, setUploadingInside] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const isValidType = file.type.startsWith('image/');
    if (!isValidType) {
      toast.error('Please upload an image file');
      return;
    }

    const isValidSize = file.size <= 10 * 1024 * 1024;
    if (!isValidSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      if (type === 'front') setUploadingFront(true);
      else setUploadingInside(true);

      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === 'front') {
        updateField('report_card_front_url', file_url);
      } else {
        updateField('report_card_inside_url', file_url);
      }

      toast.success(`Report card ${type} uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload ${type} photo`);
      console.error(error);
    } finally {
      if (type === 'front') setUploadingFront(false);
      else setUploadingInside(false);
    }
  };

  const removePhoto = (type) => {
    if (type === 'front') {
      updateField('report_card_front_url', null);
    } else {
      updateField('report_card_inside_url', null);
    }
    toast.info(`Report card ${type} removed`);
  };

  if (!formData.honor_roll && !formData.principals_list) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center">
          <Award className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Honor Roll Verification
        </h2>
      </div>

      <div className="mb-6 bg-[#FFD60A]/20 rounded-xl p-4 border border-[#FFD60A]/30">
        <p className="text-white/90 text-sm">
          <strong>Required:</strong> Please upload photos of the front and inside of your report card to verify Honor Roll status.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Front of Report Card */}
        <div>
          <Label className="text-white/90 mb-3 block">Report Card Front *</Label>
          {!formData.report_card_front_url ? (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'front')}
                className="hidden"
                id="report-card-front"
                disabled={uploadingFront}
              />
              <label htmlFor="report-card-front">
                <div className={`border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#FFD60A]/50 hover:bg-white/5 transition-all ${errors.report_card_front_url ? 'border-red-500' : ''}`}>
                  {uploadingFront ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-[#FFD60A] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-white/60 text-sm">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-12 h-12 text-white/40" />
                      <p className="text-white text-sm">Click to upload front</p>
                      <p className="text-white/40 text-xs">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </label>
              {errors.report_card_front_url && (
                <p className="text-red-400 text-sm mt-2">{errors.report_card_front_url}</p>
              )}
            </div>
          ) : (
            <div className="relative group">
              <img
                src={formData.report_card_front_url}
                alt="Report card front"
                className="w-full h-48 object-cover rounded-xl border-2 border-[#FFD60A]/30"
              />
              <Button
                onClick={() => removePhoto('front')}
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Inside of Report Card */}
        <div>
          <Label className="text-white/90 mb-3 block">Report Card Inside *</Label>
          {!formData.report_card_inside_url ? (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'inside')}
                className="hidden"
                id="report-card-inside"
                disabled={uploadingInside}
              />
              <label htmlFor="report-card-inside">
                <div className={`border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#FFD60A]/50 hover:bg-white/5 transition-all ${errors.report_card_inside_url ? 'border-red-500' : ''}`}>
                  {uploadingInside ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-[#FFD60A] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-white/60 text-sm">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-12 h-12 text-white/40" />
                      <p className="text-white text-sm">Click to upload inside</p>
                      <p className="text-white/40 text-xs">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </label>
              {errors.report_card_inside_url && (
                <p className="text-red-400 text-sm mt-2">{errors.report_card_inside_url}</p>
              )}
            </div>
          ) : (
            <div className="relative group">
              <img
                src={formData.report_card_inside_url}
                alt="Report card inside"
                className="w-full h-48 object-cover rounded-xl border-2 border-[#FFD60A]/30"
              />
              <Button
                onClick={() => removePhoto('inside')}
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}