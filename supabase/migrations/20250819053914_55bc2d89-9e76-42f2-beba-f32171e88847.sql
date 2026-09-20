-- Create admin user (this will be done manually after signup)
-- We'll create the profile update after user signs up

-- Create edge function policy for admin operations
CREATE POLICY "Admins can perform all operations" 
ON public.profiles 
FOR ALL 
USING (public.is_admin());