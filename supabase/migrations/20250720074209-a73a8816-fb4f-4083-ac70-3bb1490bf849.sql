-- Fix the profile with null role and update user to admin
UPDATE profiles 
SET role = 'student' 
WHERE role IS NULL;

-- Update the specific user to admin (using the most recent user)
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = '896f090d-e70a-4583-866c-8a9089c9ee2f';