import React from 'react';
import type { AiringSchedule } from '../types';
import { getStreamingInfo } from '../services/streamingService';

const ScheduleCard: React.FC<{ schedule: AiringSchedule }> = ({ schedule }) => {
  const { media, episode, airingAt } = schedule;
  const streamingInfo = getStreamingInfo(media);
  
  const airingTime = new Date(airingAt * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <a href="#" className="flex items-center gap-4 p-3 rounded-lg bg-gray-900/50 border border-transparent hover:border-white/10 hover:bg-gray-900 transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="w-14 sm:w-16 flex-shrink-0">
        <img src={media.coverImage.large} alt={media.title.romaji} className="w-full aspect-[2/3] object-cover rounded-md shadow-md" />
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-white truncate group-hover:text-purple-400 transition-colors">{media.title.english || media.title.romaji}</h3>
        <p className="text-sm text-gray-400">Episode {episode}</p>
      </div>
      <div className="hidden sm:block flex-shrink-0">
        {streamingInfo && (
            <div 
              className="text-xs font-bold px-2 py-0.5 mt-1 rounded inline-block"
              style={{ backgroundColor: streamingInfo.color, color: '#fff', textShadow: '1px 1px 1px rgba(0,0,0,0.4)' }}
            >
              {streamingInfo.name}
            </div>
        )}
      </div>
      <div className="flex-shrink-0 text-right w-24">
        <p className="text-base sm:text-lg font-semibold text-white">{airingTime}</p>
        <p className="text-xs text-gray-500 truncate">{media.studios?.edges?.[0]?.node.name || ''}</p>
      </div>
    </a>
  );
};

export default ScheduleCard;
