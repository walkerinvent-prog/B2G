import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import WelcomeAudio from '../components/WelcomeAudio';
import HeroBanner from '../components/HeroBanner';
import TestimonialsSection from '../components/TestimonialsSection';
import StudentInfoSection from '../components/order/StudentInfoSection';
import PhotoUploadSection from '../components/order/PhotoUploadSection';
import BackgroundDesignSelector from '../components/order/BackgroundDesignSelector';
import VIPSongSection from '../components/order/VIPSongSection';
import AddOnsSection from '../components/order/AddOnsSection';
import OrderSummary from '../components/order/OrderSummary';
import PromoCodeSection from '../components/order/PromoCodeSection';
import HonorRollUploadSection from '../components/order/HonorRollUploadSection';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Home() {
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    student_phone: '',
    school_or_church: '',
    school_colors: '',
    birthday_month: '',
    school_mascot: '',
    hobbies: '',
    future_career: '',
    future_career_other: '',
    headline_choice: '',
    headline_completion: '',
    feature_in_vip_edition: false,
    cash_app_tag_on_cover: false,
    extra_copy_quantity: 1,
    payment_method: 'stripe',
    cash_app_screenshot_url: null,
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    delivery_zip: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    main_photo_url: null,
    vip_song_addon: false,
    vip_photos: [],
    honor_roll: false,
    principals_list: false,
    extra_copy: false,
    cash_app_tag: '',
    promo_code: null,
    is_promo_order: false,
    report_card_front_url: null,
    report_card_inside_url: null,
    background_design: 'design1'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const formRef = useRef(null);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    // Generate stable orderId once on mount
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setOrderId(`BV2026-${timestamp}-${random}`);
  }, []);



  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student_name?.trim()) {
      newErrors.student_name = 'Student name is required';
    }
    if (!formData.school_colors?.trim()) {
      newErrors.school_colors = 'School colors are required';
    }
    if (!formData.main_photo_url) {
      newErrors.main_photo_url = 'Please upload a cover photo';
    }

    // Honor Roll validation
    if ((formData.honor_roll || formData.principals_list) && !formData.is_promo_order) {
      if (!formData.report_card_front_url) {
        newErrors.report_card_front_url = 'Report card front photo required for Honor Roll';
      }
      if (!formData.report_card_inside_url) {
        newErrors.report_card_inside_url = 'Report card inside photo required for Honor Roll';
      }
    }

    // Cash App validation (skip for promo orders)
    if (formData.payment_method === 'cashapp' && !formData.is_promo_order) {
      if (!formData.cash_app_screenshot_url) {
        newErrors.cash_app_screenshot_url = 'Please upload Cash App payment screenshot';
      }
      if (!formData.delivery_address) {
        newErrors.delivery_address = 'Delivery address is required';
      }
      if (!formData.delivery_city) {
        newErrors.delivery_city = 'City is required';
      }
      if (!formData.delivery_state) {
        newErrors.delivery_state = 'State is required';
      }
      if (!formData.delivery_zip) {
        newErrors.delivery_zip = 'ZIP code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const basePrice = formData.is_promo_order ? 4.50 : 29.95;
      const extraCopyPrice = formData.extra_copy ? 14.95 * (formData.extra_copy_quantity || 1) : 0;
      const vipSongPrice = formData.vip_song_addon ? 49.95 : 0;
      const totalAmount = basePrice + extraCopyPrice + vipSongPrice;



      // Create order in database
      const orderData = {
        order_id: orderId,
        student_name: formData.student_name,
        student_email: formData.student_email,
        student_phone: formData.student_phone,
        school_or_church: formData.school_or_church,
        school_colors: formData.school_colors,
        birthday_month: formData.birthday_month,
        school_mascot: formData.school_mascot,
        hobbies: formData.hobbies,
        future_career: formData.future_career === 'Other—Type Here' ?
        formData.future_career_other :
        formData.future_career,
        headline_choice: formData.headline_choice || null,
        headline_completion: formData.headline_completion || null,
        feature_in_vip_edition: formData.feature_in_vip_edition,
        parent_name: formData.parent_name,
        parent_email: formData.parent_email,
        parent_phone: formData.parent_phone,
        main_photo_url: formData.main_photo_url,
        vip_song_addon: formData.vip_song_addon,
        vip_photos: formData.vip_photos?.filter((p) => p) || [],
        honor_roll: formData.honor_roll,
        principals_list: formData.principals_list,
        extra_copy: formData.extra_copy,
        extra_copy_quantity: formData.extra_copy_quantity || 1,
        cash_app_tag_on_cover: formData.cash_app_tag_on_cover,
        payment_method: formData.payment_method,
        cash_app_screenshot_url: formData.cash_app_screenshot_url,
        delivery_address: formData.delivery_address,
        delivery_city: formData.delivery_city,
        delivery_state: formData.delivery_state,
        delivery_zip: formData.delivery_zip,
        total_amount: totalAmount,
        payment_status: formData.is_promo_order ? 'pending' : 'pending',
        cash_app_tag: formData.cash_app_tag,
        approved_for_directory: false,
        promo_code: formData.promo_code || null,
        is_promo_order: formData.is_promo_order || false,
        report_card_front_url: formData.report_card_front_url || null,
        report_card_inside_url: formData.report_card_inside_url || null,
        background_design: formData.background_design || 'design1'
      };

      const createdOrder = await base44.entities.Order.create(orderData);

      // Handle promo vs premium orders differently
      try {
        if (formData.is_promo_order) {
          // Promo orders: Generate proof and auto-approve for directory
          await base44.functions.invoke('generateProof', {
            order_id: orderId,
            text_styles: null
          });
          
          await base44.entities.Order.update(createdOrder.id, {
            approved_for_directory: true,
            proof_status: 'approved'
          });
        } else {
          // Premium orders: Generate proof but wait for admin approval
          await base44.functions.invoke('generateProof', {
            order_id: orderId,
            text_styles: null
          });
          
          await base44.entities.Order.update(createdOrder.id, {
            approved_for_directory: true,
            proof_status: 'pending_admin_review'
          });
        }

        // Send appropriate email based on order type
        const directoryEmailBody = formData.is_promo_order ? `
Dear ${formData.student_name},

🎉 Thank you for your order! You are now permanently featured in the Tennessee 2026 Graduate Directory!

📱 YOUR SELF-GENERATED MAGAZINE COVER ($4.50)
Your AI-generated magazine cover has been automatically created and is now live in the directory!

✨ WHAT'S INCLUDED:
• AI-designed magazine cover (auto-generated)
• Permanently featured in Tennessee Directory Of Graduates
• Shareable link for family and friends
• Cash App tag on cover (FREE)
• Add supporter names who send Cash App gifts

🔗 VIEW YOUR MAGAZINE COVER:
Your feature will be visible within 1 hour at:
${window.location.origin}/Directory

📤 SHARE YOUR UNIQUE LINK WITH FAMILY & FRIENDS:
${window.location.origin}/GraduateDetail?orderId=${orderId}

${formData.cash_app_tag ? `💵 CASH APP SUPPORT:
Your Cash App tag (${formData.cash_app_tag}) is displayed on your cover.
Family and friends can show their support by sending gifts!` : ''}

💡 WANT TO UPGRADE TO PREMIUM? ($29.95)
You can upgrade to our Premium Magazine Cover service at any time! Get:
• Professional graphic design by our staff
• Custom effects: brighter days, sun, clouds
• Honor Roll & Principal's Award seal options
• Proof sent for your approval before printing
• 11" x 15" printed poster mailed to you via USPS
• VIP Graduate personalized song (Optional Purchase)

📧 Simply reply to this email anytime to upgrade!

💳 TOTAL AMOUNT PAID: $${(totalAmount * 1.0975).toFixed(2)}
"Every Student Deserves to Be Visible." ✨

Best regards,
The B.Visible Team
Birth 2 Greatness
        ` : `
Dear ${formData.student_name},

🎉 Thank you for your Premium Magazine Cover order!

🎨 YOUR PREMIUM ORDER (#${orderId})

✨ WHAT'S INCLUDED:
• Professional graphic design by B2G staff
• Custom effects: brighter days, sun, clouds
• Honor Roll & Principal's Award seal options (if selected)
• 11" x 15" printed poster mailed via USPS
• Shareable link for family and friends
• Cash App tag on cover (FREE)
${formData.vip_song_addon ? '• VIP Graduate personalized song package' : ''}
${formData.extra_copy ? `• Extra magazine copies (${formData.extra_copy_quantity}x)` : ''}

💳 ORDER TOTAL PAID: $${(totalAmount * 1.0975).toFixed(2)}

📧 WHAT HAPPENS NEXT:
1. Our design team will create your custom magazine cover (7-10 business days)
2. You'll receive a proof via email for approval
3. Once approved, we'll print and mail your poster
4. Your cover will be featured in the Tennessee Directory Of Graduates

🔗 CHECK YOUR STATUS:
${window.location.origin}/Directory

📤 SHAREABLE LINK (available after approval):
${window.location.origin}/GraduateDetail?orderId=${orderId}

${formData.cash_app_tag ? `💵 CASH APP TAG:
Your Cash App tag (${formData.cash_app_tag}) will be featured on your cover!` : ''}

We'll email you when your proof is ready for review.

"Every Student Deserves to Be Visible." ✨

Best regards,
The B.Visible Team
Birth 2 Greatness
        `;

        await base44.integrations.Core.SendEmail({
          from_name: 'B.Visible Magazine',
          to: formData.student_email || formData.parent_email,
          subject: `🎓 You're Featured in the Tennessee Directory Of Graduates!`,
          body: directoryEmailBody
        });
      } catch (error) {
        console.error('Failed to generate proof or send email:', error);
      }

      // Confetti celebration!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD60A', '#6C3BFF', '#20D4AB', '#FF6B9D']
      });

      // Send admin email
      const vipPhotoCount = formData.vip_photos?.filter((p) => p).length || 0;
      const emailBody = `
🎓 NEW B.VISIBLE MAGAZINE ORDER

Order ID: ${orderId}

━━━━━━━━━━━━━━━━━━━━━━━━
STUDENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━
Student Name: ${formData.student_name}
School/Church: ${formData.school_or_church || 'N/A'}
School Colors: ${formData.school_colors}
Birthday Month: ${formData.birthday_month || 'N/A'}
School Mascot: ${formData.school_mascot || 'N/A'}
Hobbies: ${formData.hobbies || 'N/A'}
Future Career: ${formData.future_career === 'Other—Type Here' ? formData.future_career_other : formData.future_career || 'N/A'}
Feature in VIP Edition: ${formData.feature_in_vip_edition ? 'Yes' : 'No'}
Cash App Tag: ${formData.cash_app_tag || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━
PARENT/GUARDIAN INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━
Parent Name: ${formData.parent_name}
Email: ${formData.parent_email}
Phone: ${formData.parent_phone || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━
PHOTOS
━━━━━━━━━━━━━━━━━━━━━━━━
Main Cover Photo: ${formData.main_photo_url}
VIP Song Package: ${formData.vip_song_addon ? 'Yes' : 'No'}
VIP Photo Count: ${vipPhotoCount}
${formData.vip_photos?.filter((p) => p).map((url, i) => `VIP Photo ${i + 1}: ${url}`).join('\n') || ''}

━━━━━━━━━━━━━━━━━━━━━━━━
ADD-ONS & ACHIEVEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━
Honor Roll: ${formData.honor_roll ? 'Yes' : 'No'}
Principal's List: ${formData.principals_list ? 'Yes' : 'No'}
Extra Magazine Copies: ${formData.extra_copy ? `Yes (${formData.extra_copy_quantity}x = $${extraCopyPrice.toFixed(2)})` : 'No'}
Cash App Tag on Cover: ${formData.cash_app_tag_on_cover ? 'Yes (+$10.00)' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT & DELIVERY
━━━━━━━━━━━━━━━━━━━━━━━━
Payment Method: ${formData.payment_method === 'cashapp' ? 'Cash App' : 'Credit/Debit Card (Stripe)'}
${formData.payment_method === 'cashapp' ? `Cash App Screenshot: ${formData.cash_app_screenshot_url}
Delivery Address: ${formData.delivery_address}, ${formData.delivery_city}, ${formData.delivery_state} ${formData.delivery_zip}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━
ORDER TOTAL
━━━━━━━━━━━━━━━━━━━━━━━━
${formData.is_promo_order ? 'Self-Generated Magazine Cover: $4.95' : 'Premium Magazine Cover (includes printed poster): $29.95'}
Extra Copies: $${extraCopyPrice.toFixed(2)}
Cash App Tag on Cover: $${cashAppTagPrice.toFixed(2)}
TOTAL: $${totalAmount.toFixed(2)}

