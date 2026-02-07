import React from 'react';
import { GraduationCap, School, Heart, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ShareButtons from '../ShareButtons';

export default function MagazineCoverCard({ order }) {
  return (
    <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-purple-500/30">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD60A]/20 via-transparent to-[#6C3BFF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={order.magazine_cover_url || order.main_photo_url}
          alt={`${order.student_name}'s magazine career cover`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1020] via-transparent to-transparent" />
        
        {/* Frame Glow */}
        <div className="absolute inset-4 border-2 border-[#FFD60A]/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info */}
      <div className="relative p-6 -mt-16 z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {order.student_name}
          </h3>
          
          <div className="flex items-center gap-2 text-white/60 mb-4">
            <School className="w-4 h-4" />
            <span className="text-sm">{order.school_or_church || 'Class of 2026'}</span>
          </div>

          <div className="flex gap-2">
            <Link 
              to={createPageUrl(`GraduateDetail?id=${order.id}`)}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </Button>
            </Link>
            
            <ShareButtons
              url={`${window.location.origin}${createPageUrl('GraduateDetail')}?id=${order.id}`}
              title={`${order.student_name} - B.Visible Magazine`}
              description={`Check out ${order.student_name}'s graduate magazine cover!`}
              imageUrl={order.magazine_cover_url || order.main_photo_url}
              variant="outline"
              size="sm"
            />
            
            {order.cash_app_tag && (
              <a
                href={`https://cash.app/${order.cash_app_tag.replace('$', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="bg-[#00D632] hover:bg-[#00B82E] text-white">
                  <Heart className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}