
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Media, HeroSlideData } from '../types';
import { useFanartImages } from '../hooks/useFanartImages';
import { PlayIcon } from './icons/PlayIcon';
import Countdown from './Countdown';

const GlowBackground: React.FC<{ color: string | null; isActive: boolean }> = ({ color, isActive }) => {
    const mobileGlowColor = color ? `${color}40` : 'rgba(79, 70, 229, 0.25)'; // ~25% alpha for mobile glow
    const desktopGlowColor = color ? `${color}99` : 'rgba(79, 70, 229, 0.6)'; // ~60% alpha for desktop glow

    return (
        <div 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Mobile: Radial glow from the bottom */}
            <div
                className="absolute inset-0 sm:hidden"
                style={{
                    background: `radial-gradient(ellipse 80% 70% at 50% 120%, ${mobileGlowColor}, transparent)`
                }}
            />
            {/* Desktop: Full-area, subtle radial gradient */}
            <div
                className="absolute inset-0 hidden sm:block"
                style={{
                    background: `radial-gradient(ellipse 150% 90% at 50% 10%, ${desktopGlowColor}, var(--background-color) 70%)`
                }}
            />
        </div>
    );
};


interface HeroProps {
  slidesData: HeroSlideData[];
  className?: string;
}

const HeroSlide: React.FC<{ slideData: HeroSlideData; isActive: boolean }> = ({ slideData, isActive }) => {
  const { media: item, category } = slideData;
  const { fanartData } = useFanartImages(item);
  
  const logoUrl = fanartData?.logoUrl;
  const posterUrl = fanartData?.posterUrl || item.coverImage.extraLarge;
  
  const score = item.averageScore ? `${item.averageScore}% Score` : '';
  const mediaType = item.format === 'MANGA' || item.format === 'NOVEL' || item.format === 'ONE_SHOT' ? 'Read Now' : 'Play';
  
  const infoParts = [];
  if (score) infoParts.push(<span key="score" className="text-green-400 font-bold">{score}</span>);
  if (item.seasonYear) infoParts.push(<span key="year">{item.seasonYear}</span>);
  if (item.status) infoParts.push(<span key="status" className="capitalize">{item.status.toLowerCase().replace(/_/g, ' ')}</span>);

  const categoryTitle = (
    <p className="text-base font-bold text-theme tracking-wider uppercase mb-2 text-center sm:text-left">{category}</p>
  );

  const infoContent = (
    <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-2 text-gray-300 font-medium text-sm">
      {infoParts.map((part, i) => (
        <React.Fragment key={part.key}>
          {part}
          {i < infoParts.length - 1 && <span className="hidden sm:inline">&bull;</span>}
        </React.Fragment>
      ))}
    </div>
  );

  const detailsContent = useMemo(() => {
    switch(category) {
      case 'Airing Today':
      case 'Airing Tomorrow':
        if (item.nextAiringEpisode) {
          return (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-300 mb-2 text-center sm:text-left">
                Episode {item.nextAiringEpisode.episode} airing in:
              </p>
              <Countdown initialTime={item.nextAiringEpisode.timeUntilAiring} />
            </div>
          );
        }
        // Fallthrough to default if no airing info
        break;

      case 'Upcoming Anime':
        const season = item.season ? item.season.charAt(0).toUpperCase() + item.season.slice(1).toLowerCase() : '';
        const seasonInfo = season && item.seasonYear ? `${season} ${item.seasonYear}` : 'Coming Soon';
        return (
          <div className="mt-4 text-center sm:text-left">
            <p className="text-lg font-bold text-theme tracking-wider uppercase">{seasonInfo}</p>
            <p className="mt-2 text-gray-300 text-sm line-clamp-2 leading-relaxed drop-shadow-md">
              {item.description ? item.description.replace(/<[^>]*>?/gm, '') : ''}
            </p>
          </div>
        );

      case 'Top This Season':
      case 'All-Time Popular':
      case 'Trending Now':
      default:
        return (
          <p className="mt-4 text-gray-300 text-sm line-clamp-3 leading-relaxed drop-shadow-md">
            {item.description ? item.description.replace(/<[^>]*>?/gm, '') : ''}
          </p>
        );
    }
    // Fallback for airing categories if nextAiringEpisode is missing for some reason
    return (
        <p className="mt-4 text-gray-300 text-sm line-clamp-3 leading-relaxed drop-shadow-md">
          {item.description ? item.description.replace(/<[^>]*>?/gm, '') : ''}
        </p>
    );
  }, [category, item]);

  const buttons = (
     <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start">
        <button className="flex items-center justify-center bg-theme text-white font-bold py-2 px-5 text-sm md:text-base md:py-3 md:px-8 rounded-full cinematic-btn-glow">
          <PlayIcon className="w-5 h-5 md:w-6 md:h-6 mr-2" />
          <span>{mediaType}</span>
        </button>
        <button
          onClick={() => window.location.hash = `/anime/${item.id}`}
          className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg text-white font-bold py-2 px-5 text-sm md:text-base md:py-3 md:px-8 rounded-full border border-white/30 shadow-lg shadow-black/20 hover:from-white/30 hover:to-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          More Info
        </button>
      </div>
  );

  return (
    <div aria-hidden={!isActive}>
      {/* Desktop & Tablet Layout */}
      <div className="hidden sm:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[50vh] py-12">
            <div className="flex items-center justify-center gap-8 lg:gap-16 w-full max-w-6xl mx-auto">
              {/* Left Side: Poster with Glow */}
              <div className="flex-shrink-0 w-1/3 max-w-[280px] lg:max-w-[340px]">
                <div 
                  className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl"
                  style={{boxShadow: `0 0 60px -10px ${item.coverImage.color || 'rgba(79, 70, 229, 0.7)'}`}}
                >
                  <img
                    src={posterUrl}
                    alt={item.title.romaji}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="flex-grow py-8 max-w-2xl">
                {categoryTitle}
                {logoUrl ? (
                  <div className="mb-4">
                    <img src={logoUrl} alt={`${item.title.english || item.title.romaji} logo`} className="max-w-full h-auto max-h-20 md:max-h-24 lg:max-h-28 object-contain object-left drop-shadow-lg" />
                  </div>
                ) : (
                  <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gradient drop-shadow-lg leading-tight mb-4">
                    {item.title.english || item.title.romaji}
                  </h2>
                )}
                
                {infoContent}
                {detailsContent}
                {buttons}
              </div>
            </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="container mx-auto px-4 sm:px-6 pt-6">
          <div 
            className="relative aspect-[2/3] max-w-sm mx-auto rounded-xl overflow-hidden shadow-2xl"
            style={{boxShadow: `0 0 40px 0px ${item.coverImage.color || 'rgba(0,0,0,0.5)'}`}}
          >
            <img
              src={posterUrl}
              alt={item.title.romaji}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/70 to-transparent"></div>
            {logoUrl && (
              <div className="absolute bottom-6 left-6 right-6">
                  <img src={logoUrl} alt={`${item.title.english || item.title.romaji} logo`} className="w-full h-auto max-h-16 object-contain drop-shadow-lg" />
              </div>
            )}
          </div>
          
          <div className="max-w-sm mx-auto text-center mt-6">
            {categoryTitle}
            {!logoUrl && (
                <h2 className="text-2xl font-black text-gradient drop-shadow-lg leading-tight mb-2">
                    {item.title.english || item.title.romaji}
                </h2>
            )}
            {infoContent}
            {detailsContent}
            {buttons}
          </div>
        </div>
      </div>
    </div>
  );
};


