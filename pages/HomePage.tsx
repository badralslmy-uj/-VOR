import React from 'react';
import Hero from '../components/Hero';
import AnimeCarousel from '../components/AnimeCarousel';
import AiringCarousel from '../components/AiringCarousel';
import TopSeasonBlock from '../components/TopSeasonBlock';
import StreamingNowCarousel from '../components/StreamingNowCarousel';
import type { Page, Media, HeroSlideData, AiringSchedule } from '../types';

interface HomePageProps {
  heroMedia: HeroSlideData[];
  todayAiringMedia: Media[];
  streamingNowSchedules: AiringSchedule[];
  tomorrowAiringMedia: Media[];
  top5SeasonMedia: Media[];
  trendingMedia: Media[];
  popularSeasonRest: Media[];
  nextSeasonData: Page | null;
  allTimePopularData: Page | null;
  nextSeason: { season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'; year: number };
  onCardClick: (media: Media) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  heroMedia,
  todayAiringMedia,
  streamingNowSchedules,
  tomorrowAiringMedia,
  top5SeasonMedia,
  trendingMedia,
  popularSeasonRest,
  nextSeasonData,
  allTimePopularData,
  nextSeason,
  onCardClick
}) => {
  return (
    <>
      <Hero slidesData={heroMedia} className="animate-fade-in-up" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {todayAiringMedia.length > 0 && <AiringCarousel title="Airing Today" media={todayAiringMedia} onCardClick={onCardClick} className="animate-fade-in-up delay-200" />}
        {streamingNowSchedules.length > 0 && <StreamingNowCarousel title="Streaming Now" schedules={streamingNowSchedules} onCardClick={onCardClick} className="animate-fade-in-up delay-200" />}
        {tomorrowAiringMedia.length > 0 && <AiringCarousel title="Airing Tomorrow" media={tomorrowAiringMedia} onCardClick={onCardClick} className="animate-fade-in-up delay-200" />}
        {top5SeasonMedia.length === 5 && <TopSeasonBlock title="Top 5 This Season" media={top5SeasonMedia} onCardClick={onCardClick} className="animate-fade-in-up delay-400" />}
        {trendingMedia.length > 0 && <AnimeCarousel title="Trending Now" media={trendingMedia} onCardClick={onCardClick} className="animate-fade-in-up delay-200" />}
        {popularSeasonRest.length > 0 && <AnimeCarousel title={`Popular This Season`} media={popularSeasonRest} onCardClick={onCardClick} className="animate-fade-in-up delay-400" />}
        {nextSeasonData?.media && nextSeasonData.media.length > 0 && <AnimeCarousel title={`Upcoming Next Season (${nextSeason.season})`} media={nextSeasonData.media} onCardClick={onCardClick} className="animate-fade-in-up delay-600" />}
        {allTimePopularData?.media && allTimePopularData.media.length > 0 && <AnimeCarousel title="All Time Popular" media={allTimePopularData.media} onCardClick={onCardClick} className="animate-fade-in-up delay-600" />}
      </div>
    </>
  );
};

export default HomePage;