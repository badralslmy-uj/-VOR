import React, { useMemo, useState, useEffect } from 'react';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import ConfigurationPage from './components/ConfigurationPage';
import MobileFooter from './components/MobileFooter';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import MyListPage from './pages/MyListPage';
import AccountPage from './pages/AccountPage';
import SearchPage from './pages/SearchPage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import { useAnilistQuery } from './hooks/useAnilistQuery';
import { useSimpleRouter } from './hooks/useSimpleRouter';
import { usePrefetchHeroImages } from './hooks/usePrefetchHeroImages';
import { trendingQuery, popularSeasonQuery, nextSeasonQuery, allTimePopularQuery, releasingQuery, recentlyAiredQuery } from './services/anilistService';
import { getCache } from './services/cacheService';
import type { Page, Media, HeroSlideData, AiringSchedule, AiringSchedulePage } from './types';
import { useAuth } from './hooks/useAuth';

const getSeason = (date: Date): { season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'; year: number } => {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 0 && month <= 2) return { season: 'WINTER', year };
  if (month >= 3 && month <= 5) return { season: 'SPRING', year };
  if (month >= 6 && month <= 8) return { season: 'SUMMER', year };
  return { season: 'FALL', year };
};

const getNextSeason = (current: { season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'; year: number }): { season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'; year: number } => {
  if (current.season === 'WINTER') return { season: 'SPRING', year: current.year };
  if (current.season === 'SPRING') return { season: 'SUMMER', year: current.year };
  if (current.season === 'SUMMER') return { season: 'FALL', year: current.year };
  return { season: 'WINTER', year: current.year + 1 };
};

const getUniqueCycledMedia = (key: string, availableMedia: Media[]): Media | null => {
  if (availableMedia.length === 0) return null;
  try {
    const storedIdsString = localStorage.getItem(key);
    let shownIds: number[] = storedIdsString ? JSON.parse(storedIdsString) : [];
    let unseenMedia = availableMedia.filter(m => !shownIds.includes(m.id));
    if (unseenMedia.length === 0 && availableMedia.length > 0) {
      shownIds = [];
      localStorage.removeItem(key);
      unseenMedia = availableMedia;
    }
    if (unseenMedia.length === 0) return null;
    const selectedMedia = unseenMedia[0];
    shownIds.push(selectedMedia.id);
    localStorage.setItem(key, JSON.stringify(shownIds));
    return selectedMedia;
  } catch (error) {
    console.error(`Could not access localStorage for key ${key}:`, error);
    return availableMedia[Math.floor(Math.random() * availableMedia.length)];
  }
};

const trendingCacheKey = `anilist_trending_${JSON.stringify({ perPage: 20 })}`;
const REFETCH_INTERVAL = 20 * 60 * 1000;

const App: React.FC = () => {
  const { isLoading: isAuthLoading } = useAuth();
  const [showConfiguration, setShowConfiguration] = useState(() => !getCache<Page>(trendingCacheKey));
  const path = useSimpleRouter();
  
  const currentSeason = useMemo(() => getSeason(new Date()), []);
  const nextSeason = useMemo(() => getNextSeason(currentSeason), [currentSeason]);

  const nowInSeconds = useMemo(() => Math.floor(Date.now() / 1000), []);
  const twelveHoursAgo = useMemo(() => nowInSeconds - 12 * 3600, [nowInSeconds]);

  const { data: trendingData, loading: trendingLoading, error: trendingError } = useAnilistQuery<Page>('trending', trendingQuery, { perPage: 20 }, { refetchInterval: REFETCH_INTERVAL });
  const { data: popularSeasonData, loading: popularSeasonLoading } = useAnilistQuery<Page>('popularSeason', popularSeasonQuery, { perPage: 15, season: currentSeason.season, seasonYear: currentSeason.year }, { refetchInterval: REFETCH_INTERVAL });
  const { data: nextSeasonData, loading: nextSeasonLoading } = useAnilistQuery<Page>('nextSeason', nextSeasonQuery, { perPage: 15, season: nextSeason.season, seasonYear: nextSeason.year }, { refetchInterval: REFETCH_INTERVAL });
  const { data: allTimePopularData, loading: allTimePopularLoading } = useAnilistQuery<Page>('allTimePopular', allTimePopularQuery, { perPage: 15 }, { refetchInterval: REFETCH_INTERVAL });
  const { data: releasingData, loading: releasingLoading } = useAnilistQuery<Page>('releasing', releasingQuery, { perPage: 50 }, { refetchInterval: REFETCH_INTERVAL });
  const { data: recentlyAiredData, loading: recentlyAiredLoading } = useAnilistQuery<AiringSchedulePage>('recentlyAired', recentlyAiredQuery, { perPage: 25, airingAt_greater: twelveHoursAgo, airingAt_lesser: nowInSeconds }, { refetchInterval: REFETCH_INTERVAL });
  
  const anilistIsLoading = trendingLoading || popularSeasonLoading || nextSeasonLoading || allTimePopularLoading || releasingLoading || recentlyAiredLoading;

  const airingMedia = useMemo(() => {
    if (!releasingData?.media) return [];
    return releasingData.media
      .filter((m): m is Media & { nextAiringEpisode: { timeUntilAiring: number, episode: number } } => m.nextAiringEpisode?.timeUntilAiring != null && m.nextAiringEpisode.timeUntilAiring > 0)
      .sort((a, b) => a.nextAiringEpisode.timeUntilAiring - b.nextAiringEpisode.timeUntilAiring);
  }, [releasingData]);

  const heroMedia = useMemo((): HeroSlideData[] => {
    const selectedSlides: HeroSlideData[] = [];
    const selectedIds = new Set<number>();

    const addUniqueMedia = (slideData: HeroSlideData) => {
      if (slideData.media && !selectedIds.has(slideData.media.id)) {
        selectedSlides.push(slideData);
        selectedIds.add(slideData.media.id);
      }
    };

    const airingTodayList = airingMedia.filter(m => m.nextAiringEpisode.timeUntilAiring < 24 * 3600);
    if (airingTodayList.length > 0) {
      const todayHero = getUniqueCycledMedia('hero_shown_airingToday', airingTodayList);
      if (todayHero) addUniqueMedia({ media: todayHero, category: "Airing Today" });
    }

    const airingTomorrowList = airingMedia.filter(m => m.nextAiringEpisode.timeUntilAiring >= 24 * 3600 && m.nextAiringEpisode.timeUntilAiring < 48 * 3600);
    const availableTomorrow = airingTomorrowList.filter(m => !selectedIds.has(m.id));
    if (availableTomorrow.length > 0) {
      const tomorrowHero = getUniqueCycledMedia('hero_shown_airingTomorrow', availableTomorrow);
      if (tomorrowHero) addUniqueMedia({ media: tomorrowHero, category: "Airing Tomorrow" });
    }
    
    if (popularSeasonData?.media && popularSeasonData.media.length > 0) {
      const topSeason = popularSeasonData.media.slice(0, 10);
      const availableTopSeason = topSeason.filter(m => !selectedIds.has(m.id));
      if (availableTopSeason.length > 0) {
        const seasonHero = getUniqueCycledMedia('hero_shown_topSeason', availableTopSeason);
        if (seasonHero) addUniqueMedia({ media: seasonHero, category: "Top This Season" });
      }
    }

    if (nextSeasonData?.media && nextSeasonData.media.length > 0) {
      const availableUpcoming = nextSeasonData.media.filter(m => !selectedIds.has(m.id));
      if (availableUpcoming.length > 0) {
        const upcomingHero = getUniqueCycledMedia('hero_shown_upcoming', availableUpcoming);
        if (upcomingHero) addUniqueMedia({ media: upcomingHero, category: "Upcoming Anime" });
      }
    }

    if (allTimePopularData?.media && allTimePopularData.media.length > 0) {
      const availablePopular = allTimePopularData.media.filter(m => !selectedIds.has(m.id));
      if (availablePopular.length > 0) {
        const popularHero = getUniqueCycledMedia('hero_shown_allTimePopular', availablePopular);
        if(popularHero) addUniqueMedia({ media: popularHero, category: "All-Time Popular" });
      }
    }

    if (trendingData?.media) {
      const fallbackMedia = trendingData.media.filter(m => !selectedIds.has(m.id));
      for (let i = 0; selectedSlides.length < 5 && i < fallbackMedia.length; i++) {
        addUniqueMedia({ media: fallbackMedia[i], category: "Trending Now" });
      }
    }
    
    return selectedSlides.length > 0 ? selectedSlides : (trendingData?.media?.slice(0, 5).map(m => ({ media: m, category: 'Trending Now' })) ?? []);
  }, [airingMedia, popularSeasonData, nextSeasonData, allTimePopularData, trendingData]);
  
  const { heroImagesLoading } = usePrefetchHeroImages(heroMedia);

  const isInitialDataLoading = anilistIsLoading || (heroMedia.length > 0 && heroImagesLoading);

  useEffect(() => {
    if (!showConfiguration) return;

    if (!isInitialDataLoading && !isAuthLoading) {
      const timer = setTimeout(() => {
        setShowConfiguration(false);
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [showConfiguration, isInitialDataLoading, isAuthLoading]);
    
  const todayAiringMedia = useMemo(() => airingMedia.filter(m => m.nextAiringEpisode.timeUntilAiring < 86400), [airingMedia]);
  
  const streamingNowSchedules = useMemo(() => {
    if (!recentlyAiredData?.airingSchedules) return [];
    const uniqueSchedules = new Map<number, AiringSchedule>();
    recentlyAiredData.airingSchedules.forEach(schedule => {
        if (!uniqueSchedules.has(schedule.media.id)) uniqueSchedules.set(schedule.media.id, schedule);
    });
    return Array.from(uniqueSchedules.values());
  }, [recentlyAiredData]);

  const tomorrowAiringMedia = useMemo(() => airingMedia.filter(m => m.nextAiringEpisode.timeUntilAiring >= 86400 && m.nextAiringEpisode.timeUntilAiring < 172800), [airingMedia]);

  const trendingMedia = useMemo(() => {
    if (!trendingData?.media) return [];
    const heroIds = new Set(heroMedia.map(slide => slide.media.id));
    return trendingData.media.filter(m => !heroIds.has(m.id));
  }, [trendingData, heroMedia]);

  const top5SeasonMedia = useMemo(() => popularSeasonData?.media?.slice(0, 5) ?? [], [popularSeasonData]);
  const popularSeasonRest = useMemo(() => popularSeasonData?.media?.slice(5) ?? [], [popularSeasonData]);
  
  const handleCardClick = (media: Media) => {
    window.location.hash = `/anime/${media.id}`;
  };

  const renderPage = () => {
    const animeIdMatch = path.match(/^\/anime\/(\d+)/);
    if (animeIdMatch) {
      const id = parseInt(animeIdMatch[1], 10);
      return <AnimeDetailPage id={id} onCardClick={handleCardClick} />;
    }

    switch(path) {
      case '/':
        return (
          <HomePage
            heroMedia={heroMedia}
            todayAiringMedia={todayAiringMedia}
            streamingNowSchedules={streamingNowSchedules}
            tomorrowAiringMedia={tomorrowAiringMedia}
            top5SeasonMedia={top5SeasonMedia}
            trendingMedia={trendingMedia}
            popularSeasonRest={popularSeasonRest}
            nextSeasonData={nextSeasonData}
            allTimePopularData={allTimePopularData}
            nextSeason={nextSeason}
            onCardClick={handleCardClick}
          />
        );
      case '/schedule':
        return <SchedulePage 
          releasingData={releasingData}
          nextSeasonData={nextSeasonData}
          loading={releasingLoading || nextSeasonLoading}
          onCardClick={handleCardClick}
        />;
      case '/search':
        return <SearchPage onCardClick={handleCardClick} />;
      case '/my-list':
        return <MyListPage onCardClick={handleCardClick}/>;
      case '/account':
        return <AccountPage />;
      default:
        // Redirect to home for any unknown hash
        window.location.hash = '/';
        return null; 
    }
  };

  if (showConfiguration || isAuthLoading) {
    return <ConfigurationPage />;
  }

  return (
    <div className="bg-[#0B0B0F] min-h-screen text-white overflow-x-hidden flex flex-col">
      <Header currentPath={path} />
      
      {isInitialDataLoading && path === '/' ? (
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : trendingError ? (
         <div className="flex-grow flex items-center justify-center">
          <p className="text-red-500">{trendingError}</p>
        </div>
      ) : (
        <main className="flex-grow pt-16 md:pt-20 pb-24 md:pb-0">
          {renderPage()}
        </main>
      )}

      {!isInitialDataLoading && !trendingError && <Footer currentPath={path} />}
      <MobileFooter currentPath={path} />
    </div>
  );
};

export default App;