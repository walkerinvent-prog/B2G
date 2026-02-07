import React, { useState, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

const heroImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop&q=80",
  "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?w=1920&h=1080&fit=crop&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&h=1080&fit=crop&q=80"
];

export default function HeroBanner({ onStartOrder }) {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Transition */}
      {heroImages.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={img}
            alt="Graduation celebration"
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1020]/90 via-[#6C3BFF]/40 to-[#0D1020]/90 animate-gradient-shift" />
      
      {/* Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-[#FFD60A]/60" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <Sparkles className="w-4 h-4 text-[#FFD60A]" />
          <span className="text-white/90 text-sm font-medium">Class of 2026</span>
        </div>

        <h1 
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <span className="bg-gradient-to-r from-[#FFD60A] via-[#20D4AB] to-[#6C3BFF] bg-clip-text text-transparent">
            B.Visible
          </span>
          <br />
          <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-white/90">
            Magazine Order Center
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-3xl mx-auto leading-relaxed">
          Your face. Your story. Your moment to shine.
        </p>
        
        <p className="text-lg text-[#20D4AB] mb-10 font-medium italic">
          "Every Student Deserves to Be Visible."
        </p>

        <Button
          onClick={onStartOrder}
          className="group bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:from-[#FFE44D] hover:to-[#8B5CF6] text-white px-10 py-7 text-xl rounded-full shadow-2xl shadow-purple-500/40 transition-all duration-500 hover:scale-105 hover:shadow-purple-500/60"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin" />
          Start Your Order
        </Button>

        <div className="mt-16 animate-bounce">
          <ChevronDown className="w-10 h-10 text-white/60 mx-auto" />
        </div>
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D1020] to-transparent" />

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}