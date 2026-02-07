import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle2, Sparkles, Mail, Clock, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD60A]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6C3BFF]/10 rounded-full blur-3xl" />
        {[...Array(30)].map((_, i) => (
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
            <Sparkles className="w-4 h-4 text-[#FFD60A]/40" />
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-[#20D4AB] to-[#6C3BFF] flex items-center justify-center animate-bounce-slow">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>

          <h1 
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Order Confirmed!
          </h1>

          {orderId && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD60A]/20 border border-[#FFD60A]/30 mb-6">
              <span className="text-[#FFD60A] font-medium">Order ID: {orderId}</span>
            </div>
          )}

          <p className="text-white/70 text-lg mb-10 max-w-md mx-auto">
            Thank you for your order! Your B.Visible Magazine Cover is on its way to being created.
          </p>

          {/* Next Steps */}
          <div className="space-y-4 mb-10">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFD60A]/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#FFD60A]" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Check Your Email</h3>
                  <p className="text-white/60 text-sm">
                    You'll receive a confirmation email with your order details shortly.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6C3BFF]/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#6C3BFF]" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Design Proof Coming Soon</h3>
                  <p className="text-white/60 text-sm">
                    We'll email you a proof of your magazine cover for approval within 2-3 business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FFD60A]/10 to-[#6C3BFF]/10 rounded-2xl p-5 border border-[#FFD60A]/20 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#20D4AB]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#20D4AB]" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">VIP Add-Ons</h3>
                  <p className="text-white/60 text-sm">
                    If you selected any VIP add-ons, you'll receive a separate invoice after your proof is approved.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Home')}>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6"
              >
                Place Another Order
              </Button>
            </Link>
            <Link to={createPageUrl('Directory')}>
              <Button className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:from-[#FFE44D] hover:to-[#8B5CF6] text-white px-8 py-6">
                View Graduate Directory
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-[#20D4AB] text-sm mt-8 italic">
          "Every Student Deserves to Be Visible."
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}