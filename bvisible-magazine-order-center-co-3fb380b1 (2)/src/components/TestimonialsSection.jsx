import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function TestimonialsSection() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ['featured-testimonials'],
    queryFn: () => base44.entities.Testimonial.filter({ is_featured: true }, 'order_number', 10),
  });

  if (testimonials.length === 0) return null;

  return (
    <div className="relative py-20 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#6C3BFF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFD60A]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Star className="w-4 h-4 text-[#FFD60A]" />
            <span className="text-white/90 text-sm font-medium">What Parents & Graduates Say</span>
          </div>
          <h2 
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <span className="bg-gradient-to-r from-[#FFD60A] via-[#20D4AB] to-[#6C3BFF] bg-clip-text text-transparent">
              Success Stories
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Celebrating the moments that matter most
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-[#FFD60A] mb-4 opacity-50" />
                
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFD60A] text-[#FFD60A]" />
                  ))}
                </div>

                <p className="text-white/80 text-sm mb-6 line-clamp-4">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3">
                  {testimonial.photo_url ? (
                    <img 
                      src={testimonial.photo_url} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#FFD60A]/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                    {testimonial.role && (
                      <p className="text-white/50 text-xs">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}