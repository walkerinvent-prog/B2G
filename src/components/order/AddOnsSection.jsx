import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Copy, Sparkles, DollarSign, Minus, Plus, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AddOnsSection({ formData, setFormData }) {
  const [uploadingReportCard, setUploadingReportCard] = React.useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReportCardUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Please upload a valid image file (JPG, PNG, or HEIC)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingReportCard(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateField(field, file_url);
      toast.success('Report card uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingReportCard(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#20D4AB] to-[#FFD60A] flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Additional Information & Add-Ons
        </h2>
      </div>

      <div className="space-y-8">
        {/* Honor Roll Question - Only for NON-promo orders */}
        {!formData.is_promo_order &&
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFD60A]/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-[#FFD60A]" />
            </div>
            <div className="flex-1">
              <Label className="text-white text-lg font-medium block mb-4">
                Were you ever on the Honor Roll this school year? <span className="font-bold text-[#FFD60A]">FREE SEAL</span>
              </Label>
              <RadioGroup
                value={formData.honor_roll ? 'yes' : 'no'}
                onValueChange={(v) => updateField('honor_roll', v === 'yes')}
                className="flex gap-6">

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="honor-yes" className="border-white/40 text-[#FFD60A]" />
                  <Label htmlFor="honor-yes" className="text-white cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="honor-no" className="border-white/40 text-[#FFD60A]" />
                  <Label htmlFor="honor-no" className="text-white cursor-pointer">No</Label>
                </div>
              </RadioGroup>

              {formData.honor_roll && !formData.is_promo_order &&
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Label className="text-white/80 text-sm mb-3 block">Upload Report Card - Front</Label>
                    {!formData.report_card_front_url ?
                  <label className="block cursor-pointer">
                        <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReportCardUpload(e, 'report_card_front_url')}
                      disabled={uploadingReportCard}
                      className="hidden" />

                        <div className="flex items-center justify-center gap-3 bg-[#FFD60A]/10 hover:bg-[#FFD60A]/20 border-2 border-dashed border-[#FFD60A]/30 rounded-xl p-6 transition-colors">
                          <Upload className="w-5 h-5 text-[#FFD60A]" />
                          <span className="text-white font-medium">
                            {uploadingReportCard ? 'Uploading...' : 'Click to upload front of report card'}
                          </span>
                        </div>
                      </label> :

                  <div className="relative">
                        <img src={formData.report_card_front_url} alt="Report card front" className="w-full h-32 object-cover rounded-lg" />
                        <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => updateField('report_card_front_url', null)}
                      className="absolute top-2 right-2">

                          Remove
                        </Button>
                      </div>
                  }
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Label className="text-white/80 text-sm mb-3 block">Upload Report Card - Inside</Label>
                    {!formData.report_card_inside_url ?
                  <label className="block cursor-pointer">
                        <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReportCardUpload(e, 'report_card_inside_url')}
                      disabled={uploadingReportCard}
                      className="hidden" />

                        <div className="flex items-center justify-center gap-3 bg-[#FFD60A]/10 hover:bg-[#FFD60A]/20 border-2 border-dashed border-[#FFD60A]/30 rounded-xl p-6 transition-colors">
                          <Upload className="w-5 h-5 text-[#FFD60A]" />
                          <span className="text-white font-medium">
                            {uploadingReportCard ? 'Uploading...' : 'Click to upload inside of report card'}
                          </span>
                        </div>
                      </label> :

                  <div className="relative">
                        <img src={formData.report_card_inside_url} alt="Report card inside" className="w-full h-32 object-cover rounded-lg" />
                        <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => updateField('report_card_inside_url', null)}
                      className="absolute top-2 right-2">

                          Remove
                        </Button>
                      </div>
                  }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
        }

        {/* Principal's List Question - Only for NON-promo orders */}
        {!formData.is_promo_order &&
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#6C3BFF]/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[#6C3BFF]" />
            </div>
            <div className="flex-1">
              <Label className="text-white text-lg font-medium block mb-4">
                Were you ever on the Honor Society during this school year? <span className="font-bold text-[#FFD60A]">FREE SEAL</span>
              </Label>
              <RadioGroup
                value={formData.principals_list ? 'yes' : 'no'}
                onValueChange={(v) => updateField('principals_list', v === 'yes')}
                className="flex gap-6">

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="principal-yes" className="border-white/40 text-[#FFD60A]" />
                  <Label htmlFor="principal-yes" className="text-white cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="principal-no" className="border-white/40 text-[#FFD60A]" />
                  <Label htmlFor="principal-no" className="text-white cursor-pointer">No</Label>
                </div>
              </RadioGroup>

              {formData.principals_list && !formData.is_promo_order && !formData.honor_roll &&
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Label className="text-white/80 text-sm mb-3 block">Upload Report Card - Front</Label>
                    {!formData.report_card_front_url ?
                  <label className="block cursor-pointer">
                        <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReportCardUpload(e, 'report_card_front_url')}
                      disabled={uploadingReportCard}
                      className="hidden" />

                        <div className="flex items-center justify-center gap-3 bg-[#6C3BFF]/10 hover:bg-[#6C3BFF]/20 border-2 border-dashed border-[#6C3BFF]/30 rounded-xl p-6 transition-colors">
                          <Upload className="w-5 h-5 text-[#6C3BFF]" />
                          <span className="text-white font-medium">
                            {uploadingReportCard ? 'Uploading...' : 'Click to upload front of report card'}
                          </span>
                        </div>
                      </label> :

                  <div className="relative">
                        <img src={formData.report_card_front_url} alt="Report card front" className="w-full h-32 object-cover rounded-lg" />
                        <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => updateField('report_card_front_url', null)}
                      className="absolute top-2 right-2">

                          Remove
                        </Button>
                      </div>
                  }
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Label className="text-white/80 text-sm mb-3 block">Upload Report Card - Inside</Label>
                    {!formData.report_card_inside_url ?
                  <label className="block cursor-pointer">
                        <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReportCardUpload(e, 'report_card_inside_url')}
                      disabled={uploadingReportCard}
                      className="hidden" />

                        <div className="flex items-center justify-center gap-3 bg-[#6C3BFF]/10 hover:bg-[#6C3BFF]/20 border-2 border-dashed border-[#6C3BFF]/30 rounded-xl p-6 transition-colors">
                          <Upload className="w-5 h-5 text-[#6C3BFF]" />
                          <span className="text-white font-medium">
                            {uploadingReportCard ? 'Uploading...' : 'Click to upload inside of report card'}
                          </span>
                        </div>
                      </label> :

                  <div className="relative">
                        <img src={formData.report_card_inside_url} alt="Report card inside" className="w-full h-32 object-cover rounded-lg" />
                        <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => updateField('report_card_inside_url', null)}
                      className="absolute top-2 right-2">

                          Remove
                        </Button>
                      </div>
                  }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
        }

        {/* Extra Copy Add-On */}
        <div className="bg-gradient-to-r from-[#FFD60A]/10 to-[#6C3BFF]/10 rounded-2xl p-6 border border-[#FFD60A]/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#20D4AB]/20 flex items-center justify-center flex-shrink-0">
              <Copy className="w-5 h-5 text-[#20D4AB]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-lg font-medium block">
                    Extra Copy of Magazine Cover
                  </Label>
                  <p className="text-white/60 text-sm mt-1">Get additional printed copies ($9.95 each)</p>
                </div>
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={formData.extra_copy || false}
                    onCheckedChange={(checked) => {
                      updateField('extra_copy', checked);
                      if (!checked) updateField('extra_copy_quantity', 1);
                    }}
                    className="h-6 w-6 border-white/40 data-[state=checked]:bg-[#FFD60A] data-[state=checked]:border-[#FFD60A]" />

                </div>
              </div>
              {formData.extra_copy &&
              <div className="mt-4 flex items-center gap-3">
                  <Label className="text-white/80">Quantity:</Label>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                    <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => updateField('extra_copy_quantity', Math.max(1, (formData.extra_copy_quantity || 1) - 1))}
                    className="h-8 w-8 text-white hover:bg-white/10">

                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-white font-bold text-lg w-8 text-center">
                      {formData.extra_copy_quantity || 1}
                    </span>
                    <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => updateField('extra_copy_quantity', Math.min(5, (formData.extra_copy_quantity || 1) + 1))}
                    className="h-8 w-8 text-white hover:bg-white/10">

                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-[#FFD60A] font-bold text-lg">
                    ${((formData.extra_copy_quantity || 1) * 9.95).toFixed(2)}
                  </span>
                </div>
              }
            </div>
          </div>
        </div>

        {/* Cash App Tag on Cover Add-On */}
        <div className="bg-gradient-to-r from-[#20D4AB]/10 to-[#FFD60A]/10 rounded-2xl p-6 border border-[#20D4AB]/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFD60A]/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-[#FFD60A]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-lg font-medium block">
                    Add Cash App Tag to Magazine Cover
                  </Label>
                  <p className="text-white/60 text-sm mt-1">Display your Cash App tag prominently on the cover</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm font-medium line-through">$10.00</span>
                    <span className="text-[#20D4AB] font-bold text-2xl">FREE</span>
                  </div>
                  <Checkbox
                    checked={formData.cash_app_tag_on_cover || false}
                    onCheckedChange={(checked) => {
                      updateField('cash_app_tag_on_cover', checked);
                      if (!checked) updateField('cash_app_tag', '');
                    }}
                    className="h-6 w-6 border-white/40 data-[state=checked]:bg-[#20D4AB] data-[state=checked]:border-[#20D4AB]" />

                </div>
              </div>
              {formData.cash_app_tag_on_cover &&
              <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <Label className="text-white/80 mb-2 block">Enter Your Cash App Tag</Label>
                    <Input
                    placeholder="$YourCashTag"
                    value={formData.cash_app_tag || ''}
                    onChange={(e) => updateField('cash_app_tag', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl" />
                    
                    {/* Cash App Enrollment Section */}
                    <div className="mt-4 bg-gradient-to-r from-[#00D54B]/20 to-[#00D54B]/10 rounded-xl p-5 border border-[#00D54B]/30">
                      <div className="flex items-start gap-3 mb-3">
                        <DollarSign className="w-5 h-5 text-[#00D54B] mt-0.5" />
                        <div>
                          <p className="text-white font-bold text-base mb-1">Don't have a Cash App account?</p>
                          <p className="text-white/80 text-sm mb-3">
                            Create your FREE Cash App account and receive <span className="text-[#FFD60A] font-bold">$5 as a Graduation Gift!</span>
                          </p>
                          <ul className="text-white/70 text-xs space-y-1 mb-3">
                            <li>✓ Get $5 instantly when you sign up</li>
                            <li>✓ Use your $5 gift toward your promotional magazine cover ($4.50)</li>
                            <li>✓ Valid for 7 days from sign-up</li>
                          </ul>
                          <a
                          href="https://cash.app/app/B4FF8W3"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00D54B] hover:bg-[#00C043] text-white font-bold rounded-xl transition-colors">

                            <DollarSign className="w-4 h-4" />
                            Enroll in Cash App - Get $5 Free
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/80 mb-2 block">For loved ones to show support</Label>
                    <Input
                    placeholder="Street Address"
                    value={formData.delivery_address || ''}
                    onChange={(e) => updateField('delivery_address', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl mb-3" />

                    <div className="grid grid-cols-3 gap-3">
                      <Input
                      placeholder="City"
                      value={formData.delivery_city || ''}
                      onChange={(e) => updateField('delivery_city', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl" />

                      <Input
                      placeholder="State"
                      value={formData.delivery_state || ''}
                      onChange={(e) => updateField('delivery_state', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl" />

                      <Input
                      placeholder="ZIP"
                      value={formData.delivery_zip || ''}
                      onChange={(e) => updateField('delivery_zip', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl" />

                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>);

}