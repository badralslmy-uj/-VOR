
import { useState, useEffect } from 'react';
import { getFanartDataForMedia } from '../services/fanartService';
import type { FanartData, Media } from '../types';

// This hook fetches images from Fanart.tv, prioritizing series-level assets for all related media (TV, OVA, Movie).
export const useFanartImages = (media: Media): { fanartData: FanartData | null; loading: boolean } => {
  const [fanartData, setFanartData] = useState<FanartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      if (!media) {
        if (isMounted) setLoading(false);
        return;
      }
      
      if (isMounted) setLoading(true);

      try {
        const data = await getFanartDataForMedia(media);
        if (isMounted) {
          setFanartData(data);
        }
      } catch (error) {
        console.error(`Failed to get Fanart images for anilistId ${media.id}:`, error);
        if (isMounted) setFanartData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [media]);

  return { fanartData, loading };
};