Payment Status: ${formData.payment_method === 'cashapp' ? 'PENDING VERIFICATION' : 'PENDING'}

━━━━━━━━━━━━━━━━━━━━━━━━
      `;

      // Send detailed email with all photos
      const photosList = [
      formData.main_photo_url && `Main Cover Photo: ${formData.main_photo_url}`,
      ...(formData.vip_photos || []).map((url, i) => url && `VIP Photo ${i + 1}: ${url}`)].
      filter(Boolean).join('\n      ');

      // Send order confirmation to admin
      await base44.integrations.Core.SendEmail({
        to: 'bvisiblewalk@aol.com',
        subject: `🎓 New B2G Order: ${orderId} - ${formData.student_name}`,
        body: `${emailBody}\n\n      ━━━━━━━━━━━━━━━━━━━━━━━━\n      📸 PHOTO ATTACHMENTS\n      ━━━━━━━━━━━━━━━━━━━━━━━━\n      ${photosList}\n\n      All photos have been uploaded and are accessible via the URLs above.`
      });

      // Send detailed confirmation email to customer
      const customerEmailBody = `
Dear ${formData.parent_name},

🎉 Thank you for your order! We're thrilled to create a B.Visible Magazine Career Cover for ${formData.student_name}!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ORDER CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order ID: ${orderId}
Order Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 STUDENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Student Name: ${formData.student_name}
School/Church: ${formData.school_or_church || 'N/A'}
School Colors: ${formData.school_colors}
${formData.birthday_month ? `Birthday Month: ${formData.birthday_month}` : ''}
${formData.school_mascot ? `School Mascot: ${formData.school_mascot}` : ''}
${formData.hobbies ? `Hobbies: ${formData.hobbies}` : ''}
${formData.future_career ? `Future Career: ${formData.future_career === 'Other—Type Here' ? formData.future_career_other : formData.future_career}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 ORDER SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${formData.is_promo_order ? 'Self-Generated Magazine Cover' : 'Premium Magazine Cover (includes 11" x 15" poster)'}    $${basePrice.toFixed(2)}
${formData.extra_copy ? `Extra Magazine Copies (${formData.extra_copy_quantity}x @ $14.95)       $${extraCopyPrice.toFixed(2)}` : ''}
${formData.cash_app_tag_on_cover ? 'Cash App Tag on Cover                                 FREE' : ''}
${formData.vip_song_addon ? 'VIP Graduate Song Package                             $49.95' : ''}

Subtotal:                                              $${totalAmount.toFixed(2)}
Sales Tax (9.75%):                                     $${(totalAmount * 0.0975).toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL PAID:                                            $${(totalAmount * 1.0975).toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment Method: ${formData.payment_method === 'cashapp' ? 'Cash App Debit Card' : 'Credit/Debit Card (Stripe)'}
Payment Status: ${formData.payment_method === 'stripe' ? '✅ PAID' : '⏳ Pending Verification'}
${formData.payment_method === 'cashapp' ? `\nDelivery Address:\n${formData.delivery_address}\n${formData.delivery_city}, ${formData.delivery_state} ${formData.delivery_zip}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ PROOF CREATION: 7-10 Business Days
   Our design team will create your personalized magazine cover
   and send you a digital proof for approval.

📧 PROOF APPROVAL: Review & Approve
   You'll receive an email with the proof and approval link.
   Request any changes or approve for printing.

🖨️ PRINTING & PRODUCTION: 5-7 Business Days
   Once approved, your magazine cover will be professionally printed.

📦 SHIPPING & DELIVERY: 3-5 Business Days
   Your order will be carefully packaged and shipped to you.

🎓 ESTIMATED TOTAL TIME: 3-4 Weeks from Order Date

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${formData.feature_in_vip_edition ? '🌟 FEATURED: Your graduate is now featured in the Tennessee 2026 Graduate Directory!\n\n' : ''}For order updates and more information, visit:
🔗 https://birth2greatness.com/Thank-You

Have questions? Simply reply to this email or call us.

Thank you for celebrating ${formData.student_name}'s achievement with B.Visible Magazine!

"Every Student Deserves to Be Visible." ✨

Best regards,
The B.Visible Team
Birth 2 Greatness
      `;

      await base44.integrations.Core.SendEmail({
        from_name: 'B.Visible Magazine',
        to: formData.parent_email,
        subject: `🎉 Order Confirmation #${orderId} - ${formData.student_name}`,
        body: customerEmailBody
      });

      // Redirect based on payment method
      if (formData.payment_method === 'stripe') {
        // Stripe payment completed - update order and redirect
        await base44.entities.Order.update(orderId, { payment_status: 'paid' });
        window.location.href = `/OrderConfirmation?orderId=${orderId}`;
      } else {
        // Cash App - redirect to confirmation
        window.location.href = `/OrderConfirmation?orderId=${orderId}`;
      }

    } catch (error) {
      console.error('Order submission failed:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020]">
      <WelcomeAudio />
      
      <HeroBanner onStartOrder={scrollToForm} />

      <TestimonialsSection />

      {/* Order Form */}
      <div ref={formRef} className="relative py-20 px-4 md:px-8">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD60A]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6C3BFF]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#FFD60A]" />
              <span className="text-white/90 text-sm font-medium">Order Your Magazine Cover</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4"

            style={{ fontFamily: 'Montserrat, sans-serif' }}>Let's Get Started


            </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Fill out the form below to create your personalized 2026 B.Visible Magazine Career Cover
              </p>
          </div>

          <div className="space-y-8">
            <PromoCodeSection
              formData={formData}
              setFormData={setFormData} />

            <StudentInfoSection
              formData={formData}
              setFormData={setFormData}
              errors={errors} />

            <PhotoUploadSection
              formData={formData}
              setFormData={setFormData}
              errors={errors} />

            {!formData.is_promo_order && (
              <BackgroundDesignSelector
                formData={formData}
                setFormData={setFormData}
                errors={errors} />
            )}

            <VIPSongSection
              formData={formData}
              setFormData={setFormData} />

            
            <AddOnsSection
              formData={formData}
              setFormData={setFormData} />

            
            <OrderSummary
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              orderId={orderId} />

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0D1020] border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            © 2024 B.Visible Magazine • Birth2Greatness
          </p>
          <p className="text-[#20D4AB] text-sm mt-2 italic">
            "Every Student Deserves to Be Visible."
          </p>
        </div>
      </footer>

      {/* Enlarged Image Dialog */}
      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
          <img 
            src={enlargedImage} 
            alt="Enlarged magazine cover" 
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </div>);

}