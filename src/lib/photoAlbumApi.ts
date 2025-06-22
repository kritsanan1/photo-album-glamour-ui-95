
import { supabase } from "@/integrations/supabase/client";

export type PhotoAlbum = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type AlbumPhoto = {
  id: string;
  album_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  upload_url: string;
  thumbnail_url?: string;
  created_at: string;
};

// Create a new photo album
export const createPhotoAlbum = async (name: string, description?: string): Promise<PhotoAlbum> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('photo_albums')
    .insert({
      user_id: user.user.id,
      name,
      description
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create album: ${error.message}`);
  }

  return data;
};

// Upload photo to Supabase Storage
export const uploadPhotoToStorage = async (file: File, albumId: string): Promise<{ path: string; url: string }> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${user.user.id}/${albumId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('photo-albums')
    .upload(filePath, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('photo-albums')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: urlData.publicUrl
  };
};

// Add photo record to database
export const addPhotoToAlbum = async (
  albumId: string,
  file: File,
  storagePath: string,
  uploadUrl: string
): Promise<AlbumPhoto> => {
  const { data, error } = await supabase
    .from('album_photos')
    .insert({
      album_id: albumId,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: storagePath,
      upload_url: uploadUrl
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add photo to album: ${error.message}`);
  }

  return data;
};

// Get all albums for current user
export const getUserAlbums = async (): Promise<PhotoAlbum[]> => {
  const { data, error } = await supabase
    .from('photo_albums')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch albums: ${error.message}`);
  }

  return data || [];
};

// Get photos for a specific album
export const getAlbumPhotos = async (albumId: string): Promise<AlbumPhoto[]> => {
  const { data, error } = await supabase
    .from('album_photos')
    .select('*')
    .eq('album_id', albumId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch album photos: ${error.message}`);
  }

  return data || [];
};

// Delete photo from storage and database
export const deletePhotoFromAlbum = async (photoId: string, storagePath: string): Promise<void> => {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('photo-albums')
    .remove([storagePath]);

  if (storageError) {
    console.error('Failed to delete from storage:', storageError);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('album_photos')
    .delete()
    .eq('id', photoId);

  if (dbError) {
    throw new Error(`Failed to delete photo: ${dbError.message}`);
  }
};

// Delete entire album
export const deleteAlbum = async (albumId: string): Promise<void> => {
  // First get all photos in the album
  const photos = await getAlbumPhotos(albumId);
  
  // Delete all photos from storage
  if (photos.length > 0) {
    const storagePaths = photos.map(photo => photo.storage_path);
    const { error: storageError } = await supabase.storage
      .from('photo-albums')
      .remove(storagePaths);

    if (storageError) {
      console.error('Failed to delete photos from storage:', storageError);
    }
  }

  // Delete album (cascade will delete photo records)
  const { error } = await supabase
    .from('photo_albums')
    .delete()
    .eq('id', albumId);

  if (error) {
    throw new Error(`Failed to delete album: ${error.message}`);
  }
};
