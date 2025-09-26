import React from 'react';
import type { Media } from '../types';
import Countdown from './Countdown';
import { PlayIcon } from './icons/PlayIcon';

const UpcomingEpisodeGridCard: React.FC<{ media: Media & { nextAiringEpisode: NonNullable<Media['nextAiringEpisode']> }, onClick: () => void }> = ({ media, onClick }) => {
  const cardColor = media.coverImage.color || '#4f46e5';
  const imageUrl = media.coverImage.large;

  return (
    <div className="group">
      <button 
        onClick={onClick}
        className="relative block aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 card-glow w-full"
        style={{'--card-color': cardColor} as React.CSSProperties}
      >
        <img src={imageUrl} alt={media.title.romaji} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F]/95 via-[#0B0B0F]/50 to-transparent"></div>
        
        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-white" />
            </div>
        </div>
        
        {/* Episode Badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          Ep {media.nextAiringEpisode.episode}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2">
            <Countdown initialTime={media.nextAiringEpisode.timeUntilAiring} size="small" />
        </div>
      </button>

      <div className="pt-2">
        <h4 className="text-white font-semibold text-xs leading-snug pr-1 line-clamp-2 transition-colors group-hover:text-theme">
            {media.title.english || media.title.romaji}
        </h4>
      </div>
    </div>
  );
};

export default UpcomingEpisodeGridCard;
