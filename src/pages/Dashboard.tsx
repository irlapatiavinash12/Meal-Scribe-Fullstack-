import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EditProfileModal from '@/components/EditProfileModal';
import CreateMealModal from '@/components/CreateMealModal';
import GroceryListModal from '@/components/GroceryListModal';
import MealPlannerModal from '@/components/MealPlannerModal';
import { 
  ChefHat, 
  Calendar, 
  ShoppingCart, 
  User, 
  LogOut, 
  Plus,
  Clock,
  Users,
  Heart,
  Download,
  Sparkles,
  Trash2
} from 'lucide-react';

interface Meal {
  id: string;
  name: string;
  description: string;
  image_url: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  dietary_tags: string[];
  cuisine_type: string;
}

interface Profile {
  id: string;
  full_name: string;
  dietary_preferences: string[];
  allergies: string[];
  cooking_skill_level: string;
  household_size: number;
}

interface MealPlan {
  id: string;
  title: string;
  week_start_date: string;
}

interface MealPlanItem {
  id: string;
  meal_id: string;
  day_of_week: number;
  meal_type: string;
  servings: number;
  meals: Meal;
}

interface GroceryList {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>([]);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreateMeal, setShowCreateMeal] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [selectedGroceryListId, setSelectedGroceryListId] = useState<string | null>(null);
  const [selectedGroceryListTitle, setSelectedGroceryListTitle] = useState('');
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch meals
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .limit(20);

      if (mealsError) throw mealsError;
      setMeals(mealsData || []);

      // Fetch meal plans
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (mealPlansError) throw mealPlansError;
      setMealPlans(mealPlansData || []);
      setCurrentMealPlan(mealPlansData?.[0] || null);

      // Fetch current meal plan items if there's a plan
      if (mealPlansData?.[0]) {
        const { data: planItemsData, error: planItemsError } = await supabase
          .from('meal_plan_items')
          .select(`
            *,
            meals (*)
          `)
          .eq('meal_plan_id', mealPlansData[0].id);

        if (planItemsError) throw planItemsError;
        setMealPlanItems(planItemsData || []);
      }

      // Fetch grocery lists
      const { data: groceryListsData, error: groceryListsError } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (groceryListsError) throw groceryListsError;
      setGroceryLists(groceryListsData || []);

    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddToPlan = async (meal: Meal) => {
    if (!currentMealPlan) {
      // Create a new meal plan first, then show the planner
      try {
        await handleCreateMealPlan();
        // Set the meal and show planner modal immediately after creating plan
        setSelectedMeal(meal);
        setShowMealPlanner(true);
      } catch (error) {
        // Error is already handled in handleCreateMealPlan
        return;
      }
      return;
    }

    setSelectedMeal(meal);
    setShowMealPlanner(true);
  };

  const handleCreateMealPlan = async () => {
    if (!user) return;

    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          week_start_date: startOfWeek.toISOString().split('T')[0],
          title: `Week of ${startOfWeek.toLocaleDateString()}`
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentMealPlan(data);
      setMealPlans(prev => [data, ...prev]);

      toast({
        title: "Meal plan created",
        description: "Your new meal plan is ready!",
      });
    } catch (error: any) {
      toast({
        title: "Error creating meal plan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!user || !profile) {
      toast({
        title: "Profile required",
        description: "Please complete your profile first to generate personalized meal plans.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingPlan(true);
    try {
      // Create a new meal plan
      await handleCreateMealPlan();

      // Get meals that match user preferences
      let query = supabase
        .from('meals')
        .select('*')
        .limit(7);

      // Filter by dietary preferences if available
      if (profile.dietary_preferences?.length > 0) {
        query = query.overlaps('dietary_tags', profile.dietary_preferences);
      }

      const { data: availableMeals, error } = await query;
      if (error) throw error;

      if (availableMeals && availableMeals.length > 0 && currentMealPlan) {
        // Add meals to the plan (one per day)
        const mealPlanItems = availableMeals.slice(0, 7).map((meal, index) => ({
          meal_plan_id: currentMealPlan.id,
          meal_id: meal.id,
          day_of_week: index,
          meal_type: 'dinner',
          servings: Math.min(meal.servings, profile.household_size || 4)
        }));

        const { error: insertError } = await supabase
          .from('meal_plan_items')
          .insert(mealPlanItems);

        if (insertError) throw insertError;

        await fetchMealPlanItems();
        toast({
          title: "Meal plan generated!",
          description: "Your personalized weekly meal plan is ready.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error generating meal plan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleGenerateGroceryList = async () => {
    if (!currentMealPlan || mealPlanItems.length === 0) {
      toast({
        title: "No meal plan found",
        description: "Please create a meal plan first to generate a grocery list.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create grocery list
      const { data: groceryList, error: listError } = await supabase
        .from('grocery_lists')
        .insert({
          user_id: user?.id,
          title: `Grocery List - ${currentMealPlan.title}`,
          meal_plan_id: currentMealPlan.id
        })
        .select()
        .single();

      if (listError) throw listError;

      // Get all ingredients from meal plan
      const mealIds = mealPlanItems.map(item => item.meal_id);
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('meal_ingredients')
        .select(`
          *,
          ingredients (*)
        `)
        .in('meal_id', mealIds);

      if (ingredientsError) throw ingredientsError;

      // Create grocery list items
      if (ingredients && ingredients.length > 0) {
        const groceryItems = ingredients.map(ingredient => ({
          grocery_list_id: groceryList.id,
          ingredient_id: ingredient.ingredient_id,
          amount: ingredient.amount,
          unit: ingredient.unit
        }));

        const { error: itemsError } = await supabase
          .from('grocery_list_items')
          .insert(groceryItems);

        if (itemsError) throw itemsError;
      }

      setGroceryLists(prev => [groceryList, ...prev]);

      toast({
        title: "Grocery list created!",
        description: "Your grocery list is ready based on your meal plan.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating grocery list",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchMealPlanItems = async () => {
    if (!currentMealPlan) return;

    try {
      const { data, error } = await supabase
        .from('meal_plan_items')
        .select(`
          *,
          meals (*)
        `)
        .eq('meal_plan_id', currentMealPlan.id);

      if (error) throw error;
      setMealPlanItems(data || []);
    } catch (error: any) {
      console.error('Error fetching meal plan items:', error);
    }
  };

  const getDietaryBadgeColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      'vegan': 'bg-green-100 text-green-800',
      'vegetarian': 'bg-green-100 text-green-800',
      'keto': 'bg-purple-100 text-purple-800',
      'high-protein': 'bg-blue-100 text-blue-800',
      'gluten-free': 'bg-orange-100 text-orange-800',
      'mediterranean': 'bg-teal-100 text-teal-800',
      'low-carb': 'bg-red-100 text-red-800',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  const handleOpenGroceryList = (listId: string, listTitle: string) => {
    setSelectedGroceryListId(listId);
    setSelectedGroceryListTitle(listTitle);
    setShowGroceryList(true);
  };

  const handleDeleteGroceryList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('grocery_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      setGroceryLists(prev => prev.filter(list => list.id !== listId));

      toast({
        title: "Grocery list deleted",
        description: "The grocery list has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting grocery list",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex] || 'Unknown';
  };

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
      <header className="bg-card border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-xl">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MealScribe</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.full_name || user?.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="meals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="meals" className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4" />
              <span>Meals</span>
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Planner</span>
            </TabsTrigger>
            <TabsTrigger value="grocery" className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Grocery</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meals" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Meal Library</h2>
                <p className="text-muted-foreground">
                  Discover healthy and delicious meal options
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={handleGenerateMealPlan}
                  disabled={generatingPlan}
                  className="bg-gradient-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generatingPlan ? "Generating..." : "Generate Meal Plan"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateMeal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Meal
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.map((meal) => (
                <Card key={meal.id} className="overflow-hidden hover:shadow-meal-card transition-shadow">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={meal.image_url}
                      alt={meal.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
                        {meal.cuisine_type}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {meal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{meal.prep_time + meal.cook_time} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{meal.servings} servings</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {meal.dietary_tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`text-xs ${getDietaryBadgeColor(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleAddToPlan(meal)}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="planner" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Weekly Meal Planner</h2>
                <p className="text-muted-foreground">
                  {currentMealPlan ? `Current plan: ${currentMealPlan.title}` : 'No active meal plan'}
                </p>
              </div>
              <Button 
                onClick={handleCreateMealPlan}
                className="bg-gradient-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Plan
              </Button>
            </div>

            {currentMealPlan && mealPlanItems.length > 0 ? (
              <div className="space-y-6">
                {/* Group meals by day of week */}
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayMeals = mealPlanItems.filter(item => item.day_of_week === dayIndex);
                  
                  if (dayMeals.length === 0) return null;
                  
                  // Group by meal type within the day
                  const groupedByMealType = dayMeals.reduce((acc, meal) => {
                    if (!acc[meal.meal_type]) {
                      acc[meal.meal_type] = [];
                    }
                    acc[meal.meal_type].push(meal);
                    return acc;
                  }, {} as Record<string, MealPlanItem[]>);
                  
                  return (
                    <Card key={dayIndex} className="border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{getDayName(dayIndex)}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Object.entries(groupedByMealType).map(([mealType, meals]) => (
                          <div key={mealType} className="space-y-2">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {mealType}
                            </Badge>
                            <div className="grid gap-3">
                              {meals.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-sm">{item.meals.name}</h4>
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {item.meals.description}
                                      </p>
                                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                        <div className="flex items-center space-x-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{(item.meals.prep_time || 0) + (item.meals.cook_time || 0)} min</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Users className="w-3 h-3" />
                                          <span>{item.servings} servings</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                }).filter(Boolean)}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start Planning Your Week</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first meal plan to get started
                  </p>
                  <Button 
                    onClick={handleCreateMealPlan}
                    className="bg-gradient-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Meal Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="grocery" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Grocery Lists</h2>
                <p className="text-muted-foreground">
                  Automatically generated from your meal plans
                </p>
              </div>
              <Button 
                onClick={handleGenerateGroceryList}
                variant="outline"
                disabled={!currentMealPlan || mealPlanItems.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate List
              </Button>
            </div>

            {groceryLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groceryLists.map((list) => (
                  <Card key={list.id} className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {list.title}
                        <Badge variant={list.is_completed ? "default" : "secondary"}>
                          {list.is_completed ? "Complete" : "Pending"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Created: {new Date(list.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleOpenGroceryList(list.id, list.title)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          View & Export
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteGroceryList(list.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Grocery Lists Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a meal plan to automatically generate your grocery list
                  </p>
                  <Button 
                    onClick={handleGenerateGroceryList}
                    variant="outline"
                    disabled={!currentMealPlan || mealPlanItems.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your dietary preferences and account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <p className="text-muted-foreground">{profile?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Household Size</label>
                    <p className="text-muted-foreground">{profile?.household_size || 1} people</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Cooking Level</label>
                    <p className="text-muted-foreground capitalize">
                      {profile?.cooking_skill_level || 'Beginner'}
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setShowEditProfile(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <EditProfileModal 
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        profile={profile}
        onProfileUpdate={(updatedProfile) => {
          setProfile(updatedProfile);
          fetchData(); // Refresh data after profile update
        }}
      />

      <CreateMealModal 
        open={showCreateMeal}
        onOpenChange={setShowCreateMeal}
        onMealCreated={() => {
          fetchData(); // Refresh meals after creating new one
        }}
      />

      <GroceryListModal 
        open={showGroceryList}
        onOpenChange={setShowGroceryList}
        groceryListId={selectedGroceryListId}
        groceryListTitle={selectedGroceryListTitle}
        onListUpdated={() => {
          fetchData(); // Refresh grocery lists after updates
        }}
      />

      <MealPlannerModal 
        open={showMealPlanner}
        onOpenChange={setShowMealPlanner}
        meal={selectedMeal}
        mealPlanId={currentMealPlan?.id || null}
        onMealAdded={() => {
          fetchMealPlanItems(); // Refresh meal plan items after adding
        }}
      />
    </div>
  );
};

export default Dashboard;