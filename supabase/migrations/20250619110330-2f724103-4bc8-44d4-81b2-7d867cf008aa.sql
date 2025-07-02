
-- Update the user role to super_admin for the email w.ineza@alustudent.com
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'w.ineza@alustudent.com'
);
