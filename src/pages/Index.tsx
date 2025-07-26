import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Calendar, ShoppingCart, Sparkles, Users, Clock, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-meal-planning.jpg';
import DemoModal from '@/components/DemoModal';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-xl">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                MealScribe
              </h1>
            </div>
            <Button onClick={() => navigate('/auth')} className="bg-gradient-primary">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered Meal Planning
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Smart Meal Planning
                  <span className="block bg-gradient-primary bg-clip-text text-transparent">
                    Made Simple
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Plan your weekly meals, generate smart grocery lists, and track your pantry 
                  with our intelligent meal planning app. Designed for modern lifestyles.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-primary text-lg px-8 py-3"
                >
                  Start Planning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-3"
                  onClick={() => setShowDemo(true)}
                >
                  View Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>For any household size</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Save hours weekly</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src={heroImage}
                  alt="Fresh ingredients and meal planning"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-meal-card border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ChefHat className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Weekly Plan Ready</p>
                    <p className="text-xs text-muted-foreground">7 meals • 23 ingredients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Smart Meal Planning
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From AI-powered meal suggestions to automatic grocery lists, 
              we've got your weekly planning covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:shadow-meal-card transition-shadow">
              <CardHeader>
                <div className="bg-gradient-warm p-3 rounded-xl w-fit">
                  <ChefHat className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Smart Meal Suggestions</CardTitle>
                <CardDescription>
                  Get personalized meal recommendations based on your dietary preferences, 
                  cooking skills, and household size.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Dietary preference filtering</li>
                  <li>• Allergy-aware suggestions</li>
                  <li>• Skill level matching</li>
                  <li>• Cuisine variety</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-meal-card transition-shadow">
              <CardHeader>
                <div className="bg-gradient-primary p-3 rounded-xl w-fit">
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Weekly Meal Planner</CardTitle>
                <CardDescription>
                  Drag and drop meals into your weekly calendar. Plan breakfast, 
                  lunch, dinner, and snacks with ease.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Visual weekly calendar</li>
                  <li>• Drag & drop interface</li>
                  <li>• Meal type organization</li>
                  <li>• Serving size adjustment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-meal-card transition-shadow">
              <CardHeader>
                <div className="bg-gradient-warm p-3 rounded-xl w-fit">
                  <ShoppingCart className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Smart Grocery Lists</CardTitle>
                <CardDescription>
                  Automatically generate grocery lists from your meal plan. 
                  Check against your pantry to avoid duplicate purchases.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Auto-generated from meals</li>
                  <li>• Pantry integration</li>
                  <li>• Organized by store section</li>
                  <li>• PDF export available</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-primary rounded-3xl p-12 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Meal Planning?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of families who've simplified their weekly meal planning
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-3 bg-card text-foreground hover:bg-card/90"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-xl">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold bg-gradient-primary bg-clip-text text-transparent">
                MealScribe
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MealScribe. Smart meal planning made simple.
            </p>
          </div>
        </div>
      </footer>

      <DemoModal 
        open={showDemo} 
        onOpenChange={setShowDemo}
        onGetStarted={() => {
          setShowDemo(false);
          navigate('/auth');
        }}
      />
    </div>
  );
};

export default Index;
