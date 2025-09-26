import React from 'react';
import AiringAnimeCard from './AiringAnimeCard';
import type { Media } from '../types';

interface AiringCarouselProps {
  title: string;
  media: Media[];
  className?: string;
  onCardClick: (media: Media) => void;
}

const AiringCarousel: React.FC<AiringCarouselProps> = ({ title, media, className, onCardClick }) => {
  return (
    <div className={`space-y-4 ${className || ''}`}>
      <h3 className="text-2xl font-bold text-white px-2">{title}</h3>
      <div className="relative">
        <div className="flex overflow-x-auto space-x-4 md:space-x-6 py-4 scrollbar-hide -mx-2 px-2">
          {media.map((item) => (
            <AiringAnimeCard key={item.id} media={item} onClick={() => onCardClick(item)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiringCarousel;