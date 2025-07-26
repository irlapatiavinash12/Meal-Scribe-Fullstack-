import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface Profile {
  id: string;
  full_name: string;
  dietary_preferences: string[];
  allergies: string[];
  cooking_skill_level: string;
  household_size: number;
}

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onProfileUpdate: (profile: Profile) => void;
}

const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'keto',
  'paleo',
  'mediterranean',
  'low-carb',
  'high-protein',
  'gluten-free',
  'dairy-free'
];

const ALLERGY_OPTIONS = [
  'nuts',
  'shellfish',
  'eggs',
  'dairy',
  'gluten',
  'soy',
  'fish'
];

const EditProfileModal = ({ open, onOpenChange, profile, onProfileUpdate }: EditProfileModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    dietary_preferences: [] as string[],
    allergies: [] as string[],
    cooking_skill_level: 'beginner',
    household_size: 1
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        dietary_preferences: profile.dietary_preferences || [],
        allergies: profile.allergies || [],
        cooking_skill_level: profile.cooking_skill_level || 'beginner',
        household_size: profile.household_size || 1
      });
    }
  }, [profile]);

  const handleDietaryChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: checked 
        ? [...prev.dietary_preferences, option]
        : prev.dietary_preferences.filter(item => item !== option)
    }));
  };

  const handleAllergyChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allergies: checked 
        ? [...prev.allergies, option]
        : prev.allergies.filter(item => item !== option)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          dietary_preferences: formData.dietary_preferences,
          allergies: formData.allergies,
          cooking_skill_level: formData.cooking_skill_level,
          household_size: formData.household_size,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);
      onOpenChange(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and dietary preferences
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cooking_skill_level">Cooking Skill Level</Label>
              <Select 
                value={formData.cooking_skill_level} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cooking_skill_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="household_size">Household Size</Label>
              <Input
                id="household_size"
                type="number"
                min="1"
                max="20"
                value={formData.household_size}
                onChange={(e) => setFormData(prev => ({ ...prev, household_size: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dietary Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DIETARY_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dietary-${option}`}
                    checked={formData.dietary_preferences.includes(option)}
                    onCheckedChange={(checked) => handleDietaryChange(option, checked as boolean)}
                  />
                  <Label htmlFor={`dietary-${option}`} className="text-sm capitalize">
                    {option.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Allergies</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALLERGY_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${option}`}
                    checked={formData.allergies.includes(option)}
                    onCheckedChange={(checked) => handleAllergyChange(option, checked as boolean)}
                  />
                  <Label htmlFor={`allergy-${option}`} className="text-sm capitalize">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;