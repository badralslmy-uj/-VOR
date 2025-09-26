import type { AnilistResponse, AnilistDetailResponse, AnilistStaffDetailResponse, Media } from '../types';

const ANILIST_URL = 'https://graphql.anilist.co';

export const fetchAnilist = async (query: string, variables: object): Promise<AnilistResponse> => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  const response = await fetch(ANILIST_URL, options);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from AniList API: ${response.statusText}`);
  }

  return response.json();
};

const relationNodeFields = `
  fragment relationNodeFields on Media {
    id
    title {
      romaji
      english
    }
    format
    seasonYear
    externalLinks {
      id
      site
    }
    coverImage {
      large
      color
    }
    studios(isMain: true) {
      edges {
        node {
          name
        }
      }
    }
    averageScore
  }
`;

const listMediaFragment = `
  fragment listMedia on Media {
    id
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    genres
    bannerImage
    coverImage {
      extraLarge
      large
      color
    }
    averageScore
    season
    seasonYear
    status
    format
    externalLinks {
      id
      site
    }
    studios(isMain: true) {
      edges {
        node {
          name
        }
      }
    }
    nextAiringEpisode {
      timeUntilAiring
      episode
    }
  }
`;

const detailMediaFragment = `
  ${relationNodeFields}
  fragment detailMedia on Media {
    id
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    genres
    bannerImage
    coverImage {
      extraLarge
      large
      color
    }
    averageScore
    season
    seasonYear
    status
    format
    episodes
    duration
    source(version: 2)
    countryOfOrigin
    hashtag
    trailer {
      id
      site
      thumbnail
    }
    studios(isMain: true) {
      edges {
        node {
          name
        }
      }
    }
    nextAiringEpisode {
      timeUntilAiring
      episode
    }
    relations {
      edges {
        relationType(version: 2)
        node {
          ...relationNodeFields
        }
      }
    }
    characters(sort: [ROLE, RELEVANCE, ID], perPage: 24) {
      edges {
        role
        node {
          id
          name {
            full
          }
          image {
            large
          }
        }
        voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
          id
          name {
            full
          }
          image {
            large
          }
        }
      }
    }
    staff(sort: [RELEVANCE, ID], perPage: 24) {
      edges {
        role
        node {
          id
          name {
            full
          }
          image {
            large
          }
        }
      }
    }
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }
    externalLinks {
      id
      site
    }
  }
`;

const searchMediaFragment = `
  fragment searchMedia on Media {
    id
    title {
      romaji
      english
    }
    coverImage {
      large
      color
    }
    format
    seasonYear
    status
    averageScore
    studios(isMain: true) {
      edges {
        node {
          name
        }
      }
    }
  }
`;

const scheduleMediaFragment = `
  fragment scheduleMedia on Media {
    id
    title {
      romaji
      english
    }
    coverImage {
      large
      color
    }
    studios(isMain: true) {
      edges {
        node {
          name
        }
      }
    }
    externalLinks {
      id
      site
    }
  }
`;

export const mediaDetailQuery = `
  query ($id: Int) {
    Media(id: $id) {
      ...detailMedia
    }
  }
  ${detailMediaFragment}
`;

export const fetchAnilistMediaDetail = async (id: number): Promise<AnilistDetailResponse> => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: mediaDetailQuery,
      variables: { id },
    }),
  };

  const response = await fetch(ANILIST_URL, options);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from AniList API: ${response.statusText}`);
  }

  return response.json();
};

const staffDetailFragment = `
  fragment staffDetail on Staff {
    id
    name {
      full
      native
    }
    image {
      large
    }
    description(asHtml: false)
    primaryOccupations
    characterMedia(sort: [START_DATE_DESC], perPage: 100) {
      edges {
        characterRole
        node { # Media
          ...listMedia
        }
        characters { # Character
          id
          name {
            full
          }
          image {
            large
          }
        }
      }
    }
    staffMedia(sort: [START_DATE_DESC], perPage: 100) {
       edges {
        staffRole
        node { # Media
          ...listMedia
        }
      }
    }
  }
`;

export const staffDetailQuery = `
  query ($id: Int) {
    Staff(id: $id) {
      ...staffDetail
    }
  }
  ${staffDetailFragment}
  ${listMediaFragment}
`;

export const fetchAnilistStaffDetail = async (id: number): Promise<AnilistStaffDetailResponse> => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: staffDetailQuery,
      variables: { id },
    }),
  };

  const response = await fetch(ANILIST_URL, options);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from AniList API: ${response.statusText}`);
  }

  return response.json();
};


export const trendingQuery = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: TRENDING_DESC, isAdult: false) {
        ...listMedia
      }
    }
  }
  ${listMediaFragment}
`;

export const releasingQuery = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false, status: RELEASING) {
        ...listMedia
      }
    }
  }
  ${listMediaFragment}
`;

export const popularSeasonQuery = `
  query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false, season: $season, seasonYear: $seasonYear) {
        ...listMedia
      }
    }
  }
  ${listMediaFragment}
`;

export const nextSeasonQuery = `
  query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false, season: $season, seasonYear: $seasonYear) {
        ...listMedia
      }
    }
  }
  ${listMediaFragment}
`;

export const allTimePopularQuery = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...listMedia
      }
    }
  }
  ${listMediaFragment}
`;

export const recentlyAiredQuery = `
  query ($page: Int, $perPage: Int, $airingAt_greater: Int, $airingAt_lesser: Int) {
    Page(page: $page, perPage: $perPage) {
      airingSchedules(airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: TIME_DESC, notYetAired: false) {
        id
        airingAt
        episode
        media {
          ...listMedia
        }
      }
    }
  }
  ${listMediaFragment}
`;

export const scheduleQuery = `
  query ($page: Int, $perPage: Int, $airingAt_greater: Int, $airingAt_lesser: Int) {
    Page(page: $page, perPage: $perPage) {
      airingSchedules(airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: TIME) {
        id
        airingAt
        episode
        media {
          ...scheduleMedia
        }
      }
    }
  }
  ${scheduleMediaFragment}
`;

export const searchQuery = `
  query (
    $search: String, 
    $page: Int, 
    $perPage: Int, 
    $sort: [MediaSort], 
    $season: MediaSeason, 
    $seasonYear: Int, 
    $format_in: [MediaFormat], 
    $status_in: [MediaStatus],
    $genre_in: [String]
  ) {
    Page(page: $page, perPage: $perPage) {
      media(
        search: $search, 
        type: ANIME, 
        isAdult: false, 
        sort: $sort, 
        season: $season, 
        seasonYear: $seasonYear, 
        format_in: $format_in, 
        status_in: $status_in,
        genre_in: $genre_in
      ) {
        ...searchMedia
      }
    }
  }
  ${searchMediaFragment}
`;

export const mediaByIdsQuery = `
  query ($ids: [Int], $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(id_in: $ids) {
        ...listMedia
      }
    }
  }
  ${listMediaFragment}
`;