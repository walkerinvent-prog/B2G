import React from 'react';
import { Label } from "@/components/ui/label";
import { Palette, Check } from 'lucide-react';

const designs = [
  {
    id: 'design1',
    name: 'Sky Is My Launching Pad',
    preview: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/c0381a7a9_Design1SkyisMyLaunchingPad.jpg',
    description: 'Inspiring blue sky with clouds and sunbeams',
    colors: ['#4A90E2', '#87CEEB', '#FFD700']
  },
  {
    id: 'design2',
    name: 'All Clean White',
    preview: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/efdf646ee_Design2AllCleanWhite.jpg',
    description: 'Clean, professional white background',
    colors: ['#FFFFFF', '#FFD700', '#000000']
  },
  {
    id: 'design3',
    name: 'Big Money',
    preview: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/ea449dbd2_Design3BigMoney.jpg',
    description: 'Success-themed green money background',
    colors: ['#2ECC71', '#27AE60', '#F1C40F']
  },
  {
    id: 'design4',
    name: 'Bright Lights & Bright Future',
    preview: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/c752f1303_Design4.jpg',
    description: 'My future is so Bright',
    colors: ['#FFD700', '#FFA500', '#8B4513']
  }
];

export default function BackgroundDesignSelector({ formData, setFormData, errors }) {
  const selectedDesign = formData.background_design || 'design1';

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center">
          <Palette className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Choose Your Background Design
          </h2>
          <p className="text-white/60 text-sm mt-1">Select the perfect backdrop for your magazine cover</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {designs.map((design) => {
          const isSelected = selectedDesign === design.id;
          
          return (
            <button
              key={design.id}
              onClick={() => setFormData(prev => ({ ...prev, background_design: design.id }))}
              className={`text-center transition-all ${
                isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {/* Preview Image */}
              <div className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                isSelected 
                  ? 'border-[#FFD60A] shadow-xl shadow-[#FFD60A]/20' 
                  : 'border-white/20 hover:border-white/40'
              }`}>
                <img 
                  src={design.preview} 
                  alt={design.name}
                  className={`w-full h-auto object-cover transition-transform duration-300 ${
                    isSelected ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                />
                
                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-10 h-10 bg-[#FFD60A] rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-6 h-6 text-black" />
                  </div>
                )}
              </div>
              
              {/* Title and Description Below */}
              <div className="mt-4 px-2">
                <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {design.name}
                </h3>
                <p className="text-white/60 text-sm">{design.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {errors?.background_design && (
        <p className="text-red-400 text-sm mt-4">{errors.background_design}</p>
      )}
    </div>
  );
}