
import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { Upload, X, ZoomIn, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Photo = {
  file: File;
  url: string;
  id: string;
};

export default function PhotoAlbumUploader() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
    
    // Only trigger when leaving the drop zone completely
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

  // Handle file drop with animation
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsUploading(true);

    // Reset drop zone styling
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

    const newPhotos: Photo[] = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    // Simulate upload delay for demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPhotos(prev => [...prev, ...newPhotos]);
    setIsUploading(false);

    // Animate new photos in
    setTimeout(() => {
      const newElements = gridRef.current?.querySelectorAll('.photo-item:last-child');
      if (newElements) {
        gsap.fromTo(newElements, 
          { scale: 0, opacity: 0, rotationY: 180 },
          { scale: 1, opacity: 1, rotationY: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
        );
      }
    }, 100);
  };

  // Handle file input change
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) return;

    setIsUploading(true);

    const newPhotos: Photo[] = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPhotos(prev => [...prev, ...newPhotos]);
    setIsUploading(false);

    // Animate new photos in
    setTimeout(() => {
      const photoItems = gridRef.current?.querySelectorAll('.photo-item');
      if (photoItems) {
        const newItems = Array.from(photoItems).slice(-newPhotos.length);
        gsap.fromTo(newItems, 
          { scale: 0, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }
        );
      }
    }, 100);

    // Clear input
    e.target.value = '';
  };

  // Remove photo with animation
  const removePhoto = (id: string) => {
    const photoElement = document.querySelector(`[data-photo-id="${id}"]`);
    if (photoElement) {
      gsap.to(photoElement, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setPhotos(prev => prev.filter(photo => photo.id !== id));
        }
      });
    }
  };

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.url));
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent mb-4">
          Photo Album Glamour
        </h1>
        <p className="text-gray-600 text-lg">สร้างอัลบั้มภาพสวยงามด้วยการลากวางหรือคลิกเพื่อเลือกรูป</p>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropRef}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "border-2 border-dashed border-gray-300 rounded-2xl py-16 px-8 mb-12",
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

        {/* Glamour overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 pointer-events-none"></div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            อัลบั้มภาพของคุณ ({photos.length} รูป)
          </h2>
          <div 
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {photos.map((photo, idx) => (
              <PhotoPreview 
                key={photo.id}
                photo={photo} 
                index={idx}
                onRemove={removePhoto}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !isUploading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-20">📸</div>
          <p className="text-gray-500 text-lg">ยังไม่มีรูปภาพในอัลบั้ม</p>
          <p className="text-gray-400">เริ่มต้นด้วยการอัปโหลดรูปภาพแรกของคุณ</p>
        </div>
      )}
    </div>
  );
}

// Photo Preview Component
function PhotoPreview({ 
  photo, 
  index, 
  onRemove 
}: { 
  photo: Photo; 
  index: number; 
  onRemove: (id: string) => void; 
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
      data-photo-id={photo.id}
      className="photo-item relative group overflow-hidden rounded-xl shadow-lg bg-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={photo.url}
          alt={`Photo ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
          "opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )}>
          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(photo.id);
              }}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Photo info */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white font-semibold truncate">
              {photo.file.name}
            </p>
            <p className="text-white/80 text-sm">
              {(photo.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        {/* Glamour shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform rotate-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-700 pointer-events-none"></div>
      </div>
    </div>
  );
}
