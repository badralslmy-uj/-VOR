import React from 'react';
import type { Media } from '../types';
import Countdown from './Countdown';

interface AiringAnimeCardProps {
  media: Media;
  onClick: () => void;
}

const AiringAnimeCard: React.FC<AiringAnimeCardProps> = ({ media, onClick }) => {
  const cardColor = media.coverImage.color || '#4f46e5';
  const imageUrl = media.coverImage.extraLarge || media.coverImage.large;
  
  if (!media.nextAiringEpisode) return null;

  return (
    <button 
        onClick={onClick}
        className="flex-shrink-0 w-80 sm:w-96 h-40 bg-gray-900/50 rounded-lg overflow-hidden card-glow backdrop-blur-sm border border-white/10 text-left"
        style={{'--card-color': cardColor} as React.CSSProperties}
    >
      <div className="flex h-full">
        <div className="w-1/3 h-full flex-shrink-0">
          <img src={imageUrl} alt={media.title.romaji} className="w-full h-full object-cover" />
        </div>
        <div className="w-2/3 h-full flex flex-col justify-center p-4">
          <h4 className="text-white font-bold text-base line-clamp-2 leading-tight">
            {media.title.english || media.title.romaji}
          </h4>
          <p className="text-sm text-gray-400 mt-1">
            Episode {media.nextAiringEpisode.episode}
          </p>
          <div className="mt-auto">
            <Countdown initialTime={media.nextAiringEpisode.timeUntilAiring} size="small" />
          </div>
        </div>
      </div>
    </button>
  );
};

export default AiringAnimeCard;