import React from 'react';
import type { Media } from '../types';

interface GridCardProps {
  media: Media;
  onClick: () => void;
}

const GridCard: React.FC<GridCardProps> = ({ media, onClick }) => {
  return (
    <button onClick={onClick} className="group space-y-2 text-left">
      <div className="aspect-[2/3] bg-gray-800 rounded-md overflow-hidden relative">
        <img 
          src={media.coverImage.large} 
          alt={media.title.romaji} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
      </div>
      <p className="font-semibold text-white text-sm line-clamp-2 transition-colors group-hover:text-theme">
        {media.title.english || media.title.romaji}
      </p>
    </button>
  );
};

export default GridCard;
