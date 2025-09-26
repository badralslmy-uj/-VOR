import React from 'react';
import type { Media } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { useFanartImages } from '../hooks/useFanartImages';

interface TopSeasonCardProps {
  media: Media;
  rank: number;
  isLarge?: boolean;
  className?: string;
  onClick: () => void;
}

const TopSeasonCard: React.FC<TopSeasonCardProps> = ({ media, rank, isLarge = false, className, onClick }) => {
  const { fanartData } = useFanartImages(media);
  const cardColor = media.coverImage.color || '#4f46e5';
  
  const imageUrl = fanartData?.bannerUrl || media.bannerImage || media.coverImage.extraLarge;

  return (
    <button 
      onClick={onClick}
      className={`relative rounded-lg overflow-hidden group card-glow block bg-gray-900 text-left ${className}`}
      style={{'--card-color': cardColor} as React.CSSProperties}
    >
      {imageUrl && <img src={imageUrl} alt={media.title.romaji} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:bg-black/50 transition-colors"></div>
      
      {/* Play icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
            <PlayIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
      </div>

      <div className="absolute top-2 left-2 md:top-4 md:left-4">
        <div className={`bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center ${isLarge ? 'w-12 h-12' : 'w-10 h-10'}`}>
          <span className={`font-black text-white text-gradient ${isLarge ? 'text-2xl' : 'text-xl'}`}>#{rank}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
        <h4 className={`font-bold text-white leading-tight drop-shadow-md ${isLarge ? 'text-lg md:text-2xl line-clamp-2' : 'text-sm md:text-base line-clamp-2'}`}>
          {media.title.english || media.title.romaji}
        </h4>
        {isLarge && (
          <div className="hidden md:flex items-center space-x-2 text-xs text-gray-300 mt-2">
           {media.averageScore && <span className="font-semibold text-green-400">{media.averageScore}% Score</span>}
           {media.averageScore && media.genres[0] && <span>&bull;</span>}
           {media.genres[0] && <span>{media.genres[0]}</span>}
          </div>
        )}
      </div>
    </button>
  );
};

export default TopSeasonCard;