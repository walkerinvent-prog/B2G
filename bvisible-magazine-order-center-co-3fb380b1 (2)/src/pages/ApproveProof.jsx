import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ApproveProof() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const orderId = urlParams.get('orderId');

  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['order', orderId, token],
    queryFn: () => base44.entities.Order.filter({ order_id: orderId, approval_token: token }),
    enabled: !!orderId && !!token
  });

  const order = orders?.[0];

  const handleApprove = async () => {
    try {
      await base44.entities.Order.update(order.id, {
        proof_status: 'approved'
      });

      await base44.integrations.Core.SendEmail({
        to: 'bvisiblewalk@aol.com',
        subject: `✅ Proof Approved - ${order.student_name}`,
        body: `
Order: ${order.order_id}
Student: ${order.student_name}

The customer has approved the magazine cover proof!

Ready to proceed with printing.
        `
      });

      setSubmitted(true);
      toast.success('Proof approved! We will proceed with printing.');
    } catch (error) {
      toast.error('Failed to approve proof');
    }
  };

  const handleRequestChanges = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback on what changes you\'d like');
      return;
    }

    try {
      await base44.entities.Order.update(order.id, {
        proof_status: 'changes_requested'
      });

      await base44.integrations.Core.SendEmail({
        to: 'bvisiblewalk@aol.com',
        subject: `📝 Changes Requested - ${order.student_name}`,
        body: `
Order: ${order.order_id}
Student: ${order.student_name}
Customer: ${order.parent_name} (${order.parent_email})

FEEDBACK:
${feedback}

Please review and make the requested changes.
        `
      });

      setSubmitted(true);
      toast.success('Your feedback has been sent! We\'ll make the changes and send you a new proof.');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] flex items-center justify-center">
        <p className="text-white">Loading proof...</p>
      </div>
    );
  }

  if (!order || order.approval_token !== token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] flex items-center justify-center p-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
            <p className="text-white/60">This approval link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] flex items-center justify-center p-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-white/60">Your response has been received. We'll be in touch soon!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-4">Review Your Magazine Cover</h1>
          <p className="text-white/60 text-lg">For: {order.student_name}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Proof Image */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Your Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={order.proof_url}
                alt="Magazine Cover Proof"
                className="w-full rounded-lg shadow-2xl"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">What do you think?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleApprove}
                  className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Looks Perfect - Approve!
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-white/60">or</span>
                  </div>
                </div>

                <div>
                  <label className="text-white mb-2 block font-medium">Request Changes</label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please describe what changes you'd like..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-32"
                  />
                  <Button
                    onClick={handleRequestChanges}
                    variant="outline"
                    className="w-full mt-3 border-white/20 text-white hover:bg-white/10 h-12"
                  >
                    Submit Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="text-white/70 text-sm space-y-1">
                <p><strong>Order ID:</strong> {order.order_id}</p>
                <p><strong>Student:</strong> {order.student_name}</p>
                <p><strong>School:</strong> {order.school_or_church}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}