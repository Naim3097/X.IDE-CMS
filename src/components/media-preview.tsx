'use client';

import { useState } from 'react';
import { MediaItem } from '@/lib/types';
import { ChevronLeft, ChevronRight, ImageIcon, Play, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaPreviewProps {
  media?: MediaItem[];
  visualHeadline?: string;
  className?: string;
}

export function MediaPreview({ media, visualHeadline, className = '' }: MediaPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div className={`w-full h-full bg-secondary/30 flex items-center justify-center relative ${className}`}>
        {visualHeadline ? (
          <div className="p-4 text-center">
            <p className="font-bold text-sm text-foreground">{visualHeadline}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground/50">
            <ImageIcon className="w-8 h-8 mb-1" />
            <span className="text-xs">No Preview</span>
          </div>
        )}
      </div>
    );
  }

  const currentItem = media[currentIndex];
  const isMultiple = media.length > 1;

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className={`w-full h-full bg-black relative group overflow-hidden ${className}`}>
      {currentItem.type === 'video' ? (
        <video 
          src={currentItem.url} 
          className="w-full h-full object-contain" 
          controls 
          playsInline
        />
      ) : (
        <img 
          src={currentItem.url} 
          alt={`Slide ${currentIndex + 1}`} 
          className="w-full h-full object-contain" 
        />
      )}

      {/* Carousel Controls */}
      {isMultiple && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-none pointer-events-auto"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-none pointer-events-auto"
              onClick={nextSlide}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Indicators */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {media.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${
                  idx === currentIndex ? 'bg-white scale-110' : 'bg-white/50'
                }`} 
              />
            ))}
          </div>
          
          {/* Type Badge */}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
            {currentItem.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
            <span>{currentIndex + 1}/{media.length}</span>
          </div>
        </>
      )}
    </div>
  );
}