const Hero: React.FC<HeroProps> = ({ slidesData, className }) => {
  const [slides, setSlides] = useState<HeroSlideData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (slidesData.length > 1) {
      const firstClone = slidesData[0];
      const lastClone = slidesData[slidesData.length - 1];
      setSlides([lastClone, ...slidesData, firstClone]);
      setCurrentIndex(1);
    } else {
      setSlides(slidesData);
      setCurrentIndex(0);
    }
  }, [slidesData]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    if (slidesData.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 7000);
    }
  }, [slidesData.length, stopTimer]);

  const scheduleAutoPlay = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
    }
    restartTimerRef.current = setTimeout(startTimer, 3500);
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer]);

  const handleTransitionEnd = () => {
    if (currentIndex <= 0) {
      setIsTransitioning(true);
      setCurrentIndex(slidesData.length);
    } else if (currentIndex >= slidesData.length + 1) {
      setIsTransitioning(true);
      setCurrentIndex(1);
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      queueMicrotask(() => setIsTransitioning(false));
    }
  }, [isTransitioning]);


  if (!slidesData || slidesData.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="hidden sm:block">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[50vh] py-12">
            <div className="flex items-center justify-center gap-8 lg:gap-16 w-full max-w-6xl mx-auto">
              <div className="flex-shrink-0 w-1/3 max-w-[280px] lg:max-w-[340px]">
                <div className="aspect-[2/3] rounded-xl bg-gray-900"></div>
              </div>
              <div className="flex-grow max-w-2xl w-2/3 space-y-4">
                <div className="h-5 w-1/3 bg-gray-800 rounded"></div>
                <div className="h-16 w-3/4 bg-gray-800 rounded-lg"></div>
                <div className="h-4 w-full bg-gray-800 rounded"></div>
                <div className="h-10 w-full bg-gray-800 rounded mt-6"></div>
                <div className="flex gap-4 mt-8">
                  <div className="h-12 w-32 bg-gray-800 rounded-full"></div>
                  <div className="h-12 w-32 bg-gray-800 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="block sm:hidden container mx-auto px-4 sm:px-6 pt-6">
            <div className="relative aspect-[2/3] max-w-sm mx-auto rounded-xl bg-gray-900"></div>
            <div className="max-w-sm mx-auto text-center mt-6">
                <div className="h-5 w-3/4 bg-gray-800 rounded mx-auto mb-4"></div>
                <div className="h-4 w-full bg-gray-800 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-800 rounded mx-auto mb-8"></div>
                <div className="flex gap-4 justify-center">
                    <div className="h-12 w-32 bg-gray-800 rounded-full"></div>
                    <div className="h-12 w-32 bg-gray-800 rounded-full"></div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  const handleDotClick = useCallback((index: number) => {
    stopTimer();
    setCurrentIndex(index + 1);
    scheduleAutoPlay();
  }, [stopTimer, scheduleAutoPlay]);

  const getActiveDotIndex = () => {
    if (currentIndex <= 0) return slidesData.length - 1;
    if (currentIndex >= slidesData.length + 1) return 0;
    return currentIndex - 1;
  };
  
  const activeDotIndex = getActiveDotIndex();

  return (
    <div className={`relative w-full overflow-hidden ${className || ''}`}>
      {/* Background Section */}
      <div className="absolute inset-0">
        {/* Dynamic Glows */}
        {slidesData.map((slide, index) => (
          <GlowBackground 
            key={`${slide.media.id}-glow`} 
            color={slide.media.coverImage.color} 
            isActive={index === activeDotIndex} 
          />
        ))}
        {/* Static Gradient Overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background-color)] via-[var(--background-color)]/40 to-transparent"></div>
      </div>
      
      {/* Foreground Content */}
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className={`flex ${!isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((slideItem, index) => (
              <div key={`${slideItem.media.id}-${index}`} className="w-full flex-shrink-0">
                <HeroSlide slideData={slideItem} isActive={index === currentIndex} />
              </div>
            ))}
          </div>
        </div>
        
        {slidesData.length > 1 && (
          <>
              {/* Desktop Dots */}
              <div className="absolute top-0 right-0 pt-4 pr-4 sm:pt-6 sm:pr-6 lg:pt-8 lg:pr-8 z-20 hidden sm:flex space-x-2">
              {slidesData.map((_, index) => (
                  <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${activeDotIndex === index ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Go to slide ${index + 1}`}
                  />
              ))}
              </div>

              {/* Mobile Dots */}
              <div className="flex sm:hidden justify-center pt-6 space-x-2">
              {slidesData.map((_, index) => (
                  <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${activeDotIndex === index ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Go to slide ${index + 1}`}
                  />
              ))}
              </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Hero;
