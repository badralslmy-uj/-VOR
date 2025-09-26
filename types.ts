import { Models } from 'appwrite';

export interface CoverImage {
  extraLarge: string;
  large: string;
  color: string;
}

export interface Title {
  romaji: string;
  english: string;
  native: string;
}

export interface StudioEdge {
  node: {
    name: string;
  };
}

export interface Studios {
  edges: StudioEdge[];
}

export interface ExternalLink {
  id: number;
  site: string;
}

export interface NextAiringEpisode {
  timeUntilAiring: number;
  episode: number;
}

export interface RelationNode {
  id: number;
  title: Title;
  format: Media['format'];
  seasonYear?: number;
  externalLinks: ExternalLink[];
  relations?: MediaRelations;
}

export interface RelationEdge {
  relationType: string;
  node: RelationNode;
}

export interface MediaRelations {
  edges: RelationEdge[];
}

// For Characters
export interface CharacterImage {
  large: string;
}

export interface CharacterName {
  full: string;
}

export interface VoiceActor {
  id: number;
  name: CharacterName;
  image: CharacterImage;
}

export interface CharacterNode {
  id: number;
  name: CharacterName;
  image: CharacterImage;
}

export interface CharacterEdge {
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  node: CharacterNode;
  voiceActors: VoiceActor[];
}

export interface CharacterConnection {
  edges: CharacterEdge[];
}

// For Staff
export interface StaffImage {
  large: string;
}

export interface StaffName {
  full: string;
  native?: string;
}

export interface StaffNode {
  id: number;
  name: StaffName;
  image: StaffImage;
}

export interface StaffEdge {
  role: string;
  node: StaffNode;
}

export interface StaffConnection {
  edges: StaffEdge[];
}

// For Trailer
export interface Trailer {
  id: string;
  site: string;
  thumbnail: string;
}

// For Streaming Episodes
export interface StreamingEpisode {
  title: string;
  thumbnail: string;
  url: string;
  site: string;
}

export interface Media {
  id: number;
  title: Title;
  description: string;
  genres: string[];
  bannerImage: string;
  coverImage: CoverImage;
  averageScore: number;
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  seasonYear: number;
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  studios: Studios;
  format: 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC' | 'MANGA' | 'NOVEL' | 'ONE_SHOT';
  episodes?: number;
  duration?: number;
  source?: string;
  countryOfOrigin?: string;
  hashtag?: string;
  externalLinks: ExternalLink[];
  nextAiringEpisode?: NextAiringEpisode;
  relations?: MediaRelations;
  characters?: CharacterConnection;
  staff?: StaffConnection;
  trailer?: Trailer;
  streamingEpisodes?: StreamingEpisode[];
}

// For Staff Detail Page
export interface CharacterMediaEdge {
  characterRole: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  node: Media; // The anime media
  characters: CharacterNode[]; // The character(s) voiced in this media
}

export interface CharacterMediaConnection {
  edges: CharacterMediaEdge[];
}

export interface StaffMediaEdge {
  staffRole: string;
  node: Media; // The anime media
}

export interface StaffMediaConnection {
  edges: StaffMediaEdge[];
}

export interface StaffDetail {
  id: number;
  name: StaffName;
  image: StaffImage;
  description: string;
  primaryOccupations: string[];
  characterMedia: CharacterMediaConnection;
  staffMedia: StaffMediaConnection;
}


export interface Page {
  media: Media[];
}

export interface AnilistResponse {
  data: {
    Page: Page;
  };
}

export interface AnilistDetailResponse {
  data: {
    Media: Media;
  };
}

export interface AnilistStaffDetailResponse {
  data: {
    Staff: StaffDetail;
  };
}

export interface HeroSlideData {
  media: Media;
  category: string;
}

// Fanart.tv Types
export interface FanartImage {
  id: string;
  url: string;
  lang: string;
  likes: string;
}

export interface FanartImages {
  name: string;
  // TV properties
  thetvdb_id?: string;
  hdtvlogo?: FanartImage[];
  clearlogo?: FanartImage[];
  showbackground?: FanartImage[];
  tvthumb?: FanartImage[];
  tvbanner?: FanartImage[];
  tvposter?: FanartImage[];
  // Movie properties
  tmdb_id?: string;
  hdmovielogo?: FanartImage[];
  movielogo?: FanartImage[];
  moviebackground?: FanartImage[];
  movieposter?: FanartImage[];
}

// TVDB Types
export interface TvdbSearchResult {
  tvdb_id: string;
  name: string;
  year?: string;
  image_url: string;
  status: {
    id: number;
    name: string;
    recordType: string;
    keepUpdated: boolean;
  }
}

export interface AiringSchedule {
  id: number;
  airingAt: number;
  episode: number;
  media: Media;
}

export interface AiringSchedulePage {
  airingSchedules: AiringSchedule[];
}

export interface FanartData {
  posterUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
}


// Appwrite & Auth Types
export type Profile = Models.Document & {
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string; // e.g. "happy_#8b5cf6"
  bio?: string;
};

export type List = Models.Document & {
  ownerId: string;
  name: string;
  description?: string;
  isSystemList: boolean;
  systemListType?: 'WATCHING' | 'WATCHED' | 'FAVORITES';
};

export type ListItem = Models.Document & {
  ownerId: string;
  listId: string;
  anilistId: number;
  addedAt: string; // ISO 8601 timestamp
};

export type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  profile: Profile | null;
  lists: List[];
  listItems: ListItem[];
  isLoading: boolean;
  isProfileLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUserLists: () => Promise<void>;
};