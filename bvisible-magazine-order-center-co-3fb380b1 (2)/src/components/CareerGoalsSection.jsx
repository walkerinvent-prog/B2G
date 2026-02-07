import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Edit2, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CareerGoalsSection({ order, isOwner, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [careerGoals, setCareerGoals] = useState(order.career_goals || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Order.update(order.id, { career_goals: careerGoals });
      toast.success('Career goals updated!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update career goals');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCareerGoals(order.career_goals || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C3BFF]/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-[#6C3BFF]" />
          </div>
          <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Career Goals (Optional)
          </h3>
        </div>
        {isOwner && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {careerGoals ? 'Edit' : 'Add'}
          </Button>
        )}
      </div>

      {!careerGoals && !isEditing ? (
        <p className="text-white/50 text-center py-4">
          {isOwner ? 'Share your career goals and plans for the future.' : 'No career goals shared yet.'}
        </p>
      ) : isEditing ? (
        <div className="space-y-4">
          <Textarea
            placeholder="Share your career goals, aspirations, and plans for the future..."
            value={careerGoals}
            onChange={(e) => setCareerGoals(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#6C3BFF] to-[#FFD60A] hover:opacity-90"
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
      ) : (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-white/80 whitespace-pre-wrap">{careerGoals}</p>
        </div>
      )}
    </div>
  );
}