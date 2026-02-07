import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, ChevronLeft, GraduationCap, Loader2, MapPin, Globe, Palette, Search, ArrowUpDown, Users, TrendingUp, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MagazineCoverCard from '../components/directory/MagazineCoverCard';

export default function SchoolDetail() {
  const [schoolName, setSchoolName] = useState('');
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByName, setSortByName] = useState(false);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSchoolName(urlParams.get('school') || '');
    setLocation(urlParams.get('location') || '');
  }, []);

  // Fetch school data
  const { data: schools = [] } = useQuery({
    queryKey: ['school', schoolName],
    queryFn: () => base44.entities.School.filter({ name: schoolName }),
    enabled: !!schoolName,
  });

  const school = schools[0];

  // Fetch approved orders for this school
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['school-orders', schoolName],
    queryFn: () => base44.entities.Order.filter({ 
      approved_for_directory: true,
      school_or_church: schoolName 
    }, '-created_date'),
    enabled: !!schoolName,
  });

  // Calculate school statistics
  const schoolStats = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    // Total orders
    const totalOrders = orders.length;

    // Most popular design
    const designCounts = {};
    orders.forEach(order => {
      const design = order.background_design || 'design1';
      designCounts[design] = (designCounts[design] || 0) + 1;
    });
    const mostPopularDesign = Object.keys(designCounts).reduce((a, b) => 
      designCounts[a] > designCounts[b] ? a : b, 'design1'
    );
    const designNames = {
      'design1': 'Sky Is My Launching Pad',
      'design2': 'All Clean White',
      'design3': 'Big Money',
      'design4': 'Glamour Lights'
    };

    // Order completion rate (paid orders)
    const completedOrders = orders.filter(order => order.payment_status === 'paid').length;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return {
      totalOrders,
      mostPopularDesign: designNames[mostPopularDesign] || 'Sky Is My Launching Pad',
      completionRate
    };
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = React.useMemo(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.student_name?.toLowerCase().includes(query)
      );
    }

    // Apply alphabetical sorting
    if (sortByName) {
      filtered.sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''));
    }

    return filtered;
  }, [orders, searchQuery, sortByName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020]">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#FFD60A]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#6C3BFF]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
          <Link 
            to={`${createPageUrl('Directory')}?location=${location}`}
            className="text-[#FFD60A] hover:text-[#FFE44D] flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Schools in {location}
          </Link>
        </div>

        {/* School Header */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            {/* School Photo Banner */}
            {school?.photo_url && (
              <div className="h-64 relative overflow-hidden">
                <img 
                  src={school.photo_url} 
                  alt={school.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1020] to-transparent" />
              </div>
            )}

            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* School Logo */}
                {school?.logo_url ? (
                  <div className="w-32 h-32 rounded-2xl bg-white p-4 flex items-center justify-center shadow-xl flex-shrink-0">
                    <img 
                      src={school.logo_url} 
                      alt={`${school.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-16 h-16 text-white" />
                  </div>
                )}

                {/* School Info */}
                <div className="flex-1">
                  <h1 
                    className="text-4xl md:text-5xl font-black text-white mb-4"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {schoolName}
                  </h1>

                  {school && (
                    <div className="space-y-3 text-white/80">
                      {school.type && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                          <span className="text-sm font-medium">{school.type} School</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-4 mt-4">
                        {school.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#20D4AB]" />
                            <span>{school.city}</span>
                          </div>
                        )}
                        {school.mascot && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#FFD60A]" />
                            <span>Mascot: {school.mascot}</span>
                          </div>
                        )}
                        {school.colors && (
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-[#6C3BFF]" />
                            <span>Colors: {school.colors}</span>
                          </div>
                        )}
                      </div>

                      {school.website && (
                        <a 
                          href={school.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#FFD60A] hover:text-[#FFE44D] transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Visit School Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* School Statistics */}
        {schoolStats && (
          <div className="max-w-7xl mx-auto px-4 pb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 
                className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <TrendingUp className="w-6 h-6 text-[#FFD60A]" />
                School Statistics
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Total Orders */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#FFD60A]/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#FFD60A]" />
                    </div>
                    <p className="text-white/60 text-sm">Total Graduates</p>
                  </div>
                  <p className="text-4xl font-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {schoolStats.totalOrders}
                  </p>
                </div>

                {/* Most Popular Design */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#6C3BFF]/20 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-[#6C3BFF]" />
                    </div>
                    <p className="text-white/60 text-sm">Popular Design</p>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {schoolStats.mostPopularDesign}
                  </p>
                </div>

                {/* Order Completion Rate */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#20D4AB]/20 flex items-center justify-center">
                      <Award className="w-5 h-5 text-[#20D4AB]" />
                    </div>
                    <p className="text-white/60 text-sm">Completion Rate</p>
                  </div>
                  <p className="text-4xl font-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {schoolStats.completionRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Graduates Section */}
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Featured Graduates
              </h2>
              <p className="text-white/60">Class of 2026 • {orders.length} graduate{orders.length !== 1 ? 's' : ''}</p>
            </div>
            
            {orders.length > 0 && (
              <Button
                onClick={() => setSortByName(!sortByName)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {sortByName ? 'Sort by Recent' : 'Sort A-Z'}
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#FFD60A] animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Graduates Yet
              </h3>
              <p className="text-white/60 max-w-md mx-auto mb-6">
                Be the first graduate from {schoolName} to be featured in the B.Visible Magazine Directory!
              </p>
              <Link to={createPageUrl('Home')}>
                <Button className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:from-[#FFE44D] hover:to-[#8B5CF6] text-white">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Order Your Cover
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
                {filteredOrders.map((order) => (
                  <MagazineCoverCard key={order.id} order={order} />
                ))}
              </div>

              {/* Search Bar at Bottom */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-white text-lg font-semibold mb-4 text-center">
                    Search for a Graduate
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      placeholder="Search by student name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                    />
                  </div>
                  {searchQuery && (
                    <p className="text-white/60 text-sm mt-3 text-center">
                      Showing {filteredOrders.length} of {orders.length} graduate{filteredOrders.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}