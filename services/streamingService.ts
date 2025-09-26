import type { Media } from '../types';

export interface StreamingServiceInfo {
  name: string;
  color: string;
}

const STREAMING_SERVICES_MAP: { [key: string]: StreamingServiceInfo } = {
    'Crunchyroll': { name: 'Crunchyroll', color: '#f47521' },
    'Funimation': { name: 'Funimation', color: '#6a329f' },
    'Netflix': { name: 'Netflix', color: '#e50914' },
    'Hulu': { name: 'Hulu', color: '#1ce783' },
    'Amazon': { name: 'Prime Video', color: '#00a8e1' },
    'HIDIVE': { name: 'HIDIVE', color: '#00aeef' },
    'VRV': { name: 'VRV', color: '#fdfd00' },
    'AnimeLab': { name: 'AnimeLab', color: '#19b2e8' },
    'Wakanim': { name: 'Wakanim', color: '#c40000' },
};

export const getStreamingInfo = (media: Media): StreamingServiceInfo | null => {
  if (!media.externalLinks) {
    return null;
  }
  
  const officialLink = media.externalLinks.find(link => STREAMING_SERVICES_MAP[link.site]);
  
  if (officialLink) {
    return STREAMING_SERVICES_MAP[officialLink.site];
  }

  return null;
};
