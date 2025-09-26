import React, { useState, useMemo } from 'react';
import type { Page, Media, AiringSchedule } from '../types';
import { SearchIcon } from '../components/icons/SearchIcon';
import UpcomingAnimeCard from '../components/UpcomingAnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import UpcomingEpisodeGridCard from '../components/UpcomingEpisodeGridCard';
import DailyScheduleGridCard from '../components/DailyScheduleGridCard';

interface SchedulePageProps {
  releasingData: Page | null;
  nextSeasonData: Page | null;
  loading: boolean;
  onCardClick: (media: Media) => void;
}

type ViewType = 'daily' | 'episodes' | 'animes';

const SchedulePage: React.FC<SchedulePageProps> = ({ releasingData, nextSeasonData, loading, onCardClick }) => {
  const [view, setView] = useState<ViewType>('daily');
  const [searchQuery, setSearchQuery] = useState('');

  const upcomingEpisodes = useMemo(() => {
    if (!releasingData?.media) return [];
    return releasingData.media
      .filter((m): m is Media & { nextAiringEpisode: NonNullable<Media['nextAiringEpisode']> } => !!m.nextAiringEpisode?.timeUntilAiring && m.nextAiringEpisode.timeUntilAiring > 0)
      .sort((a, b) => a.nextAiringEpisode.timeUntilAiring - b.nextAiringEpisode.timeUntilAiring);
  }, [releasingData]);

  const dailySchedule = useMemo(() => {
    if (!upcomingEpisodes) return [];

    const groupedByDay = upcomingEpisodes.reduce((acc, media) => {
      const airingAt = (Date.now() / 1000) + media.nextAiringEpisode.timeUntilAiring;
      const airingDate = new Date(airingAt * 1000);
      const dayKey = airingDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      const schedule: AiringSchedule = {
          id: media.id,
          airingAt: airingAt,
          episode: media.nextAiringEpisode.episode,
          media: media
      };

      if (!acc[dayKey]) {
          acc[dayKey] = [];
      }
      acc[dayKey].push(schedule);
      return acc;
    }, {} as Record<string, AiringSchedule[]>);
    
    const today = new Date();
    const sortedDays: [string, AiringSchedule[]][] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (groupedByDay[dayKey]) {
            const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayKey;
            sortedDays.push([dayLabel, groupedByDay[dayKey]]);
        }
    }

    return sortedDays;
  }, [upcomingEpisodes]);

  const upcomingAnimes = useMemo(() => {
    if (!nextSeasonData?.media) return [];
    return nextSeasonData.media
        .filter((m): m is Media => m.status === 'NOT_YET_RELEASED')
        .sort((a, b) => (a.nextAiringEpisode?.timeUntilAiring ?? Infinity) - (b.nextAiringEpisode?.timeUntilAiring ?? Infinity));
  }, [nextSeasonData]);

  const filteredDailySchedule = useMemo(() => {
    if (!searchQuery) return dailySchedule;
    return dailySchedule.map(([day, schedules]) => {
      const filteredSchedules = schedules.filter(s =>
        (s.media.title.english?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.media.title.romaji?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return [day, filteredSchedules];
    }).filter(([, schedules]) => schedules.length > 0) as [string, AiringSchedule[]][];
  }, [searchQuery, dailySchedule]);

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery) return upcomingEpisodes;
    return upcomingEpisodes.filter(m =>
      (m.title.english?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.title.romaji?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, upcomingEpisodes]);

  const filteredAnimes = useMemo(() => {
    if (!searchQuery) return upcomingAnimes;
    return upcomingAnimes.filter(m =>
      (m.title.english?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.title.romaji?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, upcomingAnimes]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      );
    }

    if (view === 'daily') {
        if (filteredDailySchedule.length === 0) {
            return <div className="text-center py-20 text-gray-400"><p>No anime airing in the next 7 days matching your search.</p></div>;
        }
        return (
            <div className="space-y-12">
                {filteredDailySchedule.map(([day, schedules]) => (
                    <div key={day}>
                        <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b-2 border-gray-800">{day}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-5 gap-y-8">
                            {schedules.map(schedule => <DailyScheduleGridCard key={`${schedule.id}-${schedule.episode}`} schedule={schedule} onClick={() => onCardClick(schedule.media)} />)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (view === 'episodes') {
      if (filteredEpisodes.length === 0) {
        return <div className="text-center py-20 text-gray-400"><p>No upcoming episodes found.</p></div>;
      }
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-5 gap-y-8">
          {filteredEpisodes.map(media => <UpcomingEpisodeGridCard key={media.id} media={media} onClick={() => onCardClick(media)} />)}
        </div>
      );
    }

    if (view === 'animes') {
        if (filteredAnimes.length === 0) {
          return <div className="text-center py-20 text-gray-400"><p>No upcoming anime found for next season.</p></div>;
        }
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredAnimes.map(media => <UpcomingAnimeCard key={media.id} media={media} onClick={() => onCardClick(media)} />)}
          </div>
        );
      }
  };

  const viewTitles: Record<ViewType, string> = {
    daily: 'Daily Schedule',
    episodes: 'Upcoming Episodes',
    animes: 'Upcoming Animes',
  };
  
  const backgroundStyle = {
      background: `radial-gradient(ellipse 80% 50% at 50% -20%, var(--theme-color-glow), transparent)`
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 transition-all duration-500 pointer-events-none" style={backgroundStyle}></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white mb-8">Schedule</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime..."
              className="w-full bg-gray-900/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus-ring-theme transition"
            />
          </div>

          {/* View Switcher Buttons */}
          <div className="flex-shrink-0 flex items-center bg-gray-900/50 border border-white/10 rounded-lg p-1 space-x-1">
            {(Object.keys(viewTitles) as ViewType[]).map(key => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${
                  view === key
                    ? 'bg-theme text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {viewTitles[key]}
              </button>
            ))}
          </div>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default SchedulePage;