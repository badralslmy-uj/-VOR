import React from 'react';
import type { AiringSchedule } from '../types';
import { getStreamingInfo } from '../services/streamingService';
import { PlayIcon } from './icons/PlayIcon';
import { useFanartImages } from '../hooks/useFanartImages';

interface StreamingNowCardProps {
  schedule: AiringSchedule;
  onClick: () => void;
}

const formatTimeSince = (airingAt: number): string => {
  const seconds = Math.floor(Date.now() / 1000) - airingAt;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const StreamingNowCard: React.FC<StreamingNowCardProps> = ({ schedule, onClick }) => {
  const { media, episode, airingAt } = schedule;
  const { fanartData } = useFanartImages(media);
  const streamingInfo = getStreamingInfo(media);
  const cardColor = media.coverImage.color || '#4f46e5';
  
  // Prioritize Fanart.tv banner, then AniList banner, then AniList cover.
  const imageUrl = fanartData?.bannerUrl || media.bannerImage || media.coverImage.extraLarge;
  const timeSince = formatTimeSince(airingAt);

  // If for some reason we have no image, don't render the card.
  if (!imageUrl) {
      return null;
  }

  return (
    <button 
        onClick={onClick}
        className="flex-shrink-0 w-80 sm:w-[350px] h-[200px] group relative rounded-lg overflow-hidden bg-gray-900/80 backdrop-blur-sm border border-white/10 card-glow text-left"
        style={{'--card-color': cardColor} as React.CSSProperties}
        aria-label={`Play ${media.title.romaji}, Episode ${episode}`}
    >
      {/* Image Section */}
      <div className="relative w-full h-[60%]">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Episode Badge */}
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
          Episode {episode}
        </div>
        
        {/* Play icon on hover */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="w-full h-[40%] flex flex-col justify-between p-3">
        <div>
          <h4 className="text-white font-bold text-sm line-clamp-2 leading-tight">
            {media.title.english || media.title.romaji}
          </h4>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400 font-medium">Aired {timeSince}</p>
          {streamingInfo && (
            <div 
              className="text-xs font-bold px-2 py-1 rounded"
              style={{ backgroundColor: streamingInfo.color, color: '#fff', textShadow: '1px 1px 1px rgba(0,0,0,0.4)' }}
            >
              {streamingInfo.name}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default StreamingNowCard;