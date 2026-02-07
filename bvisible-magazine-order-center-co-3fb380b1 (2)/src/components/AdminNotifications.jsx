import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(() => {
    const stored = localStorage.getItem('admin_last_checked');
    return stored ? new Date(stored) : new Date();
  });
  const [isOpen, setIsOpen] = useState(false);

  // Poll for orders every 30 seconds
  const { data: orders = [] } = useQuery({
    queryKey: ['notification-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 100),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  useEffect(() => {
    if (!orders.length) return;

    const newNotifications = [];

    orders.forEach(order => {
      const createdDate = new Date(order.created_date);
      const updatedDate = new Date(order.updated_date);

      // Check for new orders
      if (createdDate > lastChecked) {
        newNotifications.push({
          id: `new-${order.id}`,
          type: 'new_order',
          orderId: order.order_id,
          studentName: order.student_name,
          timestamp: createdDate,
          read: false,
        });
      }

      // Check for proof approvals (if updated after last check and status is approved)
      if (order.proof_status === 'approved' && updatedDate > lastChecked) {
        // Check if this approval happened after last check
        const proofSentDate = order.proof_sent_date ? new Date(order.proof_sent_date) : null;
        if (!proofSentDate || updatedDate > proofSentDate) {
          newNotifications.push({
            id: `approved-${order.id}`,
            type: 'proof_approved',
            orderId: order.order_id,
            studentName: order.student_name,
            timestamp: updatedDate,
            read: false,
          });
        }
      }

      // Check for change requests (if status is changes_requested)
      if (order.proof_status === 'changes_requested' && updatedDate > lastChecked) {
        newNotifications.push({
          id: `changes-${order.id}`,
          type: 'changes_requested',
          orderId: order.order_id,
          studentName: order.student_name,
          timestamp: updatedDate,
          read: false,
        });
      }
    });

    if (newNotifications.length > 0) {
      // Show toast for new notifications
      newNotifications.forEach(notif => {
        if (notif.type === 'new_order') {
          toast.success(`New Order: ${notif.studentName}`, {
            description: `Order ${notif.orderId}`,
          });
        } else if (notif.type === 'proof_approved') {
          toast.success(`Proof Approved: ${notif.studentName}`, {
            description: `Order ${notif.orderId}`,
          });
        } else if (notif.type === 'changes_requested') {
          toast.info(`Changes Requested: ${notif.studentName}`, {
            description: `Order ${notif.orderId}`,
          });
        }
      });

      setNotifications(prev => [...newNotifications, ...prev].slice(0, 50)); // Keep last 50
    }
  }, [orders, lastChecked]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setLastChecked(new Date());
    localStorage.setItem('admin_last_checked', new Date().toISOString());
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    if (type === 'new_order') return <Package className="w-5 h-5 text-[#FFD60A]" />;
    if (type === 'proof_approved') return <CheckCircle2 className="w-5 h-5 text-[#20D4AB]" />;
    if (type === 'changes_requested') return <AlertCircle className="w-5 h-5 text-orange-400" />;
  };

  const getNotificationText = (notif) => {
    if (notif.type === 'new_order') return `New order from ${notif.studentName}`;
    if (notif.type === 'proof_approved') return `${notif.studentName} approved their proof`;
    if (notif.type === 'changes_requested') return `${notif.studentName} requested changes`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="relative border-white/20 text-white hover:bg-white/10"
          size="icon"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#FFD60A] text-black text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-[#1a1535] border-white/20" align="end">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-[#FFD60A] hover:text-[#FFD60A]/80 hover:bg-white/5 h-8"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-white/60">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-white/5 transition-colors ${
                    !notif.read ? 'bg-white/5' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">
                        {getNotificationText(notif)}
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        Order {notif.orderId} • {new Date(notif.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notif.id);
                      }}
                      className="flex-shrink-0 text-white/40 hover:text-white/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}