import React, { useState, useEffect, useMemo } from 'react';
import { fetchAnilistMediaDetail } from '../services/anilistService';
import type { Media, CharacterConnection, CharacterEdge, StaffConnection, StaffEdge, Trailer, StreamingEpisode } from '../types';
import { getStreamingInfo } from '../services/streamingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { MediaActionButtons } from '../components/MediaActionButtons';
import { PlayIcon } from '../components/icons/PlayIcon';
import AnimeCarousel from '../components/AnimeCarousel';
import { YouTubeIcon } from '../components/icons/YouTubeIcon';

// --- Sub-Components for the Detail Page ---

const GlowBackground: React.FC<{ color: string | null }> = ({ color }) => {
    const glowColor = color ? `${color}99` : 'rgba(79, 70, 229, 0.6)';
    return (
        <div
            className="absolute inset-0 transition-all duration-1000 ease-in-out"
            style={{
                background: `radial-gradient(ellipse 150% 90% at 50% 10%, ${glowColor}, var(--background-color) 70%)`
            }}
        />
    );
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-start py-2 border-b border-white/10">
            <p className="text-sm font-semibold text-gray-400 flex-shrink-0 pr-4">{label}</p>
            <p className="text-sm text-right text-white max-w-[60%]">{value}</p>
        </div>
    );
};

const AiringCountdown: React.FC<{ nextAiringEpisode: NonNullable<Media['nextAiringEpisode']> }> = ({ nextAiringEpisode }) => {
  const [timeLeft, setTimeLeft] = useState(nextAiringEpisode.timeUntilAiring);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const { days, hours, minutes, seconds } = useMemo(() => {
    const d = Math.floor(timeLeft / 86400);
    const h = Math.floor((timeLeft % 86400) / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = Math.floor(timeLeft % 60);
    return { days: d, hours: h, minutes: m, seconds: s };
  }, [timeLeft]);

  if (timeLeft <= 0) return null;

  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div>
      <span className="text-2xl font-bold text-white tabular-nums">{value.toString().padStart(2, '0')}</span>
      <span className="text-sm font-semibold text-gray-400 ml-1">{label}</span>
    </div>
  );

  return (
    <div className="mt-6">
      <p className="text-sm font-bold text-gray-300 mb-2 text-center md:text-left">
        Episode {nextAiringEpisode.episode} airing in:
      </p>
      <div className="flex items-baseline justify-center md:justify-start gap-4">
        {days > 0 && <TimeUnit value={days} label="d" />}
        <TimeUnit value={hours} label="h" />
        <TimeUnit value={minutes} label="m" />
        <TimeUnit value={seconds} label="s" />
      </div>
    </div>
  );
};


const CharacterCard: React.FC<{ edge: CharacterEdge }> = ({ edge }) => {
    const va = edge.voiceActors[0];
    return (
        <div className="flex bg-gray-900/50 rounded-lg overflow-hidden items-stretch transition-all border border-transparent hover:border-white/10">
            <div className="flex items-center gap-3 p-2 w-1/2">
                <img src={edge.node.image?.large} alt={edge.node.name.full} className="w-12 h-20 object-cover rounded-md flex-shrink-0 bg-gray-800" />
                <div className="flex flex-col justify-center">
                    <p className="font-bold text-white text-sm line-clamp-2">{edge.node.name.full}</p>
                    <p className="text-xs text-gray-400 capitalize">{edge.role.toLowerCase()}</p>
                </div>
            </div>
            {va && (
                 <div className="flex items-center gap-3 p-2 w-1/2 justify-end text-right rounded-r-lg">
                    <div className="flex flex-col justify-center">
                        <p className="font-bold text-white text-sm line-clamp-2">{va.name.full}</p>
                        <p className="text-xs text-gray-400">Japanese</p>
                    </div>
                    <img src={va.image?.large} alt={va.name.full} className="w-12 h-20 object-cover rounded-md flex-shrink-0 bg-gray-800" />
                </div>
            )}
        </div>
    );
};

const StaffCard: React.FC<{ edge: StaffEdge }> = ({ edge }) => (
    <div className="text-center">
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
            <img src={edge.node.image?.large} alt={edge.node.name.full} className="w-full h-full object-cover bg-gray-800" />
        </div>
        <p className="font-bold text-white text-sm mt-2 truncate">{edge.node.name.full}</p>
        <p className="text-xs text-gray-400 truncate">{edge.role}</p>
    </div>
);

