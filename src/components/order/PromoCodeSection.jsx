import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Gift, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PromoCodeSection({ formData, setFormData }) {
  const [promoInput, setPromoInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePromoCode = () => {
    setIsValidating(true);
    
    // Valid promo code: GIFT2GRAD2026
    if (promoInput.toUpperCase() === 'GIFT2GRAD2026') {
      updateField('promo_code', 'GIFT2GRAD2026');
      updateField('is_promo_order', true);
      toast.success('🎉 Promo code applied! You get a FREE digital magazine cover!');
    } else {
      toast.error('Invalid promo code. Please try again.');
    }
    
    setIsValidating(false);
  };

  const removePromoCode = () => {
    updateField('promo_code', null);
    updateField('is_promo_order', false);
    setPromoInput('');
    toast.info('Promo code removed');
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Promotional Code
        </h2>
      </div>

      {!formData.is_promo_order ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#FFD60A]/20 to-[#6C3BFF]/20 rounded-xl p-6 border border-[#FFD60A]/30">
            <h3 className="text-white font-bold text-lg mb-2">🎓 Limited Time Offer!</h3>
            <p className="text-white/80 text-sm mb-3">
              Enter promo code <span className="text-[#FFD60A] font-bold">GIFT2GRAD2026</span> to get:
            </p>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>✨ <strong>Self-Generated <span className="line-through text-white" style={{ textDecorationColor: '#FFD60A' }}>(regular $9.95)</span> <span className="text-[#FFD60A]">($4.50)</span> with promotional code:</strong> AI-designed instantly</li>
              <li>📁 Featured in Tennessee Directory Of Graduates</li>
              <li>🔗 Shareable link for family and friends</li>
              <li>💵 Cash App tag on cover (FREE)</li>
              <li>💝 Add Cash App supporter names</li>
            </ul>
            <div className="bg-gradient-to-r from-[#6C3BFF]/30 to-[#FFD60A]/30 rounded-lg p-4 mt-4 border border-[#6C3BFF]/40">
              <p className="text-white font-bold text-sm mb-2">🎨 Premium Service ($29.95):</p>
              <ul className="space-y-1 text-white/80 text-xs">
                <li>✓ Professional graphic design by B2G staff</li>
                <li>✓ Custom effects: brighter days, sun, clouds</li>
                <li>✓ Email proof sent for approval</li>
                <li>✓ Honor Roll & Principal's Award seals</li>
                <li>✓ 11" x 15" printed poster mailed via USPS</li>
                <li>✓ Shareable link for family and friends</li>
                <li>✓ Cash App tag on cover (FREE)</li>
                <li>✓ VIP Graduate personalized song option</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl flex-1 uppercase"
            />
            <Button
              onClick={validatePromoCode}
              disabled={!promoInput.trim() || isValidating}
              className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:from-[#FFE44D] hover:to-[#8B5CF6] text-white h-14 px-8"
            >
              Apply
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Promo Code Applied!</p>
                <p className="text-white/70 text-sm">{formData.promo_code}</p>
              </div>
            </div>
            <Button
              onClick={removePromoCode}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {formData.is_promo_order && (
        <>
          <div className="mt-6 bg-amber-500/20 rounded-xl p-4 border border-amber-400/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div className="text-sm text-white/80">
                <p className="font-semibold mb-1">Important Notice:</p>
                <p>• Self-generated cover is $4.50 - auto-created and placed in Tennessee Directory</p>
                <p>• Shareable link provided to send to family and friends</p>
                <p>• Add supporter names who send Cash App gifts</p>
                <p>• All add-ons are paid upfront (Extra copies: $14.95/each, VIP Song: $49.95)</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-gradient-to-r from-[#6C3BFF]/20 to-[#FFD60A]/20 rounded-xl p-6 border border-[#6C3BFF]/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg mb-2">✨ Want to Upgrade to Premium?</p>
                <p className="text-white/80 text-sm mb-3">
                  You can upgrade to our Premium Magazine Cover ($29.95) at any time and get:
                </p>
                <ul className="space-y-1 text-white/70 text-sm">
                  <li>✓ Professional graphic design by our staff</li>
                  <li>✓ Custom effects: brighter days, sun, clouds</li>
                  <li>✓ Honor Roll & Principal's Award seal options</li>
                  <li>✓ Proof sent for your approval before printing</li>
                  <li>✓ 11" x 15" printed poster mailed to you via USPS</li>
                  <li>✓ VIP Graduate personalized song option</li>
                </ul>
                <p className="text-[#FFD60A] text-sm font-semibold mt-3">
                  📧 Reply to any order email to upgrade anytime!
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}