
import type { FanartImages, Media, FanartData } from '../types';
import { getCache, setCache } from './cacheService';
import { getTvdbId } from './mappingService';

const FANART_API_BASE_URL = 'https://webservice.fanart.tv/v3/';
const FANART_API_KEY = 'b32291b234e0f3655588072f4d1b64e7';

const fetchFanartApi = async (endpoint: string): Promise<FanartImages | null> => {
  const cacheKey = `fanart_${endpoint.replace(/\//g, '_')}`;
  const cachedData = getCache<FanartImages>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(`${FANART_API_BASE_URL}${endpoint}?api_key=${FANART_API_KEY}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        setCache(cacheKey, null); // Cache the "not found" result
        return null;
      }
      throw new Error(`Failed to fetch from Fanart.tv API: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      setCache(cacheKey, null); // Cache error responses as null
      return null;
    }

    const fanartData = data as FanartImages;
    setCache(cacheKey, fanartData);
    return fanartData;

  } catch (error) {
    console.error('Error fetching Fanart.tv images:', error);
    return null;
  }
}

/**
 * Fetches images for TV shows using a TheTVDB ID.
 */
export const getFanartTvImages = async (tvdbId: number): Promise<FanartImages | null> => {
  return fetchFanartApi(`tv/${tvdbId}`);
};

/**
 * Fetches images for movies using a TheMovieDB ID.
 */
export const getFanartMovieImages = async (tmdbId: number): Promise<FanartImages | null> => {
    return fetchFanartApi(`movies/${tmdbId}`);
};

export const getFanartDataForMedia = async (media: Media): Promise<FanartData | null> => {
  if (!media?.id) {
    return null;
  }
  
  const cacheKey = `fanart_data_for_anilist_${media.id}`;
  const cachedData = getCache<FanartData | null>(cacheKey);
  if (cachedData !== null) {
    return cachedData;
  }

  try {
    let images: FanartImages | null = null;
    let sourceIsTv = false;

    const tvdbId = await getTvdbId(media);
    
    if (tvdbId) {
      images = await getFanartTvImages(tvdbId);
      sourceIsTv = true;
    } else if (media.format === 'MOVIE') {
      const tmdbLink = media.externalLinks?.find(link => link.site?.toLowerCase() === 'themoviedb');
      const tmdbId = tmdbLink?.id;
      if (tmdbId) {
        images = await getFanartMovieImages(tmdbId);
        sourceIsTv = false;
      }
    }

    if (images) {
      let poster, banner, logo;
      if (sourceIsTv) {
        poster = images.tvposter?.[0]?.url;
        banner = images.showbackground?.[0]?.url || images.tvthumb?.[0]?.url;
        logo = images.hdtvlogo?.[0]?.url || images.clearlogo?.[0]?.url;
      } else {
        poster = images.movieposter?.[0]?.url;
        banner = images.moviebackground?.[0]?.url;
        logo = images.hdmovielogo?.[0]?.url || images.movielogo?.[0]?.url;
      }
      
      const result: FanartData = {
        posterUrl: poster,
        bannerUrl: banner,
        logoUrl: logo,
      };
      setCache(cacheKey, result);
      return result;
    }

    setCache(cacheKey, null);
    return null;

  } catch (error) {
    console.error(`Failed to get Fanart data for anilistId ${media.id}:`, error);
    setCache(cacheKey, null);
    return null;
  }
};
