import { supabase } from '../supabase';

export async function changePassword(oldPassword: string, newPassword: string) {
  // Validate new password length
  if (newPassword.length > 25) {
    throw new Error('Le mot de passe ne peut pas dépasser 25 caractères');
  }
  
  if (newPassword.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
  }
  
  // Get current user email
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    throw new Error('Utilisateur non connecté');
  }
  
  // Verify old password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });
  
  if (signInError) {
    throw new Error('Ancien mot de passe incorrect');
  }
  
  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    throw error;
  }
  
  return { success: true };
}
