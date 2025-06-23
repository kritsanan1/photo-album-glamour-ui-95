
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Share2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlbumPhoto } from '@/lib/photoAlbumApi';

interface PhotoViewerProps {
  photos: AlbumPhoto[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoViewer({ photos, currentIndex, isOpen, onClose, onNavigate }: PhotoViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      // Open animation
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(modalRef.current,
        { scale: 0.8, opacity: 0, rotationY: -15 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 0.5, ease: "back.out(1.2)" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset zoom and pan when photo changes
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [currentIndex]);

  const handleClose = () => {
    if (modalRef.current && overlayRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(modalRef.current, { 
        scale: 0.8, 
        opacity: 0, 
        rotationY: 15,
        duration: 0.3, 
        ease: "power2.in",
        onComplete: onClose
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      animateTransition(() => onNavigate(currentIndex - 1), 'left');
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      animateTransition(() => onNavigate(currentIndex + 1), 'right');
    }
  };

  const animateTransition = (callback: () => void, direction: 'left' | 'right') => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        x: direction === 'left' ? -100 : 100,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          callback();
          gsap.fromTo(imageRef.current,
            { x: direction === 'left' ? 100 : -100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
          );
        }
      });
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.5, 4);
    setZoom(newZoom);
    if (imageRef.current) {
      gsap.to(imageRef.current, { scale: newZoom, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.5, 0.5);
    setZoom(newZoom);
    if (imageRef.current) {
      gsap.to(imageRef.current, { scale: newZoom, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPan(newPan);
      if (imageRef.current) {
        gsap.set(imageRef.current, { x: newPan.x, y: newPan.y });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, zoom]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative max-w-7xl max-h-screen p-4 w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 text-white">
          <div>
            <h3 className="text-lg font-semibold">{currentPhoto.file_name}</h3>
            <p className="text-sm text-white/70">
              {currentIndex + 1} of {photos.length} • {(currentPhoto.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden rounded-lg">
          <img
            ref={imageRef}
            src={currentPhoto.upload_url}
            alt={currentPhoto.file_name}
            className={cn(
              "max-w-full max-h-full object-contain transition-transform duration-300",
              zoom > 1 && isDragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            draggable={false}
          />

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < photos.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => onNavigate(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                index === currentIndex 
                  ? "border-white shadow-lg scale-110" 
                  : "border-white/30 hover:border-white/60"
              )}
            >
              <img
                src={photo.upload_url}
                alt={photo.file_name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
