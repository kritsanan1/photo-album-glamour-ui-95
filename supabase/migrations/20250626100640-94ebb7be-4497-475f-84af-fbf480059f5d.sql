
-- Create a function to handle complete user account deletion
CREATE OR REPLACE FUNCTION public.delete_user_account(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  album_record RECORD;
BEGIN
  -- First, delete all photos from storage and database for this user's albums
  FOR album_record IN 
    SELECT id FROM public.photo_albums WHERE user_id = user_uuid
  LOOP
    -- Get all photos for this album and delete from storage
    PERFORM public.delete_album_photos_from_storage(album_record.id);
  END LOOP;
  
  -- Delete all user data from tables (cascading deletes will handle related records)
  DELETE FROM public.photo_albums WHERE user_id = user_uuid;
  DELETE FROM public.profiles WHERE id = user_uuid;
  
  -- Note: auth.users deletion must be handled by the application layer
  -- as we cannot delete from auth schema in a function
END;
$$;

-- Create helper function to delete album photos from storage
CREATE OR REPLACE FUNCTION public.delete_album_photos_from_storage(album_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  photo_record RECORD;
  storage_paths text[];
BEGIN
  -- Collect all storage paths for this album
  FOR photo_record IN 
    SELECT storage_path FROM public.album_photos WHERE album_id = album_uuid
  LOOP
    storage_paths := array_append(storage_paths, photo_record.storage_path);
  END LOOP;
  
  -- Delete photos from database first
  DELETE FROM public.album_photos WHERE album_id = album_uuid;
  
  -- Note: Storage deletion must be handled by the application layer
  -- as we cannot call storage functions from SQL
END;
$$;
