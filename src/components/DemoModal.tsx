import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Calendar, ShoppingCart, Clock, Users, ArrowRight } from 'lucide-react';

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetStarted: () => void;
}

const DemoModal = ({ open, onOpenChange, onGetStarted }: DemoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <span>MealScribe Demo</span>
          </DialogTitle>
          <DialogDescription>
            See how easy meal planning can be with our smart features
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sample Meal Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>This Week's Meal Plan</span>
              </CardTitle>
              <CardDescription>
                Automatically generated based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { day: 'Monday', meal: 'Mediterranean Quinoa Bowl', time: '25 min', servings: 4 },
                  { day: 'Tuesday', meal: 'Grilled Chicken & Vegetables', time: '30 min', servings: 4 },
                  { day: 'Wednesday', meal: 'Vegetarian Pasta Primavera', time: '20 min', servings: 4 },
                  { day: 'Thursday', meal: 'Asian Stir-Fry with Rice', time: '15 min', servings: 4 },
                  { day: 'Friday', meal: 'Fish Tacos with Avocado', time: '25 min', servings: 4 },
                  { day: 'Saturday', meal: 'Homemade Pizza Night', time: '45 min', servings: 6 },
                ].map((meal, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">
                          {meal.day}
                        </Badge>
                        <h4 className="font-semibold text-sm">{meal.meal}</h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{meal.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{meal.servings}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sample Grocery List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span>Auto-Generated Grocery List</span>
              </CardTitle>
              <CardDescription>
                Smart list excludes items already in your pantry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Proteins</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Chicken breast (2 lbs)</li>
                    <li>• White fish fillets (1 lb)</li>
                    <li>• Eggs (1 dozen)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Vegetables</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Bell peppers (3)</li>
                    <li>• Broccoli (2 heads)</li>
                    <li>• Avocados (4)</li>
                    <li>• Cherry tomatoes (1 pint)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Pantry</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Quinoa (1 lb)</li>
                    <li>• Pasta (2 boxes)</li>
                    <li>• Tortillas (1 pack)</li>
                    <li>• Pizza dough (2)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <ChefHat className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold text-sm mb-1">Smart Suggestions</h4>
                <p className="text-xs text-muted-foreground">
                  AI-powered meal recommendations based on your preferences
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold text-sm mb-1">Weekly Planning</h4>
                <p className="text-xs text-muted-foreground">
                  Drag & drop interface for easy meal organization
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold text-sm mb-1">Auto Grocery Lists</h4>
                <p className="text-xs text-muted-foreground">
                  Generate lists automatically from your meal plans
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-primary"
              size="lg"
            >
              Start Planning Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal;