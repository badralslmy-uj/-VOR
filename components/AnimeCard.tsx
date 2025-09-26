import React from 'react';
import type { Media } from '../types';

interface AnimeCardProps {
  media: Media;
  onClick: () => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ media, onClick }) => {
  const cardColor = media.coverImage.color || '#4f46e5';
  const studioName = media.studios.edges[0]?.node.name || '';
  
  const imageUrl = media.coverImage.large;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-36 sm:w-40 md:w-48 text-left group"
    >
      <div 
        className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 card-glow"
        style={{'--card-color': cardColor} as React.CSSProperties}
      >
         <div className="absolute inset-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] z-10"></div>
         <img src={imageUrl} alt={media.title.romaji} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F]/80 to-transparent z-10"></div>
      </div>

      <div className="pt-3">
        <h4 className="text-white font-semibold text-sm pr-2 line-clamp-2 transition-colors group-hover:text-theme">{media.title.english || media.title.romaji}</h4>
        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
           {media.averageScore && <span className="font-semibold text-green-400">{media.averageScore}%</span>}
           {media.averageScore && studioName && <span>&bull;</span>}
           {studioName && <span>{studioName}</span>}
        </div>
      </div>
    </button>
  );
};

export default AnimeCard;