const EpisodeCard: React.FC<{ episode: StreamingEpisode }> = ({ episode }) => (
    <a href={episode.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-800 transition-colors group">
        <div className="w-32 aspect-video overflow-hidden rounded flex-shrink-0 bg-gray-800">
            <img src={episode.thumbnail} alt={episode.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="flex-grow">
            <p className="font-semibold text-white group-hover:text-theme transition-colors line-clamp-2">{episode.title}</p>
            <p className="text-sm text-gray-400 font-bold" style={{color: getStreamingInfo({externalLinks: [{site: episode.site}]} as Media)?.color}}>{episode.site}</p>
        </div>
    </a>
);

// --- Tab Content Components ---

const OverviewTab: React.FC<{ media: Media, onCardClick: (media: Media) => void }> = ({ media, onCardClick }) => {
    const studio = useMemo(() => media.studios.edges.find(e => e.node.name)?.node.name, [media]);
    const relations = useMemo(() => (media.relations?.edges || [])
        .filter(edge => edge.node.format !== 'MANGA' && edge.node.format !== 'NOVEL')
        .map(edge => edge.node as Media), [media]);
    
    return (
        <div className="animate-fade-in space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{media.description?.replace(/<[^>]*>?/gm, '')}</p>
                </div>
                <div className="md:col-span-4">
                    <div className="p-4 glass-pane rounded-xl">
                        <div className="space-y-1">
                            <InfoRow label="Japanese" value={media.title.native} />
                            <InfoRow label="Romaji" value={media.title.romaji} />
                            <InfoRow label="Format" value={media.format?.replace(/_/g, ' ')} />
                            <InfoRow label="Episodes" value={media.episodes} />
                            <InfoRow label="Duration" value={media.duration ? `${media.duration} mins` : null} />
                            <InfoRow label="Status" value={media.status?.replace(/_/g, ' ')} />
                            <InfoRow label="Season" value={`${media.season || ''} ${media.seasonYear || ''}`} />
                            <InfoRow label="Score" value={media.averageScore ? `${media.averageScore}%` : null} />
                            <InfoRow label="Studio" value={studio} />
                            <InfoRow label="Source" value={media.source?.replace(/_/g, ' ')} />
                            <InfoRow label="Country" value={media.countryOfOrigin} />
                            <InfoRow label="Hashtag" value={media.hashtag} />
                        </div>
                    </div>
                </div>
            </div>
            {relations.length > 0 && (
                <AnimeCarousel title="Related Anime" media={relations} onCardClick={onCardClick} />
            )}
        </div>
    );
};

const CharactersTab: React.FC<{ characters: CharacterConnection | undefined }> = ({ characters }) => {
    const main = useMemo(() => characters?.edges.filter(e => e.role === 'MAIN') || [], [characters]);
    const supporting = useMemo(() => characters?.edges.filter(e => e.role === 'SUPPORTING') || [], [characters]);
    
    return (
        <div className="animate-fade-in space-y-8">
            {main.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Main Characters</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {main.map(edge => <CharacterCard key={edge.node.id} edge={edge} />)}
                    </div>
                </div>
            )}
            {supporting.length > 0 && (
                 <div>
                    <h3 className="text-xl font-bold text-white mb-4">Supporting Characters</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {supporting.map(edge => <CharacterCard key={edge.node.id} edge={edge} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

const StaffTab: React.FC<{ staff: StaffConnection | undefined }> = ({ staff }) => (
    <div className="animate-fade-in grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-5 gap-y-6">
        {staff?.edges.map(edge => <StaffCard key={`${edge.node.id}-${edge.role}`} edge={edge} />)}
    </div>
);

const TrailerTab: React.FC<{ trailer: Trailer | undefined }> = ({ trailer }) => {
    if (!trailer || trailer.site !== 'youtube') {
        return <div className="text-center py-20 text-gray-400">No trailer available.</div>;
    }
    const url = `https://www.youtube.com/watch?v=${trailer.id}`;
    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="relative aspect-video rounded-lg overflow-hidden glass-pane">
                    <img src={trailer.thumbnail} alt="Trailer thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <YouTubeIcon className="w-20 h-20 text-red-600 drop-shadow-lg" />
                    </div>
                </div>
            </a>
        </div>
    );
};

const EpisodesTab: React.FC<{ episodes: StreamingEpisode[] | undefined }> = ({ episodes }) => (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
        {episodes?.map((ep, index) => <EpisodeCard key={index} episode={ep} />)}
    </div>
);


interface AnimeDetailPageProps {
    id: number;
    onCardClick: (media: Media) => void;
}

type Tab = 'overview' | 'episodes' | 'characters' | 'staff' | 'trailers';

const AnimeDetailPage: React.FC<AnimeDetailPageProps> = ({ id, onCardClick }) => {
    const [media, setMedia] = useState<Media | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    useEffect(() => {
        const fetchMedia = async () => {
            setLoading(true);
            setError(null);
            setMedia(null);
            setActiveTab('overview');
            try {
                const response = await fetchAnilistMediaDetail(id);
                setMedia(response.data.Media);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not load anime details.');
            } finally {
                setLoading(false);
            }
        };
        fetchMedia();
        window.scrollTo(0, 0);
    }, [id]);
    
    if (loading) {
        return <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-200px)]"><LoadingSpinner size="large" /></div>;
    }

    if (error || !media) {
        return <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-200px)]"><p className="text-red-500">{error || 'Anime not found.'}</p></div>;
    }
    
    const TABS: { id: Tab, label: string, disabled: boolean }[] = [
        { id: 'overview', label: 'Overview', disabled: false },
        { id: 'episodes', label: 'Episodes', disabled: !media.streamingEpisodes || media.streamingEpisodes.length === 0 },
        { id: 'characters', label: 'Characters', disabled: !media.characters || media.characters.edges.length === 0 },
        { id: 'staff', label: 'Staff', disabled: !media.staff || media.staff.edges.length === 0 },
        { id: 'trailers', label: 'Trailers', disabled: !media.trailer },
    ];

    return (
        <div className="animate-fade-in">
            <div 
                className="relative h-[30vh] md:h-[40vh] w-full bg-cover bg-center" 
                style={{ backgroundImage: media.bannerImage ? `url(${media.bannerImage})` : undefined, backgroundColor: media.coverImage.color || '#101014' }}
            >
                <GlowBackground color={media.coverImage.color} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/60 to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 -mt-24 md:-mt-32 relative">
                    <div className="w-40 sm:w-56 mx-auto md:mx-0 flex-shrink-0">
                        <img 
                          src={media.coverImage.extraLarge} 
                          alt={media.title.romaji} 
                          className="w-full aspect-[2/3] object-cover rounded-lg" 
                          style={{boxShadow: `0 10px 30px -5px rgba(0,0,0,0.3), 0 0 40px -10px ${media.coverImage.color || 'rgba(79, 70, 229, 0.7)'}`}} 
                        />
                    </div>
                    <div className="flex-grow text-center md:text-left pt-4 md:pt-16">
                        <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg leading-tight mb-4">
                            {media.title.english || media.title.romaji}
                        </h1>
                         <p className="text-gray-300 font-medium mb-4">
                            {media.genres.slice(0, 3).join(' • ')}
                        </p>
                        
                        {media.nextAiringEpisode && media.nextAiringEpisode.timeUntilAiring > 0 && (
                            <AiringCountdown nextAiringEpisode={media.nextAiringEpisode} />
                        )}

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-6">
                            <button className="flex items-center justify-center bg-theme text-white font-bold py-3 px-8 rounded-full cinematic-btn-glow">
                                <PlayIcon className="w-5 h-5 mr-2" /> Play
                            </button>
                            <MediaActionButtons media={media} />
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-b border-white/10">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                disabled={tab.disabled}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors disabled:text-gray-600 disabled:cursor-not-allowed ${
                                    activeTab === tab.id
                                    ? 'border-theme text-theme'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                }`}
                            >
                            {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="py-8">
                    {activeTab === 'overview' && <OverviewTab media={media} onCardClick={onCardClick} />}
                    {activeTab === 'episodes' && <EpisodesTab episodes={media.streamingEpisodes} />}
                    {activeTab === 'characters' && <CharactersTab characters={media.characters} />}
                    {activeTab === 'staff' && <StaffTab staff={media.staff} />}
                    {activeTab === 'trailers' && <TrailerTab trailer={media.trailer} />}
                </div>
            </div>
        </div>
    );
};

export default AnimeDetailPage;