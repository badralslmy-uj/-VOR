
import { useState, useEffect } from 'react';
import { getFanartDataForMedia } from '../services/fanartService';
import type { HeroSlideData } from '../types';

export const usePrefetchHeroImages = (slides: HeroSlideData[]) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If slides array is empty (e.g., on initial render before data arrives),
    // we are not loading images.
    if (slides.length === 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    
    const prefetch = async () => {
      setLoading(true);
      
      // Fetch all hero images in parallel.
      await Promise.all(slides.map(slide => getFanartDataForMedia(slide.media)));
      
      if (isMounted) {
        setLoading(false);
      }
    };

    prefetch();

    return () => { isMounted = false; }
  }, [slides]);

  return { heroImagesLoading: loading };
};
