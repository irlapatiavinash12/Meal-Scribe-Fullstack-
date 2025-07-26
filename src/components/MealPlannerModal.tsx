import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock } from 'lucide-react';

interface MealPlannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: {
    id: string;
    name: string;
    image_url: string;
    servings: number;
  } | null;
  mealPlanId: string | null;
  onMealAdded: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const MealPlannerModal = ({ 
  open, 
  onOpenChange, 
  meal, 
  mealPlanId, 
  onMealAdded 
}: MealPlannerModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 1,
    meal_type: 'dinner',
    servings: meal?.servings || 4,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meal || !mealPlanId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('meal_plan_items')
        .insert({
          meal_plan_id: mealPlanId,
          meal_id: meal.id,
          day_of_week: formData.day_of_week,
          meal_type: formData.meal_type,
          servings: formData.servings,
          notes: formData.notes
        });

      if (error) throw error;

      onMealAdded();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        day_of_week: 1,
        meal_type: 'dinner',
        servings: meal.servings || 4,
        notes: ''
      });

      toast({
        title: "Meal added to plan",
        description: `${meal.name} has been scheduled for ${DAYS_OF_WEEK.find(d => d.value === formData.day_of_week)?.label} ${formData.meal_type}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding meal to plan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!meal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Schedule Meal</span>
          </DialogTitle>
          <DialogDescription>
            Add "{meal.name}" to your meal plan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/50">
            <img
              src={meal.image_url}
              alt={meal.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-semibold">{meal.name}</h4>
              <p className="text-sm text-muted-foreground">
                Default: {meal.servings} servings
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day_of_week">Day of Week</Label>
            <Select 
              value={formData.day_of_week.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, day_of_week: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal_type">Meal Type</Label>
            <Select 
              value={formData.meal_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, meal_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              min="1"
              max="20"
              value={formData.servings}
              onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special notes..."
            />
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
              {loading ? "Adding..." : "Add to Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlannerModal;