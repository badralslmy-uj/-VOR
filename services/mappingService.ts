import type { Media, RelationNode, TvdbSearchResult } from '../types';
import { searchTvdb } from './tvdbService';
import { getCache, setCache } from './cacheService';

const findBestMatch = (results: TvdbSearchResult[], media: Media | RelationNode): TvdbSearchResult | null => {
  if (!results || results.length === 0) {
    return null;
  }

  // Use the year of the media (preferably the root) for a more accurate match.
  if (media.seasonYear) {
    const yearMatch = results.find(r => r.year === String(media.seasonYear));
    if (yearMatch) {
        return yearMatch;
    }
  }

  // Otherwise, return the first result, as it's usually the most relevant.
  return results[0];
};

const cleanTitleForSearch = (title: string): string => {
    if (!title) return '';
    return title
        .replace(/\s*-\s*The Separation.*$/i, '') // Specific fix for Bleach TYBW
        .replace(/\s*-\s*Cour\s+\d+.*$/i, '')
        .replace(/(\s*[:\-])\s*(The\s+)?(Final\s+)?Season.*$/i, '')
        .replace(/(\s*[:\-])\s*Part\s+\d+.*$/i, '')
        .replace(/(\s*[:\-])\s*(Season|Part|Cour)\s+\d+.*$/i, '')
        .replace(/\s*\(TV\)/i, '')
        .replace(/\s*:?\s*(1st|2nd|3rd|[4-9]th)\s+Season.*$/i, '')
        .replace(/\s*:?\s*(First|Second|Third|Fourth|Fifth|Sixth|Seventh)\s+Season.*$/i, '')
        .replace(/\s+(II|III|IV|V|VI|VII|VIII|IX|X)$/, '') // Roman numerals at the end
        .trim();
}


export const getTvdbId = async (media: Media): Promise<number | undefined> => {
  const cacheKey = `mapping_anilist_${media.id}_tvdbid`;
  const cachedId = getCache<number | null>(cacheKey);
  if (cachedId !== null) {
    return cachedId ? cachedId : undefined;
  }

  const seriesChain: (Media | RelationNode)[] = [media];
  let current: Media | RelationNode | undefined = media;

  // Traverse up the prequel/parent chain to build a list of all related series.
  // The chain will be ordered from root -> latest sequel.
  while (current?.relations) {
    const parent = current.relations.edges.find(
      e => e.relationType === 'PREQUEL' || e.relationType === 'PARENT'
    )?.node;
    if (parent) {
      seriesChain.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  
  const rootMedia = seriesChain[0];

  // 1. Prioritize finding a TVDB ID from externalLinks in the entire series chain, starting with the root.
  for (const item of seriesChain) {
    const tvdbLink = item.externalLinks?.find(link => link.site?.toLowerCase() === 'thetvdb');
    if (tvdbLink?.id) {
      setCache(cacheKey, tvdbLink.id);
      return tvdbLink.id;
    }
  }

  // 2. If no direct link is found, search TVDB using ONLY the cleaned title of the root media.
  // This is the key to finding the correct consolidated entry on Fanart.tv.
  const titleToSearch = cleanTitleForSearch(rootMedia.title.english || rootMedia.title.romaji);

  if (titleToSearch) {
      try {
        const searchResults = await searchTvdb(titleToSearch);
        // Use the root media's data (especially its year) to find the best match.
        const bestMatch = findBestMatch(searchResults, rootMedia); 
        
        if (bestMatch?.tvdb_id) {
          const tvdbId = parseInt(bestMatch.tvdb_id, 10);
          if (!isNaN(tvdbId)) {
            setCache(cacheKey, tvdbId);
            return tvdbId;
          }
        }
      } catch (error) {
        console.error(`Failed to search TVDB for root title "${titleToSearch}":`, error);
      }
  }

  // If we reach here, no valid ID was found. Cache this failure to avoid re-querying.
  setCache(cacheKey, null);
  return undefined;
};