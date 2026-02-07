import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function WelcomeAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const speechSynthRef = useRef(null);

  const welcomeText = `Congratulations to the Graduation Class of 2026. Picture this: your face on the cover of a magazine to hang on your wall. This dream is now your reality. You can even have us add your personal Cash App tag directly to the magazine cover so family, friends, and your entire community can celebrate you with love, support, and real rewards. Invite friends to order and earn $5 Cash App rewards for every successful referral. That's support that pays back! Every graduate cover will be spotlighted in our Statewide 2026 Graduates Magazine Cover Directory, putting your achievement on display for all to see. Start your order below and turn your graduation into a moment no one will forget.`;

  const sampleCovers = [
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69326e684ba65b6db086db61/c362afd8f_2026BVisibleMagazine-B2G.jpg",
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69326e684ba65b6db086db61/97ce6bf4f_BVisibleMagazine-GradSAMPLES-Clouds1x.jpg",
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69326e684ba65b6db086db61/6a92294dd_2026BVisibleMagazine-GradSAMPLES12.jpg",
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69326e684ba65b6db086db61/e10e396f5_BVisibleMagazine-GradSAMPLES-Clouds1.jpg"
  ];

  const playWelcome = () => {
    setShowPrompt(false);
    setIsPlaying(true);

    // Use Web Speech API for narration
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      const speakWithVoices = () => {
        const utterance = new SpeechSynthesisUtterance(welcomeText);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        
        // Try to get a female voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          voice.name.includes('Female') || 
          voice.name.includes('Samantha') || 
          voice.name.includes('Victoria') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Moira') ||
          voice.lang.includes('en')
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      // Voices may not be loaded yet, wait for them
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        speakWithVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          speakWithVoices();
        };
        // Fallback if onvoiceschanged doesn't fire
        setTimeout(speakWithVoices, 100);
      }
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    // Load voices
    window.speechSynthesis.getVoices();
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (showPrompt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] overflow-hidden">
        {/* Floating Magazine Covers */}
        {sampleCovers.map((cover, index) => (
          <div
            key={index}
            className="absolute animate-slide-right"
            style={{
              top: `${15 + index * 20}%`,
              left: '-200px',
              animationDelay: `${index * 2}s`,
              animationDuration: '12s',
            }}
          >
            <img
              src={cover}
              alt="Sample magazine cover"
              className="w-32 md:w-40 h-auto rounded-xl shadow-2xl shadow-purple-500/30 border-2 border-[#FFD60A]/30"
              style={{ transform: `rotate(${-5 + index * 3}deg)` }}
            />
          </div>
        ))}
        
        <div className="text-center p-8 max-w-md relative z-10">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center animate-pulse">
              <Volume2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Welcome to B.Visible
          </h2>
          <p className="text-gray-300 mb-8">
            Click below to hear our welcome message and begin your journey
          </p>
          <Button
            onClick={playWelcome}
            className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:from-[#FFE44D] hover:to-[#8B5CF6] text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105"
          >
            <Play className="w-5 h-5 mr-2" />
            Enter & Listen
          </Button>
          <button
            onClick={() => setShowPrompt(false)}
            className="block mx-auto mt-4 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Skip audio →
          </button>
        </div>

        <style>{`
          @keyframes slide-right {
            0% { transform: translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(calc(100vw + 200px)); opacity: 0; }
          }
          .animate-slide-right {
            animation: slide-right 12s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <button
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-110"
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white" />
        ) : (
          <Volume2 className="w-6 h-6 text-white animate-pulse" />
        )}
      </button>
    );
  }

  return null;
}