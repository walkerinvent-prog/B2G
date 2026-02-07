import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, GraduationCap, School, Calendar, Star, 
  Sparkles, Heart, Briefcase, Palette, Loader2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShareButtons from '../components/ShareButtons';
import SupportersSection from '../components/SupportersSection';
import CareerGoalsSection from '../components/CareerGoalsSection';

export default function GraduateDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');
  const [isOwner, setIsOwner] = React.useState(false);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      return orders[0];
    },
    enabled: !!orderId,
  });

  React.useEffect(() => {
    checkOwnership();
  }, [order]);

  const checkOwnership = async () => {
    if (!order) return;
    try {
      const user = await base44.auth.me();
      // Owner if email matches OR user is admin/editor
      const hasPermission = 
        user.email === order.parent_email || 
        user.role === 'admin' || 
        user.user_role === 'admin' || 
        user.user_role === 'editor';
      setIsOwner(hasPermission);
    } catch (error) {
      setIsOwner(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FFD60A] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Graduate Not Found</h2>
          <Link to={createPageUrl('Directory')}>
            <Button className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF]">
              Back to Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020]">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#FFD60A]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6C3BFF]/10 rounded-full blur-3xl" />
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
            <Sparkles className="w-4 h-4 text-[#FFD60A]/30" />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <Link to={createPageUrl('Directory')}>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Directory
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Magazine Cover */}
          <div className="relative">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border-4 border-[#FFD60A] shadow-2xl shadow-yellow-500/20">
              <img
                src={order.magazine_cover_url || order.main_photo_url}
                alt={`${order.student_name}'s magazine career cover`}
                className="w-full h-full object-cover"
              />
              
              {/* Frame Glow Effect */}
              <div className="absolute inset-0 border-8 border-transparent bg-gradient-to-br from-[#FFD60A]/20 via-transparent to-[#6C3BFF]/20 pointer-events-none" />
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] rounded-full shadow-lg">
              <span className="text-white font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Class of 2026
              </span>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div>
              <h1 
                className="text-4xl md:text-5xl font-black text-white mb-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {order.student_name}
              </h1>
              <div className="flex items-center gap-2 text-white/60">
                <GraduationCap className="w-5 h-5" />
                <span>2026 B.Visible Graduate</span>
              </div>
            </div>

            {/* Details Cards */}
            <div className="space-y-4">
              {order.school_or_church && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6C3BFF]/20 flex items-center justify-center">
                      <School className="w-5 h-5 text-[#6C3BFF]" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">School/Church</p>
                      <p className="text-white font-medium">{order.school_or_church}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.school_colors && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD60A]/20 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-[#FFD60A]" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">School Colors</p>
                      <p className="text-white font-medium">{order.school_colors}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.future_career && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#20D4AB]/20 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-[#20D4AB]" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Future Career</p>
                      <p className="text-white font-medium">{order.future_career}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements */}
              {(order.honor_roll || order.principals_list) && (
                <div className="bg-gradient-to-r from-[#FFD60A]/10 to-[#6C3BFF]/10 rounded-2xl p-5 border border-[#FFD60A]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-[#FFD60A]" />
                    <p className="text-white font-medium">Achievements</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.honor_roll && (
                      <Badge className="bg-[#FFD60A]/20 text-[#FFD60A] border-[#FFD60A]/30">
                        Honor Roll
                      </Badge>
                    )}
                    {order.principals_list && (
                      <Badge className="bg-[#6C3BFF]/20 text-[#6C3BFF] border-[#6C3BFF]/30">
                        Principal's List
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Share & Cash App Buttons */}
            <div className="space-y-3">
              <ShareButtons
                url={window.location.href}
                title={`${order.student_name} - B.Visible Magazine Class of 2026`}
                description={`Check out ${order.student_name}'s amazing graduate magazine career cover from ${order.school_or_church || 'their school'}!`}
                imageUrl={order.magazine_cover_url || order.main_photo_url}
                variant="outline"
                size="lg"
              />
              
              {order.cash_app_tag && (
                <a
                  href={`https://cash.app/${order.cash_app_tag.replace('$', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-[#00D632] hover:bg-[#00B82E] text-white py-6 text-lg rounded-2xl">
                    <Heart className="w-5 h-5 mr-2" />
                    Show Love on Cash App ({order.cash_app_tag})
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Supporters & Career Goals Section */}
        <div className="mt-12 space-y-6">
          <SupportersSection 
            order={order} 
            isOwner={isOwner} 
            onUpdate={refetch} 
          />
          
          <CareerGoalsSection 
            order={order} 
            isOwner={isOwner} 
            onUpdate={refetch} 
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0D1020] border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            © 2024 B.Visible Magazine • Birth2Greatness
          </p>
          <p className="text-[#20D4AB] text-sm mt-2 italic">
            "Every Student Deserves to Be Visible."
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}