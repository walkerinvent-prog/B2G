import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap } from 'lucide-react';

const months = [
"January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"];


const careers = [
"Doctor / Healthcare",
"Engineer / Technology",
"Teacher / Education",
"Business / Entrepreneur",
"Artist / Creative",
"Athlete / Sports",
"Lawyer / Legal",
"Scientist / Research",
"Military / Service",
"Other"];


export default function StudentInfoSection({ formData, setFormData, errors }) {
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Student / Graduate Information
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label className="text-white/90 mb-2 block">Student Full Name *</Label>
          <Input
            value={formData.student_name || ''}
            onChange={(e) => updateField('student_name', e.target.value)}
            placeholder="Enter student's full name"
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl text-lg ${errors.student_name ? 'border-red-500' : ''}`} />

          {errors.student_name && <p className="text-red-400 text-sm mt-1">{errors.student_name}</p>}
        </div>

        <div className="md:col-span-2">
          <Label className="text-white/90 mb-3 block">Gender</Label>
          <RadioGroup
            value={formData.gender || ''}
            onValueChange={(v) => updateField('gender', v)}
            className="flex gap-6">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="male" id="gender-male" className={`border-white/40 ${formData.gender === 'male' ? 'bg-[#FFD60A] border-[#FFD60A]' : ''}`} />
              <Label htmlFor="gender-male" className="text-white cursor-pointer">Male</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="female" id="gender-female" className={`border-white/40 ${formData.gender === 'female' ? 'bg-[#FFD60A] border-[#FFD60A]' : ''}`} />
              <Label htmlFor="gender-female" className="text-white cursor-pointer">Female</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/90 mb-2 block">School or Church Name (if applicable)</Label>
          <Input
            value={formData.school_or_church || ''}
            onChange={(e) => updateField('school_or_church', e.target.value)}
            placeholder="School or church name"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl" />

        </div>

        <div>
          <Label className="text-white/90 mb-2 block">School Colors *</Label>
          <Input
            value={formData.school_colors || ''}
            onChange={(e) => updateField('school_colors', e.target.value)}
            placeholder="e.g., Blue and Gold"
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl ${errors.school_colors ? 'border-red-500' : ''}`} />

          {errors.school_colors && <p className="text-red-400 text-sm mt-1">{errors.school_colors}</p>}
        </div>

        <div>
          <Label className="text-white/90 mb-2 block">Birthday Month</Label>
          <Select value={formData.birthday_month || ''} onValueChange={(v) => updateField('birthday_month', v)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-14 rounded-xl">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) =>
              <SelectItem key={month} value={month}>{month}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white/90 mb-2 block">School Mascot</Label>
          <Input
            value={formData.school_mascot || ''}
            onChange={(e) => updateField('school_mascot', e.target.value)}
            placeholder="e.g., Eagles, Tigers"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl" />

        </div>

        <div>
          <Label className="text-white/90 mb-2 block">Hobbies</Label>
          <Input
            value={formData.hobbies || ''}
            onChange={(e) => updateField('hobbies', e.target.value)}
            placeholder="What do they love to do?"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl" />

        </div>

        <div>
          <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/90 mb-2 block">School ACHIEVEMENTS</Label>
          <Input
            value={formData.homeschool_location || ''}
            onChange={(e) => updateField('homeschool_location', e.target.value)}
            placeholder="Type achievements"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl" />

        </div>

        <div>
          <Label className="text-white/90 mb-2 block">Student Email</Label>
          <Input
            value={formData.student_email || ''}
            onChange={(e) => updateField('student_email', e.target.value)}
            placeholder="student@example.com"
            type="email"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl" />
        </div>

        <div>
          <Label className="text-white/90 mb-2 block">Student Phone</Label>
          <Input
            value={formData.student_phone || ''}
            onChange={(e) => updateField('student_phone', e.target.value)}
            placeholder="(xxx) xxx-xxxx"
            type="tel"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl" />
        </div>

        <div>
          <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/90 mb-2 block">Plan To Attend What College (Optional)</Label>
          <Input
            value={formData.friends_names || ''}
            onChange={(e) => updateField('friends_names', e.target.value)}
            placeholder="e.g., University of Tennessee"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl" />

        </div>

        <div className="md:col-span-2">
          <Label className="text-white/90 mb-2 block">Future Career</Label>
          <Select value={formData.future_career || ''} onValueChange={(v) => updateField('future_career', v)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-14 rounded-xl">
              <SelectValue placeholder="Select career path" />
            </SelectTrigger>
            <SelectContent>
              {careers.map((career) =>
              <SelectItem key={career} value={career}>{career}</SelectItem>
              )}
              </SelectContent>
              </Select>
              {formData.future_career === 'Other' &&
          <Input
            value={formData.future_career_other || ''}
            onChange={(e) => updateField('future_career_other', e.target.value)}
            placeholder="Type your career choice"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl mt-3" />

          }
        </div>

        <div className="md:col-span-2">
          <Label className="text-white/90 mb-2 block">Magazine Cover Headline</Label>
          <p className="text-white/60 text-sm mb-3">Choose the headline that will appear on your magazine cover</p>
          <Select value={formData.headline_choice || ''} onValueChange={(v) => updateField('headline_choice', v)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-14 rounded-xl">
              <SelectValue placeholder="Select headline for magazine cover" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Who Dreams Of Becoming A World Class...">Who Dreams Of Becoming A World Class...</SelectItem>
              <SelectItem value="Who Dreams Of Becoming A Professional...">Who Dreams Of Becoming A Professional...</SelectItem>
              <SelectItem value="Has Mastered The Trade Of...">Has Mastered The Trade Of...</SelectItem>
              <SelectItem value="Is On The Way To Becoming A Great...">Is On The Way To Becoming A Great...</SelectItem>
              <SelectItem value="Has Enlisted In America's US...">Has Enlisted In America's US...</SelectItem>
            </SelectContent>
          </Select>

          {formData.headline_choice &&
          <div className="mt-4">
              <Label className="text-white/90 mb-2 block">
                Complete Your Headline
              </Label>
              <p className="text-white/60 text-sm mb-3">
                {formData.headline_choice === "Who Dreams Of Becoming A World Class..." && "What field? (e.g., Engineer, Artist, Athlete)"}
                {formData.headline_choice === "Who Dreams Of Becoming A Professional..." && "What profession? (e.g., Singer, YouTuber, Painter)"}
                {formData.headline_choice === "Has Mastered The Trade Of..." && "What trade? (e.g., Drafting, Industrial Engineering, Graphic Arts)"}
                {formData.headline_choice === "Is On The Way To Becoming A Great..." && "What profession? (e.g., Artist, Doctor, Dentist)"}
                {formData.headline_choice === "Has Enlisted In America's US..." && "Which branch? (e.g., Airforce, Navy, Marines, Army)"}
              </p>
              <Input
              value={formData.headline_completion || ''}
              onChange={(e) => updateField('headline_completion', e.target.value)}
              placeholder="Type here..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl" />

            </div>
          }
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <Label className="text-white/90 mb-3 block text-xl font-semibold">
                Your B.Visible Magazine Cover Will Be Featured in the Inaugural Edition of the Tennessee Directory of 2026 Graduates
              </Label>
              <p className="text-white/70 text-sm mb-4">
                Be featured in the Tennessee Directory of Graduates with students across the state! Your profile will be available in May 2026.
              </p>
              <Label className="text-white/90 mb-3 block font-medium">Feature me in the Directory?</Label>
              <RadioGroup
                value={formData.feature_in_vip_edition ? 'yes' : 'no'}
                onValueChange={(v) => updateField('feature_in_vip_edition', v === 'yes')}
                className="flex gap-6">

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="vip-yes" className="border-white/40 text-[#FFD60A]" />
                  <Label htmlFor="vip-yes" className="text-white cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="vip-no" className="border-white/40 text-[#FFD60A]" />
                  <Label htmlFor="vip-no" className="text-white cursor-pointer">No, keep it private</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex-shrink-0 flex gap-4">
              <div className="text-center">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/eff9af017_90ab3a33-2d90-4d59-85d3-72c224667ef4.png"
                  alt="Standard Magazine Cover"
                  className="w-32 md:w-40 h-auto rounded-xl border-2 border-[#FFD60A]/30 shadow-lg shadow-purple-500/20" />
                <p className="text-white/80 text-sm mt-2 font-medium">Standard</p>
              </div>
              <div className="text-center">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69326e684ba65b6db086db61/a3b313c64_BVisibleMagazine-GradSAMPLES-Clouds1x.jpg"
                  alt="TN Directory Sample"
                  className="w-32 md:w-40 h-auto rounded-xl border-2 border-[#FFD60A]/30 shadow-lg shadow-purple-500/20" />
                <p className="text-white/80 text-sm mt-2 font-medium">TN Directory</p>
              </div>
              <div className="text-center">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694b7ea7341a2c7a3fb380b1/2ddeed145_2024B2GZalenaWalker.jpg"
                  alt="Premium Magazine Cover"
                  className="w-32 md:w-40 h-auto rounded-xl border-2 border-[#FFD60A]/30 shadow-lg shadow-purple-500/20" />
                <p className="text-white/80 text-sm mt-2 font-medium">Premium</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}