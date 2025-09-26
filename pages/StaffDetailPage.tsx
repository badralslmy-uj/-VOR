import React, { useState, useEffect, useMemo } from 'react';
import { fetchAnilistStaffDetail } from '../services/anilistService';
import type { StaffDetail, Media, CharacterNode } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import VoiceRoleCard from '../components/VoiceRoleCard';
import RoleAnimeCarousel from '../components/RoleAnimeCarousel';

type ValidatedVoiceRole = {
    id: string; // Composite key for React: mediaId-characterId
    media: Media;
    character: CharacterNode;
    characterRole: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
};

const StaffHeader: React.FC<{ staff: StaffDetail }> = ({ staff }) => (
    <div className="relative h-[40vh] md:h-[50vh] w-full flex flex-col items-center justify-end pb-8 bg-black/50">
        <div
            className="absolute inset-0 transition-all duration-1000 ease-in-out"
            style={{ background: `radial-gradient(ellipse 100% 70% at 50% 30%, var(--theme-color-glow), transparent 70%)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/60 to-transparent"></div>
        
        <div className="relative text-center z-10">
            <div 
                className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-theme-soft shadow-2xl mb-4"
                style={{boxShadow: `0 0 30px 5px var(--theme-color-glow)`}}
            >
                <img 
                  src={staff.image?.large} 
                  alt={staff.name.full} 
                  className="w-full h-full object-cover bg-gray-800"
                />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gradient drop-shadow-lg leading-tight">
                {staff.name.full}
            </h1>
            {staff.name.native && (
                <p className="text-lg text-gray-400 font-medium mt-1">{staff.name.native}</p>
            )}
             <p className="text-gray-300 font-semibold mt-2">
                {(staff.primaryOccupations || []).join(' • ')}
            </p>
        </div>
    </div>
);

const AboutSection: React.FC<{ description: string | undefined | null }> = ({ description }) => {
    if (!description) return null;
    
    const cleanedDescription = description.replace(/<[^>]*>?/gm, '');
    if (!cleanedDescription.trim()) return null;

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">About</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-w-4xl">{cleanedDescription}</p>
        </div>
    );
};

const VoiceRolesGrid: React.FC<{ roles: ValidatedVoiceRole[], onCardClick: (media: Media) => void }> = ({ roles, onCardClick }) => {
    if (roles.length === 0) return null;

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Voice Roles</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-5 gap-y-8">
                {roles.map(role => (
                    <VoiceRoleCard
                      key={role.id}
                      media={role.media}
                      character={role.character}
                      characterRole={role.characterRole}
                      onCardClick={onCardClick} 
                    />
                ))}
            </div>
        </div>
    );
};


const StaffRolesSection: React.FC<{ staffRoles: [string, (Media & {role: string})[]][], onCardClick: (media: Media) => void }> = ({ staffRoles, onCardClick }) => {
    if (staffRoles.length === 0) return null;

    return (
        <div className="space-y-12">
             {staffRoles.map(([role, mediaList]) => (
                 <RoleAnimeCarousel 
                    key={role}
                    title={`${role} Works`}
                    media={mediaList}
                    onCardClick={onCardClick}
                 />
             ))}
         </div>
    );
};
interface StaffDetailPageProps {
    id: number;
    onCardClick: (media: Media) => void;
}

const StaffDetailPage: React.FC<StaffDetailPageProps> = ({ id, onCardClick }) => {
    const [staff, setStaff] = useState<StaffDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            setError(null);
            setStaff(null);
            try {
                const response = await fetchAnilistStaffDetail(id);
                if (response.data.Staff) {
                    setStaff(response.data.Staff);
                } else {
                    setError('Staff member not found.');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not load staff details.');
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
        window.scrollTo(0, 0);
    }, [id]);

    const validatedVoiceRoles = useMemo((): ValidatedVoiceRole[] => {
        if (!staff?.characterMedia?.edges) return [];

        const validRoles: ValidatedVoiceRole[] = [];

        for (const edge of staff.characterMedia.edges) {
            try {
                // This structure will throw an error if any property in the chain is null/undefined,
                // which will be caught by the catch block. This is safer than a long if-statement.
                const media = edge.node;
                const character = edge.characters[0];

                if (!media || !character) continue;

                // Create a validated role object. Accessing properties will throw if they don't exist.
                const role: ValidatedVoiceRole = {
                    id: `${media.id}-${character.id}`,
                    media: media,
                    character: character,
                    characterRole: edge.characterRole,
                };
                
                // Final check on primitive values needed for rendering to be safe.
                if (role.id && role.media.coverImage.large && role.character.image.large && role.character.name.full) {
                    validRoles.push(role);
                }

            } catch (e) {
                console.warn("Skipping invalid voice role data from AniList:", edge, e);
            }
        }
        
        // Deduplicate roles, as the API can sometimes return the same character in the same media multiple times.
        const uniqueRoles = new Map<string, ValidatedVoiceRole>();
        for (const role of validRoles) {
            if (!uniqueRoles.has(role.id)) {
                uniqueRoles.set(role.id, role);
            }
        }

        return Array.from(uniqueRoles.values());
    }, [staff]);

    const staffRoles = useMemo((): [string, (Media & {role: string})[]][] => {
        if (!staff?.staffMedia?.edges) return [];
        
        const rolesMap = new Map<string, (Media & {role: string})[]>();
        
        for (const edge of staff.staffMedia.edges) {
            try {
                // Ensure edge, node, role, and required image data exist.
                if (edge && edge.node && edge.staffRole && edge.node.coverImage.large) {
                    const mediaWithRole = { ...edge.node, role: edge.staffRole };
                    
                    if (!rolesMap.has(edge.staffRole)) {
                        rolesMap.set(edge.staffRole, []);
                    }
                    
                    const existingMedia = rolesMap.get(edge.staffRole)!;
                    // Prevent duplicate media entries within the same role category.
                    if (!existingMedia.some(m => m.id === mediaWithRole.id)) {
                        existingMedia.push(mediaWithRole);
                    }
                }
            } catch (e) {
                console.warn("Skipping invalid staff role data from AniList:", edge, e);
            }
        }
        
        return Array.from(rolesMap.entries());
    }, [staff]);

    if (loading) {
        return <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-200px)]"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-200px)]"><p className="text-red-500">{error}</p></div>;
    }

    if (!staff) {
        return <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-200px)]"><p className="text-gray-400">Staff member not found.</p></div>;
    }
    
    const hasContent = validatedVoiceRoles.length > 0 || staffRoles.length > 0 || (staff.description && staff.description.replace(/<[^>]*>?/gm, '').trim() !== '');

    return (
        <div className="animate-fade-in">
            <StaffHeader staff={staff} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                <AboutSection description={staff.description} />
                <VoiceRolesGrid roles={validatedVoiceRoles} onCardClick={onCardClick} />
                <StaffRolesSection staffRoles={staffRoles} onCardClick={onCardClick} />
                
                {!hasContent && (
                     <div className="text-center py-20 text-gray-400">
                        <p>No detailed information available for this staff member.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDetailPage;
