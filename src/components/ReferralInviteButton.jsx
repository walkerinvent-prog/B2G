import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Copy, Check, Gift, DollarSign, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import ShareButtons from './ShareButtons';

export default function ReferralInviteButton() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [cashAppTag, setCashAppTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setCashAppTag(currentUser.cash_app_tag_for_payment || '');
      
      // Generate referral code if user doesn't have one
      if (!currentUser.referral_code) {
        const code = generateReferralCode(currentUser.email);
        await base44.auth.updateMe({ referral_code: code });
        setUser(prev => ({ ...prev, referral_code: code }));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const generateReferralCode = (email) => {
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const code = Math.abs(hash).toString(36).toUpperCase().substring(0, 6);
    return `B2G${code}`;
  };

  const handleSaveCashAppTag = async () => {
    if (!cashAppTag.trim()) {
      toast.error('Please enter your Cash App tag');
      return;
    }
    
    setLoading(true);
    try {
      await base44.auth.updateMe({ cash_app_tag_for_payment: cashAppTag });
      setUser(prev => ({ ...prev, cash_app_tag_for_payment: cashAppTag }));
      toast.success('Cash App tag saved!');
    } catch (error) {
      toast.error('Failed to save Cash App tag');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referral_code);
    toast.success('Referral code copied!');
  };

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-[#FFD60A] to-[#20D4AB] hover:opacity-90 text-[#0D1020] font-bold"
      >
        <Users className="w-4 h-4 mr-2" />
        Invite Friends
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gradient-to-br from-[#0D1020] to-[#1a1535] border-white/20 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Gift className="w-6 h-6 text-[#FFD60A]" />
              Invite Friends & Earn!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* How it works */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="font-semibold text-[#FFD60A] mb-3">How It Works:</h3>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-start gap-2">
                  <span className="text-[#20D4AB] font-bold">1.</span>
                  <span>Share your referral code with friends</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#20D4AB] font-bold">2.</span>
                  <span>They get <span className="text-[#FFD60A] font-bold">$5 OFF</span> Cash App Tag add-on</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#20D4AB] font-bold">3.</span>
                  <span>You receive <span className="text-[#20D4AB] font-bold">$5</span> in your Cash App!</span>
                </div>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-[#FFD60A]/10 to-[#6C3BFF]/10 rounded-xl p-4 border border-[#FFD60A]/20">
                <div className="text-white/60 text-xs mb-1">Referrals</div>
                <div className="text-2xl font-bold text-white">{user.referrals_count || 0}</div>
              </div>
              <div className="bg-gradient-to-r from-[#20D4AB]/10 to-[#FFD60A]/10 rounded-xl p-4 border border-[#20D4AB]/20">
                <div className="text-white/60 text-xs mb-1">Earned</div>
                <div className="text-2xl font-bold text-[#20D4AB]">${user.total_referral_earnings || 0}</div>
              </div>
            </div>

            {/* Your Referral Code */}
            <div>
              <Label className="text-white/80 mb-2 block">Your Referral Code</Label>
              <div className="flex gap-2">
                <Input
                  value={user.referral_code || ''}
                  readOnly
                  className="bg-white/10 border-white/20 text-white font-mono text-lg text-center"
                />
                <Button
                  onClick={copyReferralCode}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <Label className="text-white/80 mb-2 block">Share This Link</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={`${window.location.origin}/?ref=${user.referral_code}`}
                  readOnly
                  className="bg-white/10 border-white/20 text-white text-sm"
                />
                <Button
                  onClick={copyReferralLink}
                  className="bg-[#FFD60A] hover:bg-[#FFD60A]/90 text-[#0D1020]"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <ShareButtons
                url={`${window.location.origin}/?ref=${user.referral_code}`}
                title="Get $5 OFF Your B.Visible Magazine Order!"
                description={`Use my referral code ${user.referral_code} and save $5 on your Class of 2026 magazine career cover order!`}
                variant="outline"
                size="default"
              />
            </div>

            {/* Cash App Tag for Receiving Payments */}
            <div className="bg-gradient-to-r from-[#20D4AB]/10 to-[#FFD60A]/10 rounded-xl p-4 border border-[#20D4AB]/20">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-[#20D4AB]" />
                <Label className="text-white font-semibold">Your Cash App Tag (to receive $5)</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="$YourCashTag"
                  value={cashAppTag}
                  onChange={(e) => setCashAppTag(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <Button
                  onClick={handleSaveCashAppTag}
                  disabled={loading}
                  className="bg-[#20D4AB] hover:bg-[#20D4AB]/90 text-white"
                >
                  Save
                </Button>
              </div>
              <p className="text-white/60 text-xs mt-2">
                We'll send your referral earnings to this Cash App tag
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}