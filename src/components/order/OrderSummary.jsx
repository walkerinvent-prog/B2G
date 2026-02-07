import React, { useState, useEffect } from 'react';
import { Calculator, CreditCard, Sparkles, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import StripeCheckout from './StripeCheckout';

export default function OrderSummary({ formData, setFormData, onSubmit, isSubmitting, orderId }) {
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);

  const basePrice = formData.is_promo_order ? 4.50 : 29.95;
  const extraCopyPrice = 14.95;
  const vipSongPrice = 49.95;

  const calculateTotal = () => {
    let total = basePrice;
    if (formData.extra_copy) {
      total += extraCopyPrice * (formData.extra_copy_quantity || 1);
    }
    if (formData.vip_song_addon) {
      total += vipSongPrice;
    }
    return total;
  };

  const total = calculateTotal();
  const totalWithTax = (total * 1.0975).toFixed(2);

  return (
    <div className="bg-gradient-to-br from-[#FFD60A]/20 via-[#6C3BFF]/20 to-[#20D4AB]/20 backdrop-blur-xl rounded-3xl p-8 border border-[#FFD60A]/30 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Order Summary
        </h2>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-start py-3 border-b border-white/10">
          <div>
            <span className="text-white/80 block">
              {formData.is_promo_order ? 'Self-Generated Magazine Cover' : 'Premium Magazine Cover'}
            </span>
            <span className="text-white/50 text-xs">
              {formData.is_promo_order ? 
                'AI-designed, auto-generated' : 
                'Professional design + 11" x 15" printed poster mailed'}
            </span>
          </div>
          <span className="text-white font-medium">${basePrice.toFixed(2)}</span>
        </div>

        {formData.extra_copy && (
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-white/80">Extra Magazine Copies ({formData.extra_copy_quantity || 1}x @ $14.95)</span>
            <span className="text-white font-medium">${(extraCopyPrice * (formData.extra_copy_quantity || 1)).toFixed(2)}</span>
          </div>
        )}

        {formData.cash_app_tag_on_cover && (
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-white/80">Cash App Tag on Cover</span>
            <span className="text-[#20D4AB] font-medium">FREE</span>
          </div>
        )}

        {formData.vip_song_addon && (
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-white/80">VIP Graduate Song Package</span>
            <span className="text-white font-medium">${vipSongPrice.toFixed(2)}</span>
          </div>
        )}

        <div className="py-3 border-b border-white/10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/60">Subtotal</span>
            <span className="text-white/60">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">Sales Tax (9.75%)</span>
            <span className="text-white/60">${(total * 0.0975).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-4 bg-gradient-to-r from-[#FFD60A]/20 to-[#6C3BFF]/20 rounded-xl px-4 mt-6 border border-[#FFD60A]/30">
          <span className="text-white text-xl font-bold">Total Amount Due Today</span>
          <span className="text-[#FFD60A] text-3xl font-black">${totalWithTax}</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8 bg-white/5 rounded-2xl p-6 border border-white/10">
        <Label className="text-white text-lg font-semibold mb-4 block">Select Payment Method</Label>
        <p className="text-white/60 text-sm mb-4">Both payment methods process securely through Stripe</p>
        <RadioGroup
          value={formData.payment_method || 'stripe'}
          onValueChange={(v) => {
            setFormData((prev) => ({ ...prev, payment_method: v }));
            setShowStripeCheckout(false);
          }}
          className="space-y-3">

          <div className="flex items-center gap-3 p-4 rounded-xl border border-white/20 hover:border-[#6C3BFF]/50 transition-colors cursor-pointer">
            <RadioGroupItem value="stripe" id="stripe" className="border-white/40 text-[#6C3BFF]" />
            <Label htmlFor="stripe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white cursor-pointer flex-1">Credit/Debit Card</Label>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-white/20 hover:border-[#20D4AB]/50 transition-colors cursor-pointer">
            <RadioGroupItem value="cashapp" id="cashapp" className="border-white/40 text-[#20D4AB]" />
            <Label htmlFor="cashapp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white cursor-pointer flex-1">$Cash App Debit Card</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Stripe Checkout - Show for all payment methods */}
      {orderId && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-2">Payment Information</h3>
            <p className="text-white/60 text-sm">Enter your card details below to complete your order</p>
          </div>
          <StripeCheckout
            amount={parseFloat(totalWithTax)}
            orderId={orderId}
            studentName={formData.student_name}
            parentEmail={formData.parent_email}
            onSuccess={onSubmit}
            onError={(error) => toast.error(error)}
            cashAppTag={formData.cash_app_tag}
            cashAppTagEnabled={formData.cash_app_tag_on_cover}
          />
        </div>
      )}
    </div>);

}