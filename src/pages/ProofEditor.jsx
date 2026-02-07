import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Eye, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProofEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  const [textStyles, setTextStyles] = useState({
    school_name: { fontSize: 120, color: '#FF0000', y: 3900 },
    student_name: { fontSize: 140, color: '#FFFFFF', y: 4080 },
    headline: { fontSize: 100, color: '#FFFFFF', y: 4230 },
    headline_completion: { fontSize: 110, color: '#FFD700', y: 4350 }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data: orders } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => base44.entities.Order.filter({ order_id: orderId }),
    enabled: !!orderId
  });

  const order = orders?.[0];

  useEffect(() => {
    if (order?.text_styles) {
      // Merge saved styles with defaults to ensure all fields exist
      setTextStyles({
        school_name: { fontSize: 120, color: '#FF0000', y: 3900, ...order.text_styles.school_name },
        student_name: { fontSize: 140, color: '#FFFFFF', y: 4080, ...order.text_styles.student_name },
        headline: { fontSize: 100, color: '#FFFFFF', y: 4230, ...order.text_styles.headline },
        headline_completion: { fontSize: 110, color: '#FFD700', y: 4350, ...order.text_styles.headline_completion }
      });
    }
  }, [order]);

  const handleGenerateProof = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateProof', {
        order_id: orderId,
        text_styles: textStyles
      });

      if (response.data.success) {
        toast.success('Proof generated successfully!');
        // Force refetch the order to show the new proof
        await queryClient.invalidateQueries(['order', orderId]);
        await queryClient.refetchQueries(['order', orderId]);
      }
    } catch (error) {
      toast.error('Failed to generate proof: ' + (error.message || 'Unknown error'));
      console.error('Generation error:', error);
    }
    setIsGenerating(false);
  };

  const handleSendProof = async () => {
    if (!order?.proof_url) {
      toast.error('Please generate a proof first');
      return;
    }

    setIsSending(true);
    try {
      const approvalToken = Math.random().toString(36).substring(2, 15);
      const approvalLink = `${window.location.origin}/ApproveProof?token=${approvalToken}&orderId=${orderId}`;

      await base44.entities.Order.update(order.id, {
        proof_status: 'sent',
        proof_sent_date: new Date().toISOString(),
        approval_token: approvalToken
      });

      await base44.integrations.Core.SendEmail({
        from_name: 'B.Visible Magazine',
        to: order.parent_email,
        subject: `🎨 Your Magazine Cover Proof is Ready - ${order.student_name}`,
        body: `
Dear ${order.parent_name},

Great news! Your B.Visible Magazine cover proof for ${order.student_name} is ready for your review!

📸 VIEW YOUR PROOF:
${approvalLink}

Please review the proof carefully and let us know if:
✅ Everything looks perfect - Approve it!
📝 You'd like any changes - Request modifications

Once approved, we'll proceed with printing and delivery.

Thank you!
B.Visible Magazine Team
        `
      });

      toast.success('Proof sent to customer!');
      navigate('/AdminOrders');
    } catch (error) {
      toast.error('Failed to send proof');
    }
    setIsSending(false);
  };

  const updateStyle = (field, key, value) => {
    setTextStyles(prev => ({
      ...prev,
      [field]: { ...prev[field], [key]: value }
    }));
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] flex items-center justify-center">
        <p className="text-white">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1020] via-[#1a1535] to-[#0D1020] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/AdminOrders')}
          className="text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="text-white/80 space-y-2">
                <p><strong>Student:</strong> {order.student_name}</p>
                <p><strong>School:</strong> {order.school_or_church}</p>
                <p><strong>Headline:</strong> {order.headline_choice}</p>
                <p><strong>Completion:</strong> {order.headline_completion}</p>
              </CardContent>
            </Card>

            {/* School Name Styles */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">School Name</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white mb-2">Font Size: {textStyles.school_name.fontSize}px</Label>
                  <Slider
                    value={[textStyles.school_name.fontSize]}
                    onValueChange={([val]) => updateStyle('school_name', 'fontSize', val)}
                    min={60}
                    max={200}
                    step={5}
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Color</Label>
                  <Input
                    type="color"
                    value={textStyles.school_name.color}
                    onChange={(e) => updateStyle('school_name', 'color', e.target.value)}
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Student Name Styles */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Student Name</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white mb-2">Font Size: {textStyles.student_name.fontSize}px</Label>
                  <Slider
                    value={[textStyles.student_name.fontSize]}
                    onValueChange={([val]) => updateStyle('student_name', 'fontSize', val)}
                    min={80}
                    max={220}
                    step={5}
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Color</Label>
                  <Input
                    type="color"
                    value={textStyles.student_name.color}
                    onChange={(e) => updateStyle('student_name', 'color', e.target.value)}
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Headline Styles */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Headline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white mb-2">Font Size: {textStyles.headline.fontSize}px</Label>
                  <Slider
                    value={[textStyles.headline.fontSize]}
                    onValueChange={([val]) => updateStyle('headline', 'fontSize', val)}
                    min={60}
                    max={180}
                    step={5}
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Color</Label>
                  <Input
                    type="color"
                    value={textStyles.headline.color}
                    onChange={(e) => updateStyle('headline', 'color', e.target.value)}
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Headline Completion Styles */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Career/Goal Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white mb-2">Font Size: {textStyles.headline_completion.fontSize}px</Label>
                  <Slider
                    value={[textStyles.headline_completion.fontSize]}
                    onValueChange={([val]) => updateStyle('headline_completion', 'fontSize', val)}
                    min={60}
                    max={200}
                    step={5}
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Color</Label>
                  <Input
                    type="color"
                    value={textStyles.headline_completion.color}
                    onChange={(e) => updateStyle('headline_completion', 'color', e.target.value)}
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleGenerateProof}
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:opacity-90"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Proof'}
              </Button>
              <Button
                onClick={handleSendProof}
                disabled={isSending || !order.proof_url}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : 'Send to Customer'}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-20 h-fit">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {order.proof_url ? (
                  <img
                    src={order.proof_url}
                    alt="Magazine Cover Proof"
                    className="w-full rounded-lg shadow-2xl"
                  />
                ) : (
                  <div className="aspect-[11/15] bg-white/10 rounded-lg flex items-center justify-center">
                    <p className="text-white/60">Click "Generate Proof" to preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}