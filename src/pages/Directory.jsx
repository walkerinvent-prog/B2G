import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, ChevronLeft, ChevronRight, GraduationCap, Loader2, Search, ArrowUpDown, X, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MagazineCoverCard from '../components/directory/MagazineCoverCard';
import CitySelector from '../components/CitySelector';
import SchoolsList from '../components/directory/SchoolsList';

const ITEMS_PER_PAGE = 12;

export default function Directory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Check for location parameter in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get('location');
    if (location) {
      setSelectedLocation(location);
    }
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['approved-orders'],
    queryFn: () => base44.entities.Order.filter({ approved_for_directory: true }, '-created_date'),
  });

  // Get unique schools for dropdown
  const schools = useMemo(() => {
    const schoolSet = new Set();
    orders.forEach(order => {
      if (order.school_or_church?.trim()) {
        schoolSet.add(order.school_or_church.trim());
      }
    });
    return Array.from(schoolSet).sort();
  }, [orders]);

  // Get unique locations
  const locations = useMemo(() => {
    const locationSet = new Set();
    orders.forEach(order => {
      if (order.delivery_city?.trim()) {
        locationSet.add(order.delivery_city.trim());
      }
    });
    return Array.from(locationSet).sort();
  }, [orders]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSchool('all');
    setSelectedLocation('all');
    setSortOrder('recent');
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || selectedSchool !== 'all' || selectedLocation !== 'all' || sortOrder !== 'recent';

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    // Show all results when searching or when filters are applied
    if (!searchQuery.trim() && selectedSchool === 'all' && selectedLocation === 'all') {
      return [];
    }

    let filtered = [...orders];

    // Apply location filter
    if (selectedLocation && selectedLocation !== 'all') {
      const locationQuery = selectedLocation.toLowerCase();
      filtered = filtered.filter(order => {
        const schoolLocation = order.school_or_church?.toLowerCase() || '';
        const deliveryCity = order.delivery_city?.toLowerCase() || '';
        const deliveryState = order.delivery_state?.toLowerCase() || '';
        return schoolLocation.includes(locationQuery) || 
               deliveryCity.includes(locationQuery) ||
               deliveryState.includes(locationQuery);
      });
    }

    // Apply search filter (searches both name and school)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => 
        order.student_name?.toLowerCase().includes(query) ||
        order.school_or_church?.toLowerCase().includes(query)
      );
    }

    // Apply school filter
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(order => 
        order.school_or_church?.trim() === selectedSchool
      );
    }

    // Apply sorting
    if (sortOrder === 'name-asc') {
      filtered.sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''));
    } else if (sortOrder === 'name-desc') {
      filtered.sort((a, b) => (b.student_name || '').localeCompare(a.student_name || ''));
    } else if (sortOrder === 'by-school') {
      filtered.sort((a, b) => (a.school_or_church || '').localeCompare(b.school_or_church || ''));
    }
    // 'recent' is default from query

    return filtered;
  }, [orders, searchQuery, sortOrder, selectedSchool, selectedLocation]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredAndSortedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get schools in selected location
  const locationSchools = useMemo(() => {
    if (!selectedLocation || selectedLocation === 'all') return [];
    
    const schoolSet = new Set();
    const locationQuery = selectedLocation.toLowerCase();
    
    orders.forEach(order => {
      const schoolLocation = order.school_or_church?.toLowerCase() || '';
      const deliveryCity = order.delivery_city?.toLowerCase() || '';
      const deliveryState = order.delivery_state?.toLowerCase() || '';
      
      if ((schoolLocation.includes(locationQuery) || 
           deliveryCity.includes(locationQuery) ||
           deliveryState.includes(locationQuery)) && 
          order.school_or_church?.trim()) {
        schoolSet.add(order.school_or_church.trim());
      }
    });
    
    return Array.from(schoolSet).sort();
  }, [orders, selectedLocation]);

  // Reset to page 1 when search, sort, school, or location changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder, selectedSchool, selectedLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020]">


      {/* Hero Section */}
      <div className="relative py-20 px-4 text-center overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#FFD60A]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#6C3BFF]/10 rounded-full blur-3xl" />
          {[...Array(15)].map((_, i) => (
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
              <Sparkles className="w-4 h-4 text-[#FFD60A]/40" />
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <GraduationCap className="w-4 h-4 text-[#FFD60A]" />
            <span className="text-white/90 text-sm font-medium">2026 Edition</span>
          </div>

          <h1 
            className="text-5xl md:text-7xl font-black text-white mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <span className="bg-gradient-to-r from-[#FFD60A] via-[#20D4AB] to-[#6C3BFF] bg-clip-text text-transparent">
              VIP GRADUATES
            </span>
            <br />
            <span className="text-4xl md:text-5xl font-black text-white/90">
              Directory
            </span>
            <br />
            <span className="text-3xl md:text-4xl font-black text-white/80">
              Class of 2026
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-[#FFD60A] font-semibold max-w-3xl mx-auto mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            "Born To Become…<br />From Day One to Day Won."
          </p>

          <p className="text-lg text-white/80 max-w-3xl mx-auto mb-6 leading-relaxed">
            This is more than a directory — this is a living archive of greatness.
          </p>

          <p className="text-base text-white/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            A digital showcase where each featured graduate has earned a custom-designed magazine cover displaying their name, school, graduation year, and future aspirations. These are tomorrow's leaders, creators, scholars, entrepreneurs, and history makers.
          </p>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-[#FFD60A] font-bold text-lg mb-2">Celebrate Achievement</h3>
              <p className="text-white/70 text-sm">Honor academic excellence and perseverance</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-[#20D4AB] font-bold text-lg mb-2">Honor Purpose</h3>
              <p className="text-white/70 text-sm">Recognize dedication and future vision</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-[#6C3BFF] font-bold text-lg mb-2">Preserve Legacy</h3>
              <p className="text-white/70 text-sm">Capture this powerful milestone forever</p>
            </div>
          </div>

          <p className="text-sm text-white/60 max-w-2xl mx-auto mb-8">
            ✨ Only approved graduates appear in this directory — reinforcing exclusivity, trust, and prestige
          </p>

          <Link to={createPageUrl('Home')}>
            <Button className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:from-[#FFE44D] hover:to-[#8B5CF6] text-white px-8 py-6 rounded-full">
              <Sparkles className="w-5 h-5 mr-2" />
              Order Your Cover
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Controls - Always visible */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Search & Filter
            </h3>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="ghost"
                className="text-[#FFD60A] hover:text-[#FFE44D] hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Top Row: Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  placeholder="Search by student name or school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="md:w-64">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="by-school">By School</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Row: Location and School */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Location Filter */}
              <div className="flex-1">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* School Filter */}
              <div className="flex-1">
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Schools" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    <SelectItem value="all">All Schools</SelectItem>
                    {(selectedLocation && selectedLocation !== 'all' ? locationSchools : schools).map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery.trim() && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD60A]/20 border border-[#FFD60A]/30">
                  <Search className="w-3 h-3 text-[#FFD60A]" />
                  <span className="text-white text-sm">Search: {searchQuery}</span>
                  <button onClick={() => setSearchQuery('')} className="text-white/60 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedLocation !== 'all' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20D4AB]/20 border border-[#20D4AB]/30">
                  <MapPin className="w-3 h-3 text-[#20D4AB]" />
                  <span className="text-white text-sm">{selectedLocation}</span>
                  <button onClick={() => setSelectedLocation('all')} className="text-white/60 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedSchool !== 'all' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C3BFF]/20 border border-[#6C3BFF]/30">
                  <GraduationCap className="w-3 h-3 text-[#6C3BFF]" />
                  <span className="text-white text-sm">{selectedSchool}</span>
                  <button onClick={() => setSelectedSchool('all')} className="text-white/60 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {(searchQuery || selectedSchool !== 'all' || selectedLocation !== 'all') && (
            <p className="text-white/60 text-sm mt-4">
              Showing {filteredAndSortedOrders.length} graduate{filteredAndSortedOrders.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* City Selector - appears when no location selected */}
      {(!selectedLocation || selectedLocation === 'all') && !searchQuery.trim() && selectedSchool === 'all' ? (
        <CitySelector />
      ) : null}

      {/* Back to Cities or Schools Link */}
      {(selectedLocation && selectedLocation !== 'all') || (selectedSchool && selectedSchool !== 'all') ? (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <button
            onClick={() => {
              if (selectedSchool !== 'all') {
                // Go back to schools list
                setSelectedSchool('all');
                setSearchQuery('');
              } else {
                // Go back to cities
                setSelectedLocation('all');
                setSearchQuery('');
                setSelectedSchool('all');
                window.history.pushState({}, '', createPageUrl('Directory'));
              }
            }}
            className="text-[#FFD60A] hover:text-[#FFE44D] flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {selectedSchool !== 'all' ? `Back to Schools in ${selectedLocation}` : 'Back to All Cities & Counties'}
          </button>
        </div>
      ) : null}



      {/* Show Schools List when location selected but no school selected */}
      {selectedLocation && selectedLocation !== 'all' && selectedSchool === 'all' && !searchQuery.trim() ? (
        <SchoolsList 
          schools={locationSchools} 
          location={selectedLocation}
          onSelectSchool={(school) => setSelectedSchool(school)}
        />
      ) : null}

      {/* Directory Grid */}
      {(selectedSchool !== 'all' || searchQuery.trim() || selectedLocation !== 'all') && (
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#FFD60A] animate-spin" />
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-white/40" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Results Found
            </h3>
            <p className="text-white/60 max-w-md mx-auto">
              Try adjusting your search criteria or selecting a different school
            </p>
            
            {orders.length === 0 && (
              <div className="mt-12 max-w-4xl mx-auto space-y-12">
                {/* Featured Messages */}
                <div>
                  <h4 className="text-xl font-bold text-white mb-6">Featured Messages</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <p className="text-white/80 italic">"The Class of 2026: Seen. Celebrated. Remembered."</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <p className="text-white/80 italic">"Not Just Graduates — History in the Making."</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <p className="text-white/80 italic">"Where Future Greatness Is First Published."</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <p className="text-white/80 italic">"This directory is a mirror of who they are becoming."</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <p className="text-white/80 italic">"Every cover tells a future story."</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <p className="text-white/80 italic">"These pages hold tomorrow's leaders."</p>
                    </div>
                  </div>
                </div>

                {/* Legacy Section */}
                <div className="bg-gradient-to-r from-[#FFD60A]/10 via-[#20D4AB]/10 to-[#6C3BFF]/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h4 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Class of 2026 — This is Your Moment. This is Your Legacy.
                  </h4>
                  <p className="text-white/70 mb-6">
                    Before the world knew their names… we did. This directory is not just a collection — it's a testament to potential realized, dreams acknowledged, and futures honored through personalized magazine career covers.
                  </p>
                  <Link to={createPageUrl('Home')}>
                    <Button className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:from-[#FFE44D] hover:to-[#8B5CF6] text-white px-8 py-4 rounded-full">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Order Your Career Cover
                      </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedOrders.map((order) => (
                <MagazineCoverCard key={order.id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        currentPage === i + 1
                          ? 'bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0D1020] border-t border-white/10 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div>
            <p className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Birth 2 Greatness</p>
            <p className="text-[#FFD60A] text-lg italic">"Born To Become… From Day One to Day Won."</p>
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/60 text-sm">
              © 2026 B.Visible Magazine • Birth2Greatness
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}