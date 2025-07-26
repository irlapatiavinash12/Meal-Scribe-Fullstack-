import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface CreateMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealCreated: () => void;
}

const DIETARY_TAGS = [
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

const CUISINE_TYPES = [
  'american',
  'italian',
  'mexican',
  'asian',
  'mediterranean',
  'indian',
  'french',
  'thai',
  'japanese',
  'greek'
];

const CreateMealModal = ({ open, onOpenChange, onMealCreated }: CreateMealModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prep_time: 15,
    cook_time: 30,
    servings: 4,
    cuisine_type: '',
    difficulty_level: 'easy',
    dietary_tags: [] as string[],
    image_url: ''
  });

  const handleDietaryTagChange = (tag: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietary_tags: checked 
        ? [...prev.dietary_tags, tag]
        : prev.dietary_tags.filter(item => item !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('meals')
        .insert({
          name: formData.name,
          description: formData.description,
          prep_time: formData.prep_time,
          cook_time: formData.cook_time,
          servings: formData.servings,
          cuisine_type: formData.cuisine_type,
          difficulty_level: formData.difficulty_level,
          dietary_tags: formData.dietary_tags,
          image_url: formData.image_url || 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
          user_id: user.id
        });

      if (error) throw error;

      onMealCreated();
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        prep_time: 15,
        cook_time: 30,
        servings: 4,
        cuisine_type: '',
        difficulty_level: 'easy',
        dietary_tags: [],
        image_url: ''
      });

      toast({
        title: "Meal created",
        description: "Your custom meal has been added to the library.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating meal",
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
          <DialogTitle>Create Custom Meal</DialogTitle>
          <DialogDescription>
            Add your own meal recipe to the library
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Meal Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter meal name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your meal..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prep_time">Prep Time (minutes)</Label>
              <Input
                id="prep_time"
                type="number"
                min="0"
                value={formData.prep_time}
                onChange={(e) => setFormData(prev => ({ ...prev, prep_time: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cook_time">Cook Time (minutes)</Label>
              <Input
                id="cook_time"
                type="number"
                min="0"
                value={formData.cook_time}
                onChange={(e) => setFormData(prev => ({ ...prev, cook_time: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Select 
                value={formData.cuisine_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cuisine_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINE_TYPES.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty_level">Difficulty Level</Label>
              <Select 
                value={formData.difficulty_level} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (optional)</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-3">
            <Label>Dietary Tags</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DIETARY_TAGS.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={formData.dietary_tags.includes(tag)}
                    onCheckedChange={(checked) => handleDietaryTagChange(tag, checked as boolean)}
                  />
                  <Label htmlFor={`tag-${tag}`} className="text-sm capitalize">
                    {tag.replace('-', ' ')}
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
              {loading ? "Creating..." : "Create Meal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMealModal;