import React from 'react';
import type { Media } from '../types';
import TopSeasonCard from './TopSeasonCard';

interface TopSeasonBlockProps {
  title: string;
  media: Media[];
  className?: string;
  onCardClick: (media: Media) => void;
}

const TopSeasonBlock: React.FC<TopSeasonBlockProps> = ({ title, media, className, onCardClick }) => {
  if (!media || media.length < 5) return null;

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <h3 className="text-2xl font-bold text-white px-2">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6">
        {media.slice(0, 5).map((item, index) => (
          <TopSeasonCard
            key={item.id}
            media={item}
            rank={index + 1}
            isLarge={index === 0}
            onClick={() => onCardClick(item)}
            className={
              index === 0
                ? 'col-span-2 aspect-video md:aspect-auto md:row-span-2'
                : 'col-span-1 aspect-[4/3] md:aspect-video'
            }
          />
        ))}
      </div>
    </div>
  );
};

export default TopSeasonBlock;