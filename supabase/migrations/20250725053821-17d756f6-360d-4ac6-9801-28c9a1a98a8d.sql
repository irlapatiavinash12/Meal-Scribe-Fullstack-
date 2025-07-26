-- Fix meals table to allow users to create their own custom meals
-- Add user_id column to meals table to track ownership
ALTER TABLE public.meals ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update RLS policies for meals table
DROP POLICY IF EXISTS "Anyone can view meals" ON public.meals;

-- Create new policies that allow viewing all meals and creating own meals
CREATE POLICY "Anyone can view meals" 
ON public.meals 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own meals" 
ON public.meals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals" 
ON public.meals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals" 
ON public.meals 
FOR DELETE 
USING (auth.uid() = user_id);