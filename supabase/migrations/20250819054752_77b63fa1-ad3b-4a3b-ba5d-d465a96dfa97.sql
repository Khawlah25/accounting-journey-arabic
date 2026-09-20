-- Grant admin privileges to user qhw199@gmail.com
UPDATE public.profiles 
SET is_admin = true, is_active = true
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'qhw199@gmail.com'
);