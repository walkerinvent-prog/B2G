import React from 'react';
import { Gift, Tag, DollarSign, ExternalLink, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ReferralBanner() {
  return (
    <div className="bg-gradient-to-r from-[#FFD60A]/20 via-[#20D4AB]/20 to-[#6C3BFF]/20 backdrop-blur-xl rounded-2xl p-6 border border-[#FFD60A]/30 mb-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#FFD60A] to-[#20D4AB] flex items-center justify-center flex-shrink-0">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Double Cash Rewards! 💰
          </h3>
          <p className="text-white/80 text-sm mb-3">
            Get <span className="text-[#FFD60A] font-bold">$5 OFF</span> your order PLUS <span className="text-[#20D4AB] font-bold">$5 Cash</span> when you use a friend's invite code!
          </p>
          
          {/* No Cash App Account Section */}
          <div className="bg-white/10 rounded-xl p-4 mb-4 border border-white/20">
            <p className="text-white text-sm font-semibold mb-2">Don't have Cash App? Get $10 in rewards:</p>
            <ol className="text-white/70 text-sm space-y-1 mb-3 ml-4 list-decimal">
              <li>Create your Cash App account with code <span className="text-[#FFD60A] font-bold">B4FF8W3</span></li>
              <li>Get <span className="text-[#20D4AB] font-bold">$5 cash</span> deposited to your new account</li>
              <li>Come back here and use your friend's invite code for <span className="text-[#FFD60A] font-bold">$5 off</span></li>
            </ol>
            <Button
              onClick={() => window.open('https://cash.app/app/B4FF8W3', '_blank')}
              className="bg-gradient-to-r from-[#20D4AB] to-[#00D632] hover:from-[#3FE5BC] hover:to-[#00F03F] text-white w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Create Cash App Account ($5 Bonus)
            </Button>
          </div>

          {/* Redemption Instructions */}
          <div className="flex flex-wrap gap-4 text-sm text-white/70 mb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FFD60A]" />
              <span>Select Cash App Tag add-on below</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#20D4AB]" />
              <span>Enter your friend's invite code at checkout</span>
            </div>
          </div>

          {/* Expiration Notice */}
          <div className="flex items-center gap-2 text-xs text-[#FFD60A] bg-[#FFD60A]/10 rounded-lg px-3 py-2">
            <Clock className="w-3 h-3" />
            <span>Friend invite discount expires 10 days after you receive the invite</span>
          </div>
        </div>
      </div>
    </div>
  );
}