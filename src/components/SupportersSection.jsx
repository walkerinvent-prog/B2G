import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2, Edit2, Check, X, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SupportersSection({ order, isOwner, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [supporters, setSupporters] = useState(order.supporters || []);
  const [newSupporter, setNewSupporter] = useState({ name: '', amount: '' });
  const [saving, setSaving] = useState(false);

  const handleAddSupporter = () => {
    if (!newSupporter.name.trim() || !newSupporter.amount) {
      toast.error('Please enter both name and amount');
      return;
    }

    setSupporters([...supporters, {
      name: newSupporter.name.trim(),
      amount: parseFloat(newSupporter.amount)
    }]);
    setNewSupporter({ name: '', amount: '' });
  };

  const handleRemoveSupporter = (index) => {
    setSupporters(supporters.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Verify user is signed in before saving
      const user = await base44.auth.me();
      if (!user) {
        toast.error('Please sign in to edit supporters');
        setIsEditing(false);
        return;
      }
      
      await base44.entities.Order.update(order.id, { supporters });
      toast.success('Supporters list updated!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update supporters. Please sign in.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSupporters(order.supporters || []);
    setNewSupporter({ name: '', amount: '' });
    setIsEditing(false);
  };

  const totalSupport = supporters.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#20D4AB]/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#20D4AB]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Supporters
            </h3>
            {supporters.length > 0 && (
              <p className="text-[#20D4AB] text-sm">
                Total Support: ${totalSupport.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        {isOwner && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {supporters.length === 0 && !isEditing ? (
        <p className="text-white/50 text-center py-4">
          {isOwner ? 'No supporters yet. Click Edit to add supporters.' : 'No supporters listed yet.'}
        </p>
      ) : (
        <div className="space-y-2">
          {supporters.map((supporter, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{supporter.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#20D4AB] font-bold">
                  ${supporter.amount.toFixed(2)}
                </span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSupporter(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="mt-4 space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-[#20D4AB]/30">
            <Label className="text-white mb-3 block">Add New Supporter</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Supporter name"
                value={newSupporter.name}
                onChange={(e) => setNewSupporter({ ...newSupporter, name: e.target.value })}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <div className="relative w-32">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newSupporter.amount}
                  onChange={(e) => setNewSupporter({ ...newSupporter, amount: e.target.value })}
                  className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <Button
                onClick={handleAddSupporter}
                size="sm"
                className="bg-[#20D4AB] hover:bg-[#20D4AB]/90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#FFD60A] to-[#20D4AB] hover:opacity-90"
            >
              {saving ? 'Saving...' : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}