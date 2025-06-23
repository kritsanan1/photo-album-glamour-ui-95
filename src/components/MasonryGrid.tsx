
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlbumPhoto } from '@/lib/photoAlbumApi';
import PhotoCard from './PhotoCard';

gsap.registerPlugin(ScrollTrigger);

interface MasonryGridProps {
  photos: AlbumPhoto[];
  onPhotoClick: (photo: AlbumPhoto, index: number) => void;
  onPhotoDelete: (photo: AlbumPhoto) => void;
}

export default function MasonryGrid({ photos, onPhotoClick, onPhotoDelete }: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(2);
      else if (width < 768) setColumns(3);
      else if (width < 1024) setColumns(4);
      else setColumns(5);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  useEffect(() => {
    if (!gridRef.current || photos.length === 0) return;

    const ctx = gsap.context(() => {
      // Animate photos in with staggered reveals
      gsap.fromTo('.masonry-item', 
        { 
          opacity: 0, 
          y: 60,
          scale: 0.8,
          rotationX: -15
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 0.8,
          stagger: {
            amount: 1.2,
            grid: [columns, Math.ceil(photos.length / columns)],
            from: "start"
          },
          ease: "power3.out"
        }
      );

      // Add scroll-triggered animations
      ScrollTrigger.batch('.masonry-item', {
        onEnter: (elements) => {
          gsap.fromTo(elements, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
          );
        },
        start: "top 90%",
        refreshPriority: -1
      });
    }, gridRef);

    return () => ctx.revert();
  }, [photos, columns]);

  // Create column arrays
  const photoColumns: AlbumPhoto[][] = Array.from({ length: columns }, () => []);
  photos.forEach((photo, index) => {
    photoColumns[index % columns].push(photo);
  });

  return (
    <div 
      ref={gridRef}
      className="grid gap-4 px-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {photoColumns.map((columnPhotos, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {columnPhotos.map((photo, photoIndex) => {
            const globalIndex = columnIndex + photoIndex * columns;
            return (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => onPhotoClick(photo, globalIndex)}
                onDelete={() => onPhotoDelete(photo)}
                className="masonry-item"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
