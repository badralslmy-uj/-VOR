import React from 'react';
import type { Media } from '../types';

const UpcomingAnimeCard: React.FC<{ media: Media, onClick: () => void }> = ({ media, onClick }) => {
  const cardColor = media.coverImage.color || '#4f46e5';
  const imageUrl = media.coverImage.large;
  const daysUntilAiring = media.nextAiringEpisode ? Math.ceil(media.nextAiringEpisode.timeUntilAiring / (60 * 60 * 24)) : null;

  return (
    <button onClick={onClick} className="group space-y-2 text-left">
      <div 
        className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 card-glow"
        style={{'--card-color': cardColor} as React.CSSProperties}
      >
         <img src={imageUrl} alt={media.title.romaji} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
         {daysUntilAiring !== null && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F]/80 via-transparent to-transparent flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-center">
                    <p className="text-3xl font-black text-white">{daysUntilAiring}</p>
                    <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{daysUntilAiring === 1 ? 'Day' : 'Days'}</p>
                </div>
            </div>
         )}
      </div>

      <div className="pt-1">
        <h4 className="text-white font-semibold text-sm pr-2 line-clamp-2 transition-colors group-hover:text-theme">
            {media.title.english || media.title.romaji}
        </h4>
        <p className="text-xs text-gray-400 mt-1 capitalize">
            {media.season?.toLowerCase()} {media.seasonYear}
        </p>
      </div>
    </button>
  );
};

export default UpcomingAnimeCard;
