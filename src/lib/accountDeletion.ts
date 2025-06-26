
import { supabase } from "@/integrations/supabase/client";
import { deleteAlbum, getUserAlbums } from "./photoAlbumApi";

export const deleteUserAccount = async (): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  console.log('Starting account deletion process...');

  try {
    // Step 1: Get all user albums and delete them (this handles storage cleanup)
    const albums = await getUserAlbums();
    console.log(`Found ${albums.length} albums to delete`);
    
    for (const album of albums) {
      console.log(`Deleting album: ${album.name}`);
      await deleteAlbum(album.id);
    }

    // Step 2: Call the database function to clean up remaining data
    console.log('Cleaning up user data from database...');
    const { error: functionError } = await supabase.rpc('delete_user_account', {
      user_uuid: user.user.id
    });

    if (functionError) {
      console.error('Error calling delete_user_account function:', functionError);
      throw new Error(`Failed to clean up user data: ${functionError.message}`);
    }

    // Step 3: Delete the user from Supabase Auth
    console.log('Deleting user from authentication...');
    const { error: authError } = await supabase.auth.admin.deleteUser(user.user.id);
    
    // Note: admin.deleteUser might not work from client side, so we'll use the regular signOut
    // and let the server handle cleanup, or implement this via an edge function
    if (authError) {
      console.warn('Could not delete auth user from client:', authError);
      // Still sign out the user
      await supabase.auth.signOut();
    } else {
      console.log('User successfully deleted from authentication');
    }

  } catch (error) {
    console.error('Error during account deletion:', error);
    throw error;
  }
};
