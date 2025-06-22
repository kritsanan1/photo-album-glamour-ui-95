
-- Create photo_albums table
CREATE TABLE public.photo_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create album_photos table
CREATE TABLE public.album_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES public.photo_albums(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  upload_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for photo_albums
CREATE POLICY "Users can view their own albums" 
  ON public.photo_albums 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own albums" 
  ON public.photo_albums 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own albums" 
  ON public.photo_albums 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own albums" 
  ON public.photo_albums 
  FOR DELETE 
  USING (user_id = auth.uid());

-- RLS policies for album_photos
CREATE POLICY "Users can view photos from their albums" 
  ON public.album_photos 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.photo_albums 
    WHERE photo_albums.id = album_photos.album_id 
    AND photo_albums.user_id = auth.uid()
  ));

CREATE POLICY "Users can add photos to their albums" 
  ON public.album_photos 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.photo_albums 
    WHERE photo_albums.id = album_photos.album_id 
    AND photo_albums.user_id = auth.uid()
  ));

CREATE POLICY "Users can update photos in their albums" 
  ON public.album_photos 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.photo_albums 
    WHERE photo_albums.id = album_photos.album_id 
    AND photo_albums.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete photos from their albums" 
  ON public.album_photos 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.photo_albums 
    WHERE photo_albums.id = album_photos.album_id 
    AND photo_albums.user_id = auth.uid()
  ));

-- Create storage bucket for photo albums
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photo-albums', 'photo-albums', true);

-- Storage policies for photo-albums bucket
CREATE POLICY "Users can view photos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'photo-albums');

CREATE POLICY "Users can upload photos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'photo-albums' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their photos" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'photo-albums' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their photos" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'photo-albums' AND auth.uid()::text = (storage.foldername(name))[1]);
