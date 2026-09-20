-- Add enum for user types
CREATE TYPE public.user_type_enum AS ENUM ('student', 'admin');

-- Add is_active column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Update user_type column to use the new enum
ALTER TABLE public.profiles 
ALTER COLUMN user_type TYPE user_type_enum USING user_type::user_type_enum;

-- Create admin policies for viewing all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  )
);

-- Create admin policies for updating all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  )
);

-- Create security definer function to get user type
CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS user_type_enum AS $$
  SELECT user_type FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;