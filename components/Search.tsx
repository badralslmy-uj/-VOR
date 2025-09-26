import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchAnilist, searchQuery } from '../services/anilistService';
import type { Media, Page } from '../types';
import { XIcon } from './icons/XIcon';
import { SearchIcon } from './icons/SearchIcon';
import { FilterIcon } from './icons/FilterIcon';
import LoadingSpinner from './LoadingSpinner';
import Checkbox from './Checkbox';

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


// --- Search Result Card Component ---
const SearchResultGridCard: React.FC<{ media: Media }> = ({ media }) => {
  return (
    <a href="#" className="group space-y-2">
      <div className="aspect-[2/3] bg-gray-800 rounded-md overflow-hidden relative">
        <img 
          src={media.coverImage.large} 
          alt={media.title.romaji} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
      </div>
      <p className="font-semibold text-white text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
        {media.title.english || media.title.romaji}
      </p>
    </a>
  );
};


// --- Main Search Component ---
interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const Search: React.FC<SearchProps> = ({ isOpen, onClose }) => {
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
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    } else {
       const timer = setTimeout(() => setShowFilters(false), 300);
       return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setQuery('');
        setResults([]);
        setError(null);
        setFilters(initialFiltersState);
        setHasSearched(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const clearFilters = () => {
    setFilters(initialFiltersState);
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setHasSearched(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-4xl mx-auto bg-[#101014] rounded-xl shadow-2xl transition-all duration-300 ${isOpen ? 'translate-y-24 opacity-100' : 'translate-y-16 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
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
                {query && (
                <button
                    onClick={clearQuery}
                    className="flex items-center text-gray-400 hover:text-white transition-colors mr-2"
                    aria-label="Clear search query"
                >
                    <XIcon />
                </button>
                )}
                <button
                    onClick={() => setShowFilters(prev => !prev)}
                    className={`p-1 rounded-md transition-colors ${showFilters || isFiltersActive ? 'bg-purple-600/50 text-purple-300' : 'text-gray-400 hover:text-white'}`}
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
                                <select value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))} className="w-full mt-1 bg-[#101014] border-white/10 rounded-md text-sm">
                                    {Object.entries(SORT_OPTIONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Year</label>
                                <input type="number" placeholder="e.g. 2023" value={filters.year} onChange={e => setFilters(f => ({...f, year: e.target.value}))} className="w-full mt-1 bg-[#101014] border-white/10 rounded-md text-sm" />
                            </div>
                             <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Season</label>
                                <select value={filters.season} onChange={e => setFilters(f => ({ ...f, season: e.target.value }))} className="w-full mt-1 bg-[#101014] border-white/10 rounded-md text-sm">
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
                        <button onClick={clearFilters} className="text-sm text-purple-400 hover:text-purple-300 font-semibold">Clear Filters</button>
                        <button onClick={handleSearch} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-md transition-colors">Search</button>
                    </div>
                </div>
            </div>
        </div>


        <div className="p-6 max-h-[calc(80vh-250px)] overflow-y-auto">
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
              {results.map(media => <SearchResultGridCard key={media.id} media={media} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;