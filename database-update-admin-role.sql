-- Update the check constraint to allow 'admin' role
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'ajussi', 'admin'));

-- Now you can update the user role to admin
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@gmail.com';