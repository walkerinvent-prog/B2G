import React, { useRef } from 'react';
import { GraduationCap, ChevronLeft, ChevronRight, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SchoolsList({ schools, location, onSelectSchool }) {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);

  // Fetch all schools from the School entity for this location
  const { data: allSchools = [] } = useQuery({
    queryKey: ['schools', location],
    queryFn: () => base44.entities.School.filter({ city: location }),
    enabled: !!location,
  });

  // Fetch all approved orders for this location
  const { data: orders = [] } = useQuery({
    queryKey: ['location-orders', location],
    queryFn: () => base44.entities.Order.filter({ approved_for_directory: true }),
    enabled: !!location,
  });

  // Filter orders by location
  const locationOrders = React.useMemo(() => {
    const locationQuery = location.toLowerCase();
    return orders.filter(order => {
      const schoolLocation = order.school_or_church?.toLowerCase() || '';
      const deliveryCity = order.delivery_city?.toLowerCase() || '';
      const deliveryState = order.delivery_state?.toLowerCase() || '';
      return schoolLocation.includes(locationQuery) || 
             deliveryCity.includes(locationQuery) ||
             deliveryState.includes(locationQuery);
    });
  }, [orders, location]);

  // Combine schools from orders with schools from School entity
  const combinedSchools = React.useMemo(() => {
    const schoolMap = new Map();
    
    // Add schools from School entity first (these have logos)
    allSchools.forEach(school => {
      schoolMap.set(school.name, school);
    });
    
    // Add schools from orders that might not be in School entity yet
    schools.forEach(schoolName => {
      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, { name: schoolName, city: location });
      }
    });
    
    return Array.from(schoolMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allSchools, schools, location]);

  // Search functionality
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results = [];

    // Search for students
    const studentMatches = locationOrders.filter(order =>
      order.student_name?.toLowerCase().includes(query)
    );

    // Search for schools
    const schoolMatches = combinedSchools.filter(school =>
      school.name.toLowerCase().includes(query)
    );

    studentMatches.forEach(order => {
      results.push({
        type: 'student',
        data: order
      });
    });

    schoolMatches.forEach(school => {
      results.push({
        type: 'school',
        data: school
      });
    });

    setSearchResults(results);
  }, [searchQuery]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (schools.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Schools Found</h3>
          <p className="text-white/60">No schools have graduates in this location yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="text-center mb-8">
        <h2 
          className="text-4xl md:text-5xl font-black text-white mb-4"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Schools in <span className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] bg-clip-text text-transparent">{location}</span>
        </h2>
        <p className="text-white/60 text-lg mb-6">
          Search by school or student name, or scroll to explore schools
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Search for a school or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl text-lg"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#0D1020]/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl max-h-96 overflow-y-auto z-50">
              {searchResults.map((result, index) => (
                <div key={index}>
                  {result.type === 'student' ? (
                    <Link
                      to={`${createPageUrl('GraduateDetail')}?id=${result.data.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-white/10 transition-colors border-b border-white/10"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {result.data.magazine_cover_url ? (
                          <img 
                            src={result.data.magazine_cover_url} 
                            alt={result.data.student_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold">{result.data.student_name}</p>
                        <p className="text-white/60 text-sm">{result.data.school_or_church}</p>
                      </div>
                      <div className="text-xs text-[#FFD60A] bg-[#FFD60A]/10 px-3 py-1 rounded-full">
                        Student
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        navigate(`${createPageUrl('SchoolDetail')}?school=${encodeURIComponent(result.data.name)}&location=${encodeURIComponent(location)}`);
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/10 transition-colors border-b border-white/10 text-left"
                    >
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        {result.data.logo_url ? (
                          <img 
                            src={result.data.logo_url} 
                            alt={result.data.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <GraduationCap className="w-6 h-6 text-white/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold">{result.data.name}</p>
                        <p className="text-white/60 text-sm">{result.data.city}</p>
                      </div>
                      <div className="text-xs text-[#6C3BFF] bg-[#6C3BFF]/10 px-3 py-1 rounded-full">
                        School
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative group">
        {/* Left scroll button */}
        <Button
          onClick={() => scroll('left')}
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#0D1020]/90 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Horizontal scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {combinedSchools.map((school) => {
            const schoolName = typeof school === 'string' ? school : school.name;
            const schoolLogo = typeof school === 'object' ? school.logo_url : null;
            const schoolType = typeof school === 'object' ? school.type : null;
            const schoolMascot = typeof school === 'object' ? school.mascot : null;
            const schoolColors = typeof school === 'object' ? school.colors : null;
            
            return (
              <button
                key={schoolName}
                onClick={() => navigate(`${createPageUrl('SchoolDetail')}?school=${encodeURIComponent(schoolName)}&location=${encodeURIComponent(location)}`)}
                className="flex-shrink-0 w-80 bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-[#FFD60A]/50 hover:bg-white/10 hover:scale-105 transition-all duration-300 group/card snap-center shadow-lg"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  {/* School Logo or Default Icon */}
                  {schoolLogo ? (
                    <div className="w-24 h-24 rounded-2xl bg-white p-3 flex items-center justify-center shadow-lg">
                      <img 
                        src={schoolLogo} 
                        alt={`${schoolName} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                  )}
                  
                  <div>
                    {schoolType && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-2">
                        <span className="text-xs text-white/70">{schoolType}</span>
                      </div>
                    )}
                    <h3 
                      className="text-xl font-bold text-white group-hover/card:text-[#FFD60A] transition-colors mb-2"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {schoolName}
                    </h3>
                    {schoolMascot && (
                      <p className="text-[#FFD60A] text-sm font-medium mb-1">🏆 {schoolMascot}</p>
                    )}
                    {schoolColors && (
                      <p className="text-white/50 text-xs mb-2">Colors: {schoolColors}</p>
                    )}
                    <p className="text-white/60 text-sm">Click to view graduates →</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right scroll button */}
        <Button
          onClick={() => scroll('right')}
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#0D1020]/90 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}