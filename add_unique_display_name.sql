-- Add unique constraint to display_name in profiles table
ALTER TABLE profiles ADD CONSTRAINT unique_display_name UNIQUE (display_name);
