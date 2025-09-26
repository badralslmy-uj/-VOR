
import React from 'react';
import type { Media } from '../types';
import Countdown from './Countdown';

const UpcomingEpisodeCard: React.FC<{ media: Media & { nextAiringEpisode: NonNullable<Media['nextAiringEpisode']> } }> = ({ media }) => {
  const cardColor = media.coverImage.color || '#4f46e5';

  return (
    <div 
      className="flex items-center gap-4 p-3 rounded-lg bg-gray-900/50 border border-transparent hover:border-white/10 hover:bg-gray-900 transition-all duration-300 transform hover:-translate-y-1 group card-glow"
      style={{'--card-color': cardColor} as React.CSSProperties}
    >
      <div className="w-16 sm:w-20 flex-shrink-0">
        <img src={media.coverImage.large} alt={media.title.romaji} className="w-full aspect-[2/3] object-cover rounded-md shadow-md" />
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-white truncate group-hover:text-purple-400 transition-colors text-base sm:text-lg">
          {media.title.english || media.title.romaji}
        </h3>
        <p className="text-sm text-gray-400">
          Episode {media.nextAiringEpisode.episode}
        </p>
         <p className="text-xs text-gray-500 sm:hidden truncate">{media.studios?.edges?.[0]?.node.name || ''}</p>
      </div>
       <div className="hidden sm:block flex-shrink-0 text-right">
         <p className="text-sm font-semibold text-gray-300">{media.studios?.edges?.[0]?.node.name || ''}</p>
      </div>
      <div className="flex-shrink-0 w-48 md:w-64">
        <Countdown initialTime={media.nextAiringEpisode.timeUntilAiring} size="small" />
      </div>
    </div>
  );
};

export default UpcomingEpisodeCard;
