import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the B.Visible support assistant. I can help you with:\n\n• Order status & tracking\n• Add-on options (Honor Roll seals, extra copies, VIP songs)\n• Shipping & delivery details\n• Payment questions\n• Premium vs Self-Generated covers\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getOrderContext = async (userMessage) => {
    // Check if message contains an order ID pattern
    const orderIdMatch = userMessage.match(/BV2026-[A-Z0-9-]+/i);
    if (orderIdMatch) {
      try {
        const orderId = orderIdMatch[0].toUpperCase();
        const orders = await base44.entities.Order.filter({ order_id: orderId });
        if (orders && orders.length > 0) {
          const order = orders[0];
          return `
ORDER FOUND:
Order ID: ${order.order_id}
Student: ${order.student_name}
Type: ${order.is_promo_order ? 'Self-Generated ($4.95)' : 'Premium ($29.95)'}
Payment Status: ${order.payment_status}
Proof Status: ${order.proof_status || 'not_sent'}
Approved for Directory: ${order.approved_for_directory ? 'Yes' : 'Pending'}
School: ${order.school_or_church || 'N/A'}
Created: ${new Date(order.created_date).toLocaleDateString()}
${order.proof_url ? `Proof URL: ${order.proof_url}` : 'Proof not yet generated'}
`;
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    }
    return '';
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get order context if order ID is mentioned
      const orderContext = await getOrderContext(userMessage);

      // Build conversation history
      const conversationHistory = messages.map(m => 
        `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`
      ).join('\n\n');

      const prompt = `You are a helpful customer support assistant for B.Visible Magazine, a company that creates personalized magazine covers for 2026 graduates.

BUSINESS CONTEXT:
- We offer TWO types of magazine covers:
  1. Self-Generated (regular $9.95, now $4.95 with promo code): AI-designed, auto-generated, placed in Tennessee Directory, shareable link provided
  2. Premium ($29.95): Professional graphic design by B2G staff, custom effects (brighter days, sun, clouds), proof sent for approval, Honor Roll/Principal seals available, 11"x15" printed poster mailed via USPS, VIP personalized song option

- Add-ons: VIP Graduate Song Package, Extra Copies ($14.95 each), Cash App Tag on Cover (FREE)
- All orders featured in Tennessee Directory Of Graduates (available May 2026)
- Premium orders: 7-10 business days for proof creation, customer approval required, then 5-7 days printing, 3-5 days shipping
- Self-generated orders: Instant creation, auto-approved, no physical poster

SHIPPING & DELIVERY:
- Premium orders: Physical 11"x15" poster mailed via USPS (included in $29.95)
- Self-generated orders: Digital only, no physical product
- Estimated total time for premium: 3-4 weeks from order to delivery

PAYMENT:
- Secure payment via Stripe (credit/debit cards)
- Promo code GIFT2GRAD2026 available for self-generated orders
- Add-ons invoiced separately in 14 days

${orderContext ? `CURRENT ORDER INFORMATION:\n${orderContext}` : ''}

CONVERSATION HISTORY:
${conversationHistory}

CUSTOMER QUESTION: ${userMessage}

INSTRUCTIONS:
- Be friendly, helpful, and concise
- If order information is provided above, use it to answer status questions
- For complex technical issues or refund requests, say: "I'll escalate this to our support team at bvisiblewalk@aol.com. They'll reach out within 24 hours."
- Don't make up information - if you don't know, be honest
- Keep responses under 150 words unless detailed explanation needed

Respond as the assistant:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please email us at bvisiblewalk@aol.com or try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-pulse"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-gradient-to-br from-[#0D1020] to-[#1a1535] rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">B.Visible Support</h3>
                <p className="text-white/80 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl p-3 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-[#6C3BFF] to-[#FFD60A] text-white' 
                    : 'bg-white/10 text-white'
                }`}>
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/10 rounded-2xl p-3">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white/5 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:from-[#FFE44D] hover:to-[#8B5CF6] rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}