import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Home, Users, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ChatBot from './components/ChatBot';

export default function Layout({ children, currentPageName }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, [currentPageName]);

  const checkUserStatus = async () => {
    try {
      const user = await base44.auth.me();
      setIsAdmin(user.role === 'admin' || user.user_role === 'admin' || user.user_role === 'editor');
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const navItems = [
    { name: 'Home', icon: Home, label: 'Order' },
    { name: 'Directory', icon: Users, label: 'Tennessee Directory Of Graduates' },
  ];

  const adminNavItems = [
    { name: 'AdminOrders', icon: Users, label: 'Manage Orders' },
    { name: 'AdminSchools', icon: GraduationCap, label: 'Manage Schools' },
    { name: 'AdminTestimonials', icon: Sparkles, label: 'Testimonials' }
  ];

  // Hide navigation on confirmation page
  const showNav = currentPageName !== 'OrderConfirmation';

  return (
    <div className="min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      {/* Floating Navigation */}
      {showNav && (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-2 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold hidden sm:inline" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                B.Visible
              </span>
            </Link>

            <div className="w-px h-6 bg-white/20" />

            {/* Nav Items */}
            {navItems.map((item) => {
              const isActive = currentPageName === item.name;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Admin Nav Items */}
            {isAdmin && adminNavItems.map((item) => {
              const isActive = currentPageName === item.name;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
              })}
              </div>
              </nav>
              )}

                {/* Page Content */}
                <main>
                  {children}
                </main>

                {/* AI Chatbot */}
                <ChatBot />
                </div>
                );
                }