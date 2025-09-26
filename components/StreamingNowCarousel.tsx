import React from 'react';
import StreamingNowCard from './StreamingNowCard';
import type { AiringSchedule, Media } from '../types';

interface StreamingNowCarouselProps {
  title: string;
  schedules: AiringSchedule[];
  className?: string;
  onCardClick: (media: Media) => void;
}

const StreamingNowCarousel: React.FC<StreamingNowCarouselProps> = ({ title, schedules, className, onCardClick }) => {
  return (
    <div className={`space-y-4 ${className || ''}`}>
      <h3 className="text-2xl font-bold text-white px-2">{title}</h3>
      <div className="relative">
        <div className="flex overflow-x-auto space-x-4 md:space-x-6 py-4 scrollbar-hide -mx-2 px-2">
          {schedules.map((schedule) => (
            <StreamingNowCard key={schedule.id} schedule={schedule} onClick={() => onCardClick(schedule.media)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreamingNowCarousel;