import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Search, 
  Eye, 
  Calendar,
  User,
  GraduationCap,
  Mail,
  Phone,
  DollarSign,
  Package,
  ExternalLink,
  Upload,
  Send,
  Image,
  MapPin,
  Copy,
  ArrowUpDown,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminNotifications from '../components/AdminNotifications';
import OrderAnalytics from '../components/admin/OrderAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(null);
  const [sendingProof, setSendingProof] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 1000),
  });

  // Real-time order updates
  React.useEffect(() => {
    const unsubscribe = base44.entities.Order.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      
      // Show notification for new orders
      if (event.type === 'create') {
        toast.success(`New order received: ${event.data.order_id}`, {
          description: `${event.data.student_name} - $${event.data.total_amount}`,
          duration: 10000,
        });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const approveOrderMutation = useMutation({
    mutationFn: async (order) => {
      const updateData = { 
        approved_for_directory: true,
        proof_status: 'approved'
      };
      // If proof exists, set it as the magazine cover
      if (order.proof_url) {
        updateData.magazine_cover_url = order.proof_url;
      }
      return base44.entities.Order.update(order.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast.success('Order approved for directory');
      setSelectedOrder(null);
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: (orderId) => base44.entities.Order.update(orderId, { approved_for_directory: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast.success('Order removed from directory');
      setSelectedOrder(null);
    },
  });

  const deleteCoverMutation = useMutation({
    mutationFn: (orderId) => base44.entities.Order.update(orderId, { 
      proof_url: null,
      magazine_cover_url: null,
      proof_status: 'not_sent',
      proof_sent_date: null,
      approval_token: null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast.success('Magazine cover deleted');
      setSelectedOrder(null);
    },
  });

  const handleProofUpload = async (orderId, file) => {
    setUploadingProof(orderId);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Order.update(orderId, { 
        proof_url: file_url,
        proof_status: 'not_sent'
      });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast.success('Proof uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload proof');
    } finally {
      setUploadingProof(null);
    }
  };

  const handleSendProof = async (order) => {
    setSendingProof(order.id);
    try {
      if (!order.parent_email) {
        toast.error('No parent email found for this order');
        setSendingProof(null);
        return;
      }

      if (!order.proof_url) {
        toast.error('No proof uploaded yet');
        setSendingProof(null);
        return;
      }

      // Generate approval token
      const approvalToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const approvalLink = `${window.location.origin}/ApproveProof?order=${order.order_id}&token=${approvalToken}`;
      const changesLink = `mailto:bvisiblewalk@aol.com?subject=Magazine Cover Changes - ${order.order_id}&body=Order ID: ${order.order_id}%0D%0AStudent: ${order.student_name}%0D%0A%0D%0ARequested Changes:%0D%0A`;

      console.log('Sending proof email to:', order.parent_email);

      // Send email to customer
      await base44.integrations.Core.SendEmail({
        to: order.parent_email,
        subject: `Magazine Cover Proof Ready - ${order.student_name}`,
        body: `
  Dear ${order.parent_name},

  Great news! Your magazine cover proof for ${order.student_name} is ready for review.

  View Proof: ${order.proof_url}

  Please review the proof carefully and let us know your decision:

  ✅ APPROVE PROOF: ${approvalLink}
  Click this link to approve your proof and it will be added to the VIP Directory.

  ✏️ REQUEST CHANGES: ${changesLink}
  Click this link to send us specific feedback about any changes you'd like.

  Important: Once approved, your magazine cover will be published in the VIP Graduates Directory organized by school and city.

  If you have any questions, simply reply to this email.

  Thank you!
  The B.Visible Magazine Team
    `
      });

      console.log('Email sent successfully, updating order...');

      // Update order
      await base44.entities.Order.update(order.id, {
        proof_status: 'sent',
        proof_sent_date: new Date().toISOString(),
        approval_token: approvalToken
      });

      console.log('Order updated successfully');

      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast.success(`Proof sent successfully to ${order.parent_email}`);
    } catch (error) {
      console.error('Failed to send proof:', error);
      toast.error(`Failed to send proof: ${error.message || 'Unknown error'}`);
    } finally {
      setSendingProof(null);
    }
  };

  const filteredAndSortedOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_id?.toLowerCase().includes(query) ||
      order.student_name?.toLowerCase().includes(query) ||
      order.parent_email?.toLowerCase().includes(query) ||
      order.school_or_church?.toLowerCase().includes(query) ||
      order.delivery_city?.toLowerCase().includes(query) ||
      order.homeschool_location?.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (sortBy === 'city') {
      const cityA = (a.delivery_city || a.homeschool_location || '').toLowerCase();
      const cityB = (b.delivery_city || b.homeschool_location || '').toLowerCase();
      return cityA.localeCompare(cityB);
    }
    if (sortBy === 'school') {
      const schoolA = (a.school_or_church || '').toLowerCase();
      const schoolB = (b.school_or_church || '').toLowerCase();
      return schoolA.localeCompare(schoolB);
    }
    // Default: sort by recent (created_date descending)
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const getStatusColor = (status) => {
    if (status === 'completed' || status === 'paid') return 'bg-green-500/20 text-green-400';
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getProofStatusBadge = (proofStatus) => {
    if (proofStatus === 'approved') return { label: '✓ Proof Approved', color: 'bg-green-500/20 text-green-400' };
    if (proofStatus === 'sent') return { label: 'Proof Sent', color: 'bg-blue-500/20 text-blue-400' };
    if (proofStatus === 'changes_requested') return { label: 'Changes Requested', color: 'bg-orange-500/20 text-orange-400' };
    return { label: 'No Proof', color: 'bg-gray-500/20 text-gray-400' };
  };

  const copyDeliveryAddress = (order) => {
    const address = `${order.delivery_address}, ${order.delivery_city}, ${order.delivery_state} ${order.delivery_zip}`;
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <span className="bg-gradient-to-r from-[#FFD60A] via-[#20D4AB] to-[#6C3BFF] bg-clip-text text-transparent">
                Order Management
              </span>
            </h1>
            <p className="text-white/60 text-lg">Review and approve graduate orders</p>
          </div>
          <AdminNotifications />
        </div>

        {/* Tabs for Orders vs Analytics */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#FFD60A] data-[state=active]:text-black">
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#6C3BFF] data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Search by order ID, student name, email, school, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-14 rounded-xl md:w-64">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="city">Sort by City</SelectItem>
              <SelectItem value="school">Sort by School</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats - moved inside tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Orders</p>
                  <p className="text-white text-3xl font-bold">{orders.length}</p>
                </div>
                <Package className="w-10 h-10 text-[#FFD60A]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Approved</p>
                  <p className="text-white text-3xl font-bold">
                    {orders.filter(o => o.approved_for_directory).length}
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-[#20D4AB]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Pending</p>
                  <p className="text-white text-3xl font-bold">
                    {orders.filter(o => !o.approved_for_directory).length}
                  </p>
                </div>
                <Loader2 className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <p className="text-white text-3xl font-bold">
                    ${orders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toFixed(0)}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-[#6C3BFF]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#FFD60A] animate-spin" />
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedOrders.map((order) => (
              <Card 
                key={order.id} 
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[#FFD60A] font-mono font-bold">
                          {order.order_id}
                        </span>
                        <Badge className={getStatusColor(order.payment_status)}>
                          {order.payment_status || 'pending'}
                        </Badge>
                        {order.approved_for_directory && (
                          <Badge className="bg-green-500/20 text-green-400">
                            ✓ In Directory
                          </Badge>
                        )}
                        <Badge className={getProofStatusBadge(order.proof_status).color}>
                          {getProofStatusBadge(order.proof_status).label}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <GraduationCap className="w-4 h-4 text-white/40" />
                          {order.student_name}
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <User className="w-4 h-4 text-white/40" />
                          {order.school_or_church || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <Mail className="w-4 h-4 text-white/40" />
                          {order.parent_email}
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <Calendar className="w-4 h-4 text-white/40" />
                          {new Date(order.created_date).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#20D4AB]" />
                        <span className="text-[#20D4AB] font-bold">
                          ${(order.total_amount || 0).toFixed(2)}
                        </span>
                        <span className="text-white/40 text-sm">
                          via {order.payment_method === 'cashapp' ? 'Cash App' : 'PayPal'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>

                      <Button
                        onClick={() => window.location.href = `/ProofEditor?orderId=${order.order_id}`}
                        className="bg-[#6C3BFF] hover:bg-[#6C3BFF]/90 text-white"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Edit Proof
                      </Button>

                      {order.proof_url && order.proof_status !== 'approved' && (
                        <Button
                          onClick={() => handleSendProof(order)}
                          disabled={sendingProof === order.id}
                          className="bg-[#FFD60A] text-black hover:bg-[#FFD60A]/90"
                        >
                          {sendingProof === order.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {order.proof_status === 'sent' ? 'Resend' : 'Send'} Proof
                        </Button>
                      )}

                      {!order.approved_for_directory ? (
                        <Button
                          onClick={() => approveOrderMutation.mutate(order)}
                          disabled={approveOrderMutation.isPending}
                          className="bg-gradient-to-r from-[#20D4AB] to-[#6C3BFF] hover:from-[#20D4AB]/90 hover:to-[#6C3BFF]/90"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      ) : (
                        <Button
                          onClick={() => rejectOrderMutation.mutate(order.id)}
                          disabled={rejectOrderMutation.isPending}
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                      
                      {order.proof_url && (
                        <Button
                          onClick={() => {
                            if (confirm(`Delete magazine cover for ${order.student_name}?`)) {
                              deleteCoverMutation.mutate(order.id);
                            }
                          }}
                          disabled={deleteCoverMutation.isPending}
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Cover
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <OrderAnalytics orders={orders} />
          </TabsContent>
        </Tabs>

        {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-gradient-to-br from-[#0D1020] to-[#1a1535] border-[#FFD60A]/30 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Order Details
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order ID and Status */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Order ID</span>
                  <span className="text-[#FFD60A] font-mono font-bold">{selectedOrder.order_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Payment Status</span>
                  <Badge className={getStatusColor(selectedOrder.payment_status)}>
                    {selectedOrder.payment_status || 'pending'}
                  </Badge>
                </div>
              </div>

              {/* Student Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Student Information</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Name:</span>
                      <p className="text-white font-medium">{selectedOrder.student_name}</p>
                    </div>
                    <div>
                      <span className="text-white/60">School:</span>
                      <p className="text-white font-medium">{selectedOrder.school_or_church || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Colors:</span>
                      <p className="text-white font-medium">{selectedOrder.school_colors}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Birthday:</span>
                      <p className="text-white font-medium">{selectedOrder.birthday_month || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Mascot:</span>
                      <p className="text-white font-medium">{selectedOrder.school_mascot || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Future Career:</span>
                      <p className="text-white font-medium">{selectedOrder.future_career || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedOrder.hobbies && (
                    <div>
                      <span className="text-white/60 text-sm">Hobbies:</span>
                      <p className="text-white">{selectedOrder.hobbies}</p>
                    </div>
                  )}
                  {selectedOrder.cash_app_tag && (
                    <div>
                      <span className="text-white/60 text-sm">Cash App Tag:</span>
                      <p className="text-[#20D4AB] font-medium">{selectedOrder.cash_app_tag}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Parent/Guardian</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Name:</span>
                    <p className="text-white font-medium">{selectedOrder.parent_name}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Email:</span>
                    <p className="text-white font-medium">{selectedOrder.parent_email}</p>
                  </div>
                  {selectedOrder.parent_phone && (
                    <div>
                      <span className="text-white/60">Phone:</span>
                      <p className="text-white font-medium">{selectedOrder.parent_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              {(selectedOrder.delivery_address || selectedOrder.payment_method === 'cashapp') && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Delivery Address</h3>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    {selectedOrder.delivery_address ? (
                      <>
                        <div className="flex items-start gap-3 mb-3">
                          <MapPin className="w-5 h-5 text-[#20D4AB] mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-white font-medium">{selectedOrder.delivery_address}</p>
                            <p className="text-white font-medium">
                              {selectedOrder.delivery_city}, {selectedOrder.delivery_state} {selectedOrder.delivery_zip}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => copyDeliveryAddress(selectedOrder)}
                          variant="outline"
                          size="sm"
                          className="w-full border-white/20 text-white hover:bg-white/10"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Address
                        </Button>
                      </>
                    ) : (
                      <p className="text-white/60 text-sm">No delivery address provided</p>
                    )}
                  </div>
                </div>
              )}

              {/* Photos */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Photos</h3>
                <div className="space-y-4">
                  {selectedOrder.main_photo_url && (
                    <div>
                      <p className="text-white/60 text-sm mb-2">Main Cover Photo</p>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <img 
                          src={selectedOrder.main_photo_url} 
                          alt="Main Cover" 
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                        <a 
                          href={selectedOrder.main_photo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#FFD60A] hover:underline text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Full Size
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedOrder.vip_photos?.length > 0 && (
                    <div>
                      <p className="text-white/60 text-sm mb-2">VIP Photos ({selectedOrder.vip_photos.length})</p>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedOrder.vip_photos.map((url, i) => (
                          <div key={i} className="bg-white/5 rounded-xl p-2 border border-white/10">
                            <img 
                              src={url} 
                              alt={`VIP Photo ${i + 1}`} 
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[#FFD60A] hover:underline text-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              VIP Photo {i + 1}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof Management */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Magazine Cover Proof</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-4">
                  {selectedOrder.proof_url ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image className="w-5 h-5 text-[#20D4AB]" />
                          <span className="text-white/80">Proof Uploaded</span>
                        </div>
                        <Badge className={getProofStatusBadge(selectedOrder.proof_status).color}>
                          {getProofStatusBadge(selectedOrder.proof_status).label}
                        </Badge>
                      </div>
                      <a 
                        href={selectedOrder.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FFD60A] hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Proof
                      </a>
                      {selectedOrder.proof_sent_date && (
                        <p className="text-white/60 text-sm">
                          Sent: {new Date(selectedOrder.proof_sent_date).toLocaleString()}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => e.target.files[0] && handleProofUpload(selectedOrder.id, e.target.files[0])}
                            className="hidden"
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            className="w-full border-white/20 text-white hover:bg-white/10"
                            disabled={uploadingProof === selectedOrder.id}
                            onClick={(e) => e.currentTarget.parentElement.querySelector('input').click()}
                          >
                            {uploadingProof === selectedOrder.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Replace Proof
                              </>
                            )}
                          </Button>
                        </label>
                        {selectedOrder.proof_status !== 'approved' && (
                          <Button
                            onClick={() => handleSendProof(selectedOrder)}
                            disabled={sendingProof === selectedOrder.id}
                            className="flex-1 bg-[#FFD60A] text-black hover:bg-[#FFD60A]/90"
                          >
                            {sendingProof === selectedOrder.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                {selectedOrder.proof_status === 'sent' ? 'Resend to Customer' : 'Send to Customer'}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <label className="block">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => e.target.files[0] && handleProofUpload(selectedOrder.id, e.target.files[0])}
                        className="hidden"
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-2 border-white/20 text-white hover:bg-white/10 h-20"
                        disabled={uploadingProof === selectedOrder.id}
                        onClick={(e) => e.currentTarget.parentElement.querySelector('input').click()}
                      >
                        {uploadingProof === selectedOrder.id ? (
                          <>
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                            Uploading Proof...
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 mr-2" />
                            Upload Magazine Cover Proof
                          </>
                        )}
                      </Button>
                    </label>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Order Details</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">VIP Song Package:</span>
                    <span className="text-white">{selectedOrder.vip_song_addon ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Extra Copies:</span>
                    <span className="text-white">{selectedOrder.extra_copy ? `${selectedOrder.extra_copy_quantity}x` : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Cash App Tag on Cover:</span>
                    <span className="text-white">{selectedOrder.cash_app_tag_on_cover ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-semibold">Total Amount:</span>
                    <span className="text-[#20D4AB] font-bold text-lg">${(selectedOrder.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {!selectedOrder.approved_for_directory ? (
                  <Button
                    onClick={() => approveOrderMutation.mutate(selectedOrder)}
                    disabled={approveOrderMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-[#20D4AB] to-[#6C3BFF] hover:from-[#20D4AB]/90 hover:to-[#6C3BFF]/90"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Approve for Directory
                  </Button>
                ) : (
                  <Button
                    onClick={() => rejectOrderMutation.mutate(selectedOrder.id)}
                    disabled={rejectOrderMutation.isPending}
                    variant="outline"
                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Remove from Directory
                  </Button>
                )}
                
                {selectedOrder.proof_url && (
                  <Button
                    onClick={() => {
                      if (confirm(`Delete magazine cover for ${selectedOrder.student_name}?`)) {
                        deleteCoverMutation.mutate(selectedOrder.id);
                      }
                    }}
                    disabled={deleteCoverMutation.isPending}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Cover
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}