import React from 'react';
import type { AiringSchedule } from '../types';
import { getStreamingInfo } from '../services/streamingService';
import { PlayIcon } from './icons/PlayIcon';

const DailyScheduleGridCard: React.FC<{ schedule: AiringSchedule, onClick: () => void }> = ({ schedule, onClick }) => {
  const { media, episode, airingAt } = schedule;
  const cardColor = media.coverImage.color || '#4f46e5';
  const imageUrl = media.coverImage.large;
  const streamingInfo = getStreamingInfo(media);

  const airingTime = new Date(airingAt * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <button 
      onClick={onClick}
      className="group relative block aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 card-glow w-full text-left"
      style={{'--card-color': cardColor} as React.CSSProperties}
    >
      <img src={imageUrl} alt={media.title.romaji} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      
      {/* Play icon on hover */}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-white" />
          </div>
      </div>
      
      {/* Top Badges */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-20">
          <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
              {airingTime}
          </div>
          <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Ep {episode}
          </div>
      </div>
      
      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0B0B0F]/95 via-[#0B0B0F]/50 to-transparent z-20">
          <h4 className="text-white font-semibold text-sm leading-tight pr-1 line-clamp-2 transition-colors group-hover:text-theme">
              {media.title.english || media.title.romaji}
          </h4>
          {streamingInfo && (
              <div 
                className="text-[10px] font-bold px-1.5 py-0.5 mt-1 rounded inline-block"
                style={{ backgroundColor: streamingInfo.color, color: '#fff', textShadow: '1px 1px 1px rgba(0,0,0,0.4)' }}
              >
                {streamingInfo.name}
              </div>
          )}
      </div>
    </button>
  );
};

export default DailyScheduleGridCard;
