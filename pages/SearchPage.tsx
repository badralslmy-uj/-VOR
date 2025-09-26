import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchAnilist, searchQuery } from '../services/anilistService';
import type { Media, Page } from '../types';
import { SearchIcon } from '../components/icons/SearchIcon';
import { FilterIcon } from '../components/icons/FilterIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import Checkbox from '../components/Checkbox';
import GridCard from '../components/GridCard';

// --- Constants for Filters ---
const SORT_OPTIONS = {
  SEARCH_MATCH: 'Relevance',
  POPULARITY_DESC: 'Popularity',
  SCORE_DESC: 'Score',
  TRENDING_DESC: 'Trending',
};

const SEASON_OPTIONS = {
  WINTER: 'Winter',
  SPRING: 'Spring',
  SUMMER: 'Summer',
  FALL: 'Fall',
};

const FORMAT_OPTIONS = ['TV', 'MOVIE', 'OVA', 'SPECIAL', 'ONA'];
const STATUS_OPTIONS = ['RELEASING', 'FINISHED', 'NOT_YET_RELEASED'];
const GENRE_OPTIONS = ['Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];
const POPULAR_STUDIOS = ['MAPPA', 'Wit Studio', 'Ufotable', 'Madhouse', 'A-1 Pictures', 'Production I.G', 'Bones', 'Kyoto Animation', 'CloverWorks', 'Trigger', 'Sunrise', 'Toei Animation', 'Studio Ghibli', 'CoMix Wave Films', 'Pierrot', 'J.C.Staff', 'Orange', 'David Production', 'Studio Bind', 'TMS Entertainment'];


// --- Initial State ---
const initialFiltersState = {
  year: '',
  season: '',
  formats: [] as string[],
  status: [] as string[],
  genres: [] as string[],
  sortBy: 'SEARCH_MATCH',
};


// --- Main Search Page Component ---
interface SearchPageProps {
  onCardClick: (media: Media) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onCardClick }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(initialFiltersState);
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const isFiltersActive = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(initialFiltersState);
  }, [filters]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async () => {
    const hasQuery = query.trim().length > 1;
    const hasFilters = JSON.stringify(filters) !== JSON.stringify(initialFiltersState);

    if (!hasQuery && !hasFilters) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    const variables: any = { perPage: 30 };
    if (hasQuery) {
      variables.search = query;
      variables.sort = [filters.sortBy];
    } else {
      variables.sort = [filters.sortBy !== 'SEARCH_MATCH' ? filters.sortBy : 'POPULARITY_DESC'];
    }

    if (filters.year.match(/^\d{4}$/)) variables.seasonYear = parseInt(filters.year, 10);
    if (filters.season) variables.season = filters.season;
    if (filters.formats.length > 0) variables.format_in = filters.formats;
    if (filters.status.length > 0) variables.status_in = filters.status;
    if (filters.genres.length > 0) variables.genre_in = filters.genres;
    
    try {
      const response = await fetchAnilist(searchQuery, variables);
      setResults((response.data.Page as Page).media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (group: 'formats' | 'status' | 'genres', value: string) => {
    setFilters(prev => {
        const currentValues = prev[group] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(item => item !== value)
            : [...currentValues, value];
        return { ...prev, [group]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters(initialFiltersState);
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setHasSearched(false);
    }
  };

  const backgroundStyle = {
      background: `radial-gradient(ellipse 80% 50% at 50% -20%, var(--theme-color-glow), transparent)`
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 transition-all duration-500 pointer-events-none" style={backgroundStyle}></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Search</h1>
          
          <div className="bg-[#101014] rounded-xl shadow-2xl border border-white/10">
            <div className="p-4 border-b border-white/10">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <SearchIcon />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  placeholder="Search for an anime..."
                  aria-label="Search for an anime"
                  className="w-full bg-transparent border-0 pl-10 pr-20 py-2 text-white placeholder-gray-400 focus:ring-0 text-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                        onClick={() => setShowFilters(prev => !prev)}
                        className={`p-1 rounded-md transition-colors ${showFilters || isFiltersActive ? 'bg-theme-50 text-theme-soft' : 'text-gray-400 hover:text-white'}`}
                        aria-label="Toggle advanced filters"
                        aria-expanded={showFilters}
                    >
                        <FilterIcon />
                    </button>
                </div>
              </div>
            </div>

            {/* --- Advanced Filters Panel --- */}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${showFilters ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-6 bg-black/20 border-b border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Column 1: Sort, Year, Season */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Sort By</label>
                                    <select value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))} className="w-full mt-1 bg-[#101014] border-white/10 rounded-md text-sm focus-ring-theme">
                                        {Object.entries(SORT_OPTIONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Year</label>
                                    <input type="number" placeholder="e.g. 2023" value={filters.year} onChange={e => setFilters(f => ({...f, year: e.target.value}))} className="w-full mt-1 bg-[#101014] border-white/10 rounded-md text-sm focus-ring-theme" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Season</label>
                                    <select value={filters.season} onChange={e => setFilters(f => ({ ...f, season: e.target.value }))} className="w-full mt-1 bg-[#101014] border-white/10 rounded-md text-sm focus-ring-theme">
                                        <option value="">Any</option>
                                        {Object.entries(SEASON_OPTIONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Column 2: Format & Status */}
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Format</label>
                                    <div className="space-y-1 mt-2">
                                        {FORMAT_OPTIONS.map(format => <Checkbox key={format} label={format} checked={filters.formats.includes(format)} onChange={() => handleCheckboxChange('formats', format)} />)}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                                    <div className="space-y-1 mt-2">
                                        {STATUS_OPTIONS.map(status => <Checkbox key={status} label={status.replace(/_/g, ' ')} checked={filters.status.includes(status)} onChange={() => handleCheckboxChange('status', status)} />)}
                                    </div>
                                </div>
                            </div>
                            {/* Column 3: Genre */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Genre</label>
                                <div className="space-y-1 mt-2 max-h-56 overflow-y-auto pr-2 scrollbar-hide">
                                    {GENRE_OPTIONS.map(genre => <Checkbox key={genre} label={genre} checked={filters.genres.includes(genre)} onChange={() => handleCheckboxChange('genres', genre)} />)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                          <label className="text-xs font-bold text-gray-400 uppercase">Popular Studios</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {POPULAR_STUDIOS.map(studio => (
                              <button
                                key={studio}
                                onClick={() => setQuery(studio)}
                                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-full text-sm transition-colors"
                              >
                                {studio}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end items-center gap-4">
                            <button onClick={clearFilters} className="text-sm text-theme-soft hover:text-theme font-semibold">Clear Filters</button>
                            <button onClick={handleSearch} className="px-4 py-2 bg-theme hover-bg-theme-dark text-white font-bold text-sm rounded-md transition-colors">Search</button>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="pt-8">
            {loading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
            {!loading && error && <p className="text-red-500 text-center py-8">{error}</p>}
            {!loading && !error && !hasSearched && (
              <div className="text-center py-8 text-gray-400">
                <p>Find your next favorite anime.</p>
              </div>
            )}
            {!loading && !error && hasSearched && results.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>No results found for your criteria.</p>
              </div>
            )}
            {!loading && !error && results.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6">
                {results.map(media => <GridCard key={media.id} media={media} onClick={() => onCardClick(media)} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;