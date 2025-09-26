import React from 'react';
import type { Media, CharacterNode } from '../types';

interface VoiceRoleCardProps {
  media: Media;
  character: CharacterNode;
  characterRole: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  onCardClick: (media: Media) => void;
}

const VoiceRoleCard: React.FC<VoiceRoleCardProps> = ({ media, character, characterRole, onCardClick }) => {
    const cardColor = media.coverImage.color || 'var(--theme-color)';

    return (
        <button
            onClick={() => onCardClick(media)}
            className="group block text-left aspect-[2/3] w-full"
        >
            <div 
                className="relative h-full rounded-lg overflow-hidden bg-gray-800 card-glow"
                style={{'--card-color': cardColor} as React.CSSProperties}
            >
                {/* Top Half: Character Image */}
                <div className="absolute top-0 left-0 right-0 h-1/2">
                    <img 
                        src={character.image.large} 
                        alt={character.name.full} 
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105" 
                    />
                </div>
                
                {/* Bottom Half: Anime Cover Image */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2">
                    <img 
                        src={media.coverImage.large} 
                        alt={media.title.romaji} 
                        className="w-full h-full object-cover object-bottom transition-transform duration-300 group-hover:scale-105" 
                    />
                </div>
                
                {/* Gradient and Text Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-3">
                    <p className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-md">
                        {character.name.full}
                    </p>
                    <p className="text-xs text-gray-300 capitalize drop-shadow-md">
                        {characterRole.toLowerCase()}
                    </p>
                    <p className="text-xs font-semibold text-theme-soft mt-2 line-clamp-2 drop-shadow-md group-hover:text-theme transition-colors">
                        {media.title.english || media.title.romaji}
                    </p>
                </div>
            </div>
        </button>
    );
};

export default VoiceRoleCard;
