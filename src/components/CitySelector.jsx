import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin } from 'lucide-react';

const cities = [
  { name: 'Clarksville', color: 'from-green-500 to-green-600' },
  { name: 'Knoxville', color: 'from-orange-500 to-orange-600' },
  { name: 'Memphis', color: 'from-red-500 to-red-600' },
  { name: 'Johnson City', color: 'from-red-600 to-red-700' },
  { name: 'Shelby County', color: 'from-purple-500 to-purple-600' },
  { name: 'Chattanooga', color: 'from-yellow-500 to-yellow-600' },
  { name: 'Murfreesboro', color: 'from-orange-600 to-orange-700' },
  { name: 'Davidson County', color: 'from-teal-500 to-teal-600' },
  { name: 'Gatlinburg', color: 'from-blue-500 to-blue-600' },
  { name: 'Jackson', color: 'from-indigo-500 to-indigo-600' }
];

export default function CitySelector() {
  return (
    <div className="relative py-20 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#20D4AB]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#6C3BFF]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <MapPin className="w-4 h-4 text-[#20D4AB]" />
            <span className="text-white/90 text-sm font-medium">2026 Directory</span>
          </div>
          
          <h2 
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Click Here To View
          </h2>
          
          <p 
            className="text-3xl md:text-4xl font-bold mb-8"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <span className="bg-gradient-to-r from-[#FFD60A] via-[#20D4AB] to-[#6C3BFF] bg-clip-text text-transparent">
              Tennessee Graduate's Magazine Covers
            </span>
          </p>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {cities.map((city) => (
            <Link
              key={city.name}
              to={`${createPageUrl('Directory')}?location=${encodeURIComponent(city.name)}`}
              className="group relative"
            >
              <div className={`
                relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8
                border border-white/10 hover:border-white/30
                transition-all duration-300
                hover:scale-105 hover:shadow-2xl
                cursor-pointer
              `}>
                <div className={`
                  absolute inset-0 opacity-0 group-hover:opacity-20
                  bg-gradient-to-r ${city.color}
                  rounded-2xl transition-opacity duration-300
                `} />
                
                <div className="relative z-10 text-center">
                  <MapPin className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-3 text-white/60 group-hover:text-white transition-colors`} />
                  <h3 
                    className="text-lg md:text-xl font-bold text-white group-hover:scale-110 transition-transform"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {city.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Center Logo/Badge */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-[#FFD60A]/20 via-[#20D4AB]/20 to-[#6C3BFF]/20 backdrop-blur-xl rounded-full p-8 border border-white/20">
            <div className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              B<span className="text-[#FFD60A]">2</span>G
            </div>
            <div className="text-sm text-white/80 mt-2">Birth 2 Greatness</div>
            <div className="text-2xl md:text-3xl font-bold text-[#20D4AB] mt-2">2026</div>
            <div className="text-lg text-white/90 mt-1">Directory</div>
          </div>
        </div>
      </div>
    </div>
  );
}