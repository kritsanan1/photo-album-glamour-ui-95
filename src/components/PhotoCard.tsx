
import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { X, Heart, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlbumPhoto } from '@/lib/photoAlbumApi';

interface PhotoCardProps {
  photo: AlbumPhoto;
  onClick: () => void;
  onDelete: () => void;
  className?: string;
}

export default function PhotoCard({ photo, onClick, onDelete, className }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current && overlayRef.current) {
      gsap.to(cardRef.current, { 
        scale: 1.02,
        y: -8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        duration: 0.4, 
        ease: "power2.out" 
      });
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current && overlayRef.current) {
      gsap.to(cardRef.current, { 
        scale: 1,
        y: 0,
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        duration: 0.4, 
        ease: "power2.out" 
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(photo.upload_url);
    // Show toast notification here
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = photo.upload_url;
    link.download = photo.file_name;
    link.click();
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-xl bg-white shadow-md",
        "transition-all duration-300",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ perspective: "1000px" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        <img
          src={photo.upload_url}
          alt={photo.file_name}
          className={cn(
            "w-full h-auto object-cover transition-all duration-700",
            isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          )}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
        
        {/* Overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0"
        >
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleLike}
              className={cn(
                "p-2 rounded-full backdrop-blur-md transition-all duration-200",
                isLiked 
                  ? "bg-red-500 text-white" 
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all duration-200"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-md transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-medium text-sm truncate mb-1">
              {photo.file_name}
            </p>
            <p className="text-white/80 text-xs">
              {(photo.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 pointer-events-none"></div>
      </div>
    </div>
  );
}
