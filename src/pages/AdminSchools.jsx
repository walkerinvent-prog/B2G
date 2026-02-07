import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Search, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSchools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSchool, setEditingSchool] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: () => base44.entities.School.list('-created_date'),
  });

  const createSchoolMutation = useMutation({
    mutationFn: (schoolData) => base44.entities.School.create(schoolData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      setEditingSchool(null);
      toast.success('School added successfully');
    },
  });

  const updateSchoolMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.School.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      setEditingSchool(null);
      toast.success('School updated successfully');
    },
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: (id) => base44.entities.School.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast.success('School deleted successfully');
    },
  });

  const handleSearchSchoolInfo = async () => {
    if (!editingSchool?.name || !editingSchool?.city) {
      toast.error('Please enter school name and city first');
      return;
    }

    setIsSearching(true);
    try {
      const response = await base44.functions.invoke('searchSchoolInfo', {
        school_name: editingSchool.name,
        city: editingSchool.city
      });

      if (response.data.success) {
        setEditingSchool({
          ...editingSchool,
          ...response.data.data
        });
        toast.success('School information found!');
      } else {
        toast.error('Could not find school information');
      }
    } catch (error) {
      toast.error('Error searching for school info');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSchool.id) {
      updateSchoolMutation.mutate({ id: editingSchool.id, data: editingSchool });
    } else {
      createSchoolMutation.mutate(editingSchool);
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Manage Schools
          </h1>
          <p className="text-white/60">Add and manage school listings with logos</p>
        </div>

        {/* Add/Edit School Form */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              {editingSchool?.id ? 'Edit School' : 'Add New School'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">School Name *</Label>
                  <Input
                    value={editingSchool?.name || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">City/County *</Label>
                  <Input
                    value={editingSchool?.city || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, city: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSearchSchoolInfo}
                disabled={isSearching || !editingSchool?.name || !editingSchool?.city}
                className="w-full bg-gradient-to-r from-[#20D4AB] to-[#6C3BFF]"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Auto-Find School Info & Logo
                  </>
                )}
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">School Type</Label>
                  <Select
                    value={editingSchool?.type || ''}
                    onValueChange={(value) => setEditingSchool({ ...editingSchool, type: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Charter">Charter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Mascot</Label>
                  <Input
                    value={editingSchool?.mascot || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, mascot: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">School Colors</Label>
                  <Input
                    value={editingSchool?.colors || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, colors: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="e.g., Blue and Gold"
                  />
                </div>
                <div>
                  <Label className="text-white">Website</Label>
                  <Input
                    value={editingSchool?.website || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, website: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Logo URL</Label>
                <Input
                  value={editingSchool?.logo_url || ''}
                  onChange={(e) => setEditingSchool({ ...editingSchool, logo_url: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="https://"
                />
                {editingSchool?.logo_url && (
                  <img src={editingSchool.logo_url} alt="Logo preview" className="mt-2 h-20 object-contain bg-white p-2 rounded" />
                )}
              </div>

              <div>
                <Label className="text-white">School Photo URL</Label>
                <Input
                  value={editingSchool?.photo_url || ''}
                  onChange={(e) => setEditingSchool({ ...editingSchool, photo_url: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="https://"
                />
                {editingSchool?.photo_url && (
                  <img src={editingSchool.photo_url} alt="Photo preview" className="mt-2 h-32 object-cover rounded" />
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF]">
                  {editingSchool?.id ? 'Update School' : 'Add School'}
                </Button>
                {editingSchool && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSchool(null)}
                    className="border-white/20 text-white"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Schools List */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Schools ({schools.length})</CardTitle>
              <Button
                onClick={() => setEditingSchool({ name: '', city: '' })}
                className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add School
              </Button>
            </div>
            <Input
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border-white/20 text-white mt-4"
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-[#FFD60A] animate-spin mx-auto" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    {school.logo_url ? (
                      <img src={school.logo_url} alt={school.name} className="w-16 h-16 object-contain bg-white rounded p-2" />
                    ) : (
                      <div className="w-16 h-16 rounded bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{school.name}</h3>
                      <p className="text-white/60 text-sm">{school.city} • {school.type || 'Type not set'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSchool(school)}
                        className="border-white/20 text-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Delete this school?')) {
                            deleteSchoolMutation.mutate(school.id);
                          }
                        }}
                        className="border-white/20 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}