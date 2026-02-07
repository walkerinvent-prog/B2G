import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Plus,
  Trash2,
  Edit,
  Star,
  Upload,
  Loader2,
  X,
  MessageSquareQuote
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminTestimonials() {
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['all-testimonials'],
    queryFn: () => base44.entities.Testimonial.list('order_number', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Testimonial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-testimonials'] });
      toast.success('Testimonial created');
      setShowDialog(false);
      setEditingTestimonial(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-testimonials'] });
      toast.success('Testimonial updated');
      setShowDialog(false);
      setEditingTestimonial(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Testimonial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-testimonials'] });
      toast.success('Testimonial deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      role: formData.get('role'),
      content: formData.get('content'),
      photo_url: editingTestimonial?.photo_url || '',
      rating: parseInt(formData.get('rating') || '5'),
      is_featured: formData.get('is_featured') === 'on',
      order_number: parseInt(formData.get('order_number') || '0'),
    };

    if (editingTestimonial?.id) {
      updateMutation.mutate({ id: editingTestimonial.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditingTestimonial(prev => ({ ...prev, photo_url: file_url }));
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openNewDialog = () => {
    setEditingTestimonial({
      name: '',
      role: '',
      content: '',
      photo_url: '',
      rating: 5,
      is_featured: true,
      order_number: 0
    });
    setShowDialog(true);
  };

  const openEditDialog = (testimonial) => {
    setEditingTestimonial(testimonial);
    setShowDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 
              className="text-4xl md:text-5xl font-black text-white mb-2"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <span className="bg-gradient-to-r from-[#FFD60A] via-[#20D4AB] to-[#6C3BFF] bg-clip-text text-transparent">
                Testimonials
              </span>
            </h1>
            <p className="text-white/60">Manage customer testimonials and reviews</p>
          </div>
          <Button
            onClick={openNewDialog}
            className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:opacity-90 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total</p>
                  <p className="text-white text-3xl font-bold">{testimonials.length}</p>
                </div>
                <MessageSquareQuote className="w-10 h-10 text-[#FFD60A]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Featured</p>
                  <p className="text-white text-3xl font-bold">
                    {testimonials.filter(t => t.is_featured).length}
                  </p>
                </div>
                <Star className="w-10 h-10 text-[#20D4AB]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Avg Rating</p>
                  <p className="text-white text-3xl font-bold">
                    {testimonials.length > 0 
                      ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length).toFixed(1)
                      : '5.0'
                    }
                  </p>
                </div>
                <Star className="w-10 h-10 text-[#6C3BFF] fill-[#6C3BFF]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#FFD60A] animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquareQuote className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No testimonials yet. Add your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
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
                            <p className="text-white font-semibold">{testimonial.name}</p>
                            {testimonial.role && (
                              <p className="text-white/50 text-sm">{testimonial.role}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#FFD60A] text-[#FFD60A]" />
                          ))}
                        </div>
                      </div>

                      <p className="text-white/70 text-sm">"{testimonial.content}"</p>

                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <span>Order: {testimonial.order_number}</span>
                        {testimonial.is_featured && (
                          <span className="px-2 py-1 rounded bg-[#20D4AB]/20 text-[#20D4AB]">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <Button
                        onClick={() => openEditDialog(testimonial)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteMutation.mutate(testimonial.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gradient-to-br from-[#0D1020] to-[#1a1535] border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingTestimonial?.id ? 'Edit' : 'Add'} Testimonial
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <Label className="text-white mb-3 block">Photo (Optional)</Label>
              {editingTestimonial?.photo_url ? (
                <div className="relative inline-block">
                  <img 
                    src={editingTestimonial.photo_url} 
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#FFD60A]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingTestimonial(prev => ({ ...prev, photo_url: '' }))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center hover:border-[#FFD60A] transition-colors w-32">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-white/40 mb-2" />
                        <p className="text-white/60 text-xs">Upload</p>
                      </>
                    )}
                  </div>
                </label>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2 block">Name *</Label>
                <Input
                  name="name"
                  defaultValue={editingTestimonial?.name}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Role/Title</Label>
                <Input
                  name="role"
                  defaultValue={editingTestimonial?.role}
                  placeholder="e.g., Parent, Graduate"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Testimonial *</Label>
              <Textarea
                name="content"
                defaultValue={editingTestimonial?.content}
                required
                rows={4}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2 block">Rating</Label>
                <Input
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={editingTestimonial?.rating || 5}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Display Order</Label>
                <Input
                  name="order_number"
                  type="number"
                  defaultValue={editingTestimonial?.order_number || 0}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
              <Switch
                name="is_featured"
                defaultChecked={editingTestimonial?.is_featured}
              />
              <div>
                <Label className="text-white font-semibold">Featured on Homepage</Label>
                <p className="text-white/60 text-xs">Show this testimonial on the main page</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:opacity-90"
              >
                {editingTestimonial?.id ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}