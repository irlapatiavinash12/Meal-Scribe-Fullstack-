-- Create user profiles table with dietary preferences
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  dietary_preferences TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  cooking_skill_level TEXT DEFAULT 'beginner',
  household_size INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meals table for storing meal data
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 4,
  difficulty_level TEXT DEFAULT 'easy',
  dietary_tags TEXT[] DEFAULT '{}', -- vegan, keto, high-protein, etc.
  cuisine_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ingredients table
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT, -- produce, dairy, meat, etc.
  unit TEXT DEFAULT 'item', -- cup, lb, oz, item, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal ingredients junction table
CREATE TABLE public.meal_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  unit TEXT,
  notes TEXT,
  UNIQUE(meal_id, ingredient_id)
);

-- Create meal plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  title TEXT DEFAULT 'My Meal Plan',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Create meal plan items table
CREATE TABLE public.meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
  servings INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pantry items table
CREATE TABLE public.pantry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  unit TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ingredient_id)
);

-- Create grocery lists table
CREATE TABLE public.grocery_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create grocery list items table
CREATE TABLE public.grocery_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grocery_list_id UUID NOT NULL REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  unit TEXT,
  is_checked BOOLEAN DEFAULT false,
  estimated_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_list_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Meals policies (public read, admin write for now)
CREATE POLICY "Anyone can view meals" ON public.meals
  FOR SELECT USING (true);

-- Ingredients policies (public read, admin write for now)
CREATE POLICY "Anyone can view ingredients" ON public.ingredients
  FOR SELECT USING (true);

-- Meal ingredients policies (public read)
CREATE POLICY "Anyone can view meal ingredients" ON public.meal_ingredients
  FOR SELECT USING (true);

-- Meal plans policies
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meal plans" ON public.meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meal plans" ON public.meal_plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal plans" ON public.meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Meal plan items policies
CREATE POLICY "Users can view their own meal plan items" ON public.meal_plan_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE id = meal_plan_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create their own meal plan items" ON public.meal_plan_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE id = meal_plan_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their own meal plan items" ON public.meal_plan_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE id = meal_plan_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their own meal plan items" ON public.meal_plan_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE id = meal_plan_id AND user_id = auth.uid()
    )
  );

-- Pantry items policies
CREATE POLICY "Users can view their own pantry items" ON public.pantry_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own pantry items" ON public.pantry_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pantry items" ON public.pantry_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pantry items" ON public.pantry_items
  FOR DELETE USING (auth.uid() = user_id);

-- Grocery lists policies
CREATE POLICY "Users can view their own grocery lists" ON public.grocery_lists
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own grocery lists" ON public.grocery_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own grocery lists" ON public.grocery_lists
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own grocery lists" ON public.grocery_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Grocery list items policies
CREATE POLICY "Users can view their own grocery list items" ON public.grocery_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists 
      WHERE id = grocery_list_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create their own grocery list items" ON public.grocery_list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.grocery_lists 
      WHERE id = grocery_list_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their own grocery list items" ON public.grocery_list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists 
      WHERE id = grocery_list_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their own grocery list items" ON public.grocery_list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists 
      WHERE id = grocery_list_id AND user_id = auth.uid()
    )
  );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_pantry_items_updated_at
  BEFORE UPDATE ON public.pantry_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();