import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AuthButton from "./AuthButton";
import MasonryGrid from "./MasonryGrid";
import PhotoViewer from "./PhotoViewer";
import SearchAndFilter from "./SearchAndFilter";
import {
  createPhotoAlbum,
  uploadPhotoToStorage,
  addPhotoToAlbum,
  getUserAlbums,
  getAlbumPhotos,
  deletePhotoFromAlbum,
  deleteAlbum,
  type PhotoAlbum,
  type AlbumPhoto
} from "@/lib/photoAlbumApi";

interface FilterOptions {
  dateRange?: { start: Date; end: Date };
  fileType?: string[];
  sizeRange?: { min: number; max: number };
  tags?: string[];
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';

export default function PhotoAlbumUploader() {
  const [user, setUser] = useState<User | null>(null);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<AlbumPhoto[]>([]);
  const [albumName, setAlbumName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  // Photo viewer state
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  
  const dropRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Authentication check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setAlbums([]);
          setSelectedAlbum(null);
          setAlbumPhotos([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load user albums
  useEffect(() => {
    if (user) {
      loadUserAlbums();
    }
  }, [user]);

  // Load album photos when album is selected
  useEffect(() => {
    if (selectedAlbum) {
      loadAlbumPhotos(selectedAlbum.id);
    }
  }, [selectedAlbum]);

  // Apply search, filter, and sort
  useEffect(() => {
    let filtered = [...albumPhotos];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(photo =>
        photo.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.fileType && filters.fileType.length > 0) {
      filtered = filtered.filter(photo =>
        filters.fileType!.includes(photo.file_type)
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(photo => {
        const photoDate = new Date(photo.created_at);
        return photoDate >= filters.dateRange!.start && photoDate <= filters.dateRange!.end;
      });
    }

    if (filters.sizeRange) {
      filtered = filtered.filter(photo =>
        photo.file_size >= filters.sizeRange!.min && photo.file_size <= filters.sizeRange!.max
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name-asc':
          return a.file_name.localeCompare(b.file_name);
        case 'name-desc':
          return b.file_name.localeCompare(a.file_name);
        case 'size-desc':
          return b.file_size - a.file_size;
        case 'size-asc':
          return a.file_size - b.file_size;
        default:
          return 0;
      }
    });

    setFilteredPhotos(filtered);
  }, [albumPhotos, searchQuery, filters, sortBy]);

  const loadUserAlbums = async () => {
    try {
      const userAlbums = await getUserAlbums();
      setAlbums(userAlbums);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดอัลบั้มได้",
        variant: "destructive"
      });
    }
  };

  const loadAlbumPhotos = async (albumId: string) => {
    try {
      const photos = await getAlbumPhotos(albumId);
      setAlbumPhotos(photos);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรูปภาพได้",
        variant: "destructive"
      });
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) return;

    try {
      const newAlbum = await createPhotoAlbum(albumName.trim());
      setAlbums(prev => [newAlbum, ...prev]);
      setSelectedAlbum(newAlbum);
      setAlbumName("");
      setShowCreateForm(false);
      
      toast({
        title: "สำเร็จ!",
        description: "สร้างอัลบั้มใหม่แล้ว"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างอัลบั้มได้",
        variant: "destructive"
      });
    }
  };

  // GSAP animations for drag enter/leave
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    if (dropRef.current) {
      gsap.to(dropRef.current, { 
        scale: 1.02, 
        boxShadow: "0 20px 60px rgba(251, 146, 60, 0.4)",
        borderColor: "#fb923c",
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dropRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
      
      if (dropRef.current) {
        gsap.to(dropRef.current, { 
          scale: 1, 
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          borderColor: "#e5e7eb",
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle file upload with real backend integration
  const uploadFiles = async (files: File[]) => {
    if (!selectedAlbum) {
      toast({
        title: "กรุณาเลือกอัลบั้ม",
        description: "ต้องเลือกอัลบั้มก่อนอัปโหลดรูป",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const newPhotos: AlbumPhoto[] = [];

    for (const file of files) {
      try {
        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Upload to storage
        const { path, url } = await uploadPhotoToStorage(file, selectedAlbum.id);
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));

        // Add to database
        const photo = await addPhotoToAlbum(selectedAlbum.id, file, path, url);
        newPhotos.push(photo);

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: `ไม่สามารถอัปโหลด ${file.name} ได้`,
          variant: "destructive"
        });
      }
    }

    // Update album photos
    if (newPhotos.length > 0) {
      setAlbumPhotos(prev => [...newPhotos, ...prev]);
      
      toast({
        title: "สำเร็จ!",
        description: `อัปโหลด ${newPhotos.length} รูปแล้ว`
      });

      // Animate new photos in
      setTimeout(() => {
        const newElements = gridRef.current?.querySelectorAll('.photo-item:first-child');
        if (newElements) {
          gsap.fromTo(newElements, 
            { scale: 0, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }
          );
        }
      }, 100);
    }

    setIsUploading(false);
    setUploadProgress({});
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (dropRef.current) {
      gsap.to(dropRef.current, { 
        scale: 1, 
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        borderColor: "#e5e7eb",
        duration: 0.3 
      });
    }

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      await uploadFiles(files);
    }

    e.target.value = '';
  };

  const handleDeletePhoto = async (photo: AlbumPhoto) => {
    try {
      await deletePhotoFromAlbum(photo.id, photo.storage_path);
      setAlbumPhotos(prev => prev.filter(p => p.id !== photo.id));
      
      toast({
        title: "สำเร็จ!",
        description: "ลบรูปภาพแล้ว"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรูปภาพได้",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAlbum = async (album: PhotoAlbum) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบอัลบั้ม "${album.name}"?`)) return;

    try {
      await deleteAlbum(album.id);
      setAlbums(prev => prev.filter(a => a.id !== album.id));
      
      if (selectedAlbum?.id === album.id) {
        setSelectedAlbum(null);
        setAlbumPhotos([]);
      }
      
      toast({
        title: "สำเร็จ!",
        description: "ลบอัลบั้มแล้ว"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบอัลบั้มได้",
        variant: "destructive"
      });
    }
  };

  const handlePhotoClick = (photo: AlbumPhoto, index: number) => {
    const photoIndex = filteredPhotos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(photoIndex);
    setIsViewerOpen(true);
  };

  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            Photo Album Glamour
          </h1>
          <p className="text-gray-600 text-lg">สร้างและจัดการอัลบั้มภาพสวยงามของคุณ</p>
        </div>
        <AuthButton />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent mb-4">
          Photo Album Glamour
        </h1>
        <p className="text-gray-600 text-lg">สร้างและจัดการอัลบั้มภาพสวยงามของคุณ</p>
      </div>

      {/* Auth Button */}
      <div className="mb-8">
        <AuthButton />
      </div>

      {/* Album Management */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">อัลบั้มของคุณ</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            สร้างอัลบั้มใหม่
          </button>
        </div>

        {/* Create Album Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateAlbum} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-4">
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="ชื่อของอัลบั้ม..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                สร้าง
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        )}

        {/* Albums Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {albums.map((album) => (
            <div
              key={album.id}
              className={cn(
                "p-4 bg-white rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedAlbum?.id === album.id && "ring-2 ring-orange-500 bg-orange-50"
              )}
              onClick={() => setSelectedAlbum(album)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 truncate">{album.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlbum(album);
                  }}
                  className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(album.created_at).toLocaleDateString('th-TH')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      {selectedAlbum && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              อัลบั้ม: {selectedAlbum.name}
            </h3>
          </div>

          <div
            ref={dropRef}
            className={cn(
              "relative flex flex-col items-center justify-center",
              "border-2 border-dashed border-gray-300 rounded-2xl py-16 px-8 mb-8",
              "bg-gradient-to-br from-white via-orange-50 to-amber-50",
              "transition-all duration-300 cursor-pointer group",
              "shadow-lg hover:shadow-xl",
              isDragging && "border-orange-400 bg-orange-100",
              isUploading && "pointer-events-none"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("photo-input")?.click()}
          >
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-orange-600 font-semibold text-xl">กำลังอัปโหลด...</p>
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="w-64 mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span className="truncate">{fileName}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="p-6 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {isDragging ? "วางรูปภาพที่นี่" : "ลากรูปภาพมาวาง"}
                </h3>
                <p className="text-gray-500 text-lg mb-4">หรือคลิกเพื่อเลือกไฟล์</p>
                <p className="text-sm text-gray-400">รองรับไฟล์ JPG, PNG, GIF (หลายไฟล์พร้อมกัน)</p>
              </>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 pointer-events-none"></div>
          </div>
        </>
      )}

      {/* Search and Filter */}
      {selectedAlbum && albumPhotos.length > 0 && (
        <SearchAndFilter
          onSearch={setSearchQuery}
          onFilter={setFilters}
          onSort={setSortBy}
          totalPhotos={albumPhotos.length}
          filteredPhotos={filteredPhotos.length}
        />
      )}

      {/* Photo Grid */}
      {selectedAlbum && filteredPhotos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            รูปภาพในอัลบั้ม ({filteredPhotos.length} รูป)
          </h2>
          <MasonryGrid
            photos={filteredPhotos}
            onPhotoClick={handlePhotoClick}
            onPhotoDelete={handleDeletePhoto}
          />
        </div>
      )}

      {/* Photo Viewer */}
      <PhotoViewer
        photos={filteredPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onNavigate={setCurrentPhotoIndex}
      />

      {/* Empty States */}
      {!selectedAlbum && albums.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-20">📸</div>
          <p className="text-gray-500 text-lg">ยังไม่มีอัลบั้ม</p>
          <p className="text-gray-400">เริ่มต้นด้วยการสร้างอัลบั้มแรกของคุณ</p>
        </div>
      )}

      {selectedAlbum && albumPhotos.length === 0 && !isUploading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-20">📷</div>
          <p className="text-gray-500 text-lg">ยังไม่มีรูปภาพในอัลบั้มนี้</p>
          <p className="text-gray-400">เริ่มต้นด้วยการอัปโหลดรูปภาพแรกของคุณ</p>
        </div>
      )}

      {selectedAlbum && filteredPhotos.length === 0 && albumPhotos.length > 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-20">🔍</div>
          <p className="text-gray-500 text-lg">ไม่พบรูปภาพที่ตรงกับการค้นหา</p>
          <p className="text-gray-400">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
        </div>
      )}
    </div>
  );
}

// Photo Preview Component
function PhotoPreview({ 
  photo, 
  onRemove 
}: { 
  photo: AlbumPhoto; 
  onRemove: () => void; 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const photoRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (photoRef.current) {
      gsap.to(photoRef.current, { 
        scale: 1.05, 
        rotationY: 5,
        z: 50,
        duration: 0.3, 
        ease: "power2.out" 
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (photoRef.current) {
      gsap.to(photoRef.current, { 
        scale: 1, 
        rotationY: 0,
        z: 0,
        duration: 0.3, 
        ease: "power2.out" 
      });
    }
  };

  return (
    <div
      ref={photoRef}
      className="photo-item relative group overflow-hidden rounded-xl shadow-lg bg-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={photo.upload_url}
          alt={photo.file_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
          "opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )}>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white font-semibold truncate">
              {photo.file_name}
            </p>
            <p className="text-white/80 text-sm">
              {(photo.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform rotate-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-700 pointer-events-none"></div>
      </div>
    </div>
  );
}
