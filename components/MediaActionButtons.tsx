import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Media } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as appwrite from '../services/appwriteService';
import LoadingSpinner from './LoadingSpinner';
import { PlusIcon } from './icons/PlusIcon';
import { CheckIcon } from './icons/CheckIcon';
import { EyeIcon } from './icons/EyeIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { HeartIcon } from './icons/HeartIcon';

const ActionButton: React.FC<{
    label: string;
    isActive: boolean;
    isLoading: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ label, isActive, isLoading, onClick, children }) => {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                disabled={isLoading}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cinematic-btn-glow disabled:opacity-50 disabled:cursor-wait ${
                    isActive
                        ? 'bg-theme text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
                aria-label={label}
            >
                {isLoading ? <LoadingSpinner size="small" /> : children}
            </button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {label}
            </div>
        </div>
    );
};


export const MediaActionButtons: React.FC<{ media: Media }> = ({ media }) => {
    const { user, lists, listItems, isProfileLoading, refreshUserLists } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isToggling, setIsToggling] = useState<string | null>(null); // listId of the list being toggled
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { systemLists, customLists, mediaInListsMap } = useMemo(() => {
        const watching = lists.find(l => l.systemListType === 'WATCHING');
        const watched = lists.find(l => l.systemListType === 'WATCHED');
        const favorites = lists.find(l => l.systemListType === 'FAVORITES');
        
        const system = {
            WATCHING: watching,
            WATCHED: watched,
            FAVORITES: favorites,
        };
        const custom = lists.filter(l => !l.isSystemList);

        const map = new Map<string, string>(); // listId -> listItemId
        listItems
            .filter(item => item.anilistId === media.id)
            .forEach(item => {
                map.set(item.listId, item.$id);
            });

        return { systemLists: system, customLists: custom, mediaInListsMap: map };
    }, [lists, listItems, media.id]);


    const handleToggle = async (listId: string | undefined) => {
        if (!user || !listId || isToggling) return;

        setIsToggling(listId);
        try {
            const listItemId = mediaInListsMap.get(listId);
            if (listItemId) {
                await appwrite.removeFromList(listItemId);
            } else {
                await appwrite.addToList(user.$id, listId, media.id);
            }
            await refreshUserLists();
        } catch (error) {
            console.error('Failed to toggle list item:', error);
        } finally {
            setIsToggling(null);
        }
    };
    
    if (isProfileLoading) {
        return <div className="h-12 w-48 flex items-center justify-center"><LoadingSpinner/></div>
    }

    if (!user) return null;

    const watchingList = systemLists.WATCHING;
    const watchedList = systemLists.WATCHED;
    const favoritesList = systemLists.FAVORITES;

    const isInWatching = watchingList ? mediaInListsMap.has(watchingList.$id) : false;
    const isInWatched = watchedList ? mediaInListsMap.has(watchedList.$id) : false;
    const isInFavorites = favoritesList ? mediaInListsMap.has(favoritesList.$id) : false;

    return (
        <div className="flex items-center gap-4">
            {watchingList && (
                <ActionButton
                    label={isInWatching ? "Remove from Watching" : "Add to Watching"}
                    isActive={isInWatching}
                    isLoading={isToggling === watchingList.$id}
                    onClick={() => handleToggle(watchingList?.$id)}
                >
                    <EyeIcon className="w-6 h-6" />
                </ActionButton>
            )}
             {watchedList && (
                <ActionButton
                    label={isInWatched ? "Remove from Watched" : "Add to Watched"}
                    isActive={isInWatched}
                    isLoading={isToggling === watchedList.$id}
                    onClick={() => handleToggle(watchedList?.$id)}
                >
                    <CheckBadgeIcon className="w-6 h-6" />
                </ActionButton>
            )}
            {favoritesList && (
                <ActionButton
                    label={isInFavorites ? "Remove from Favorites" : "Add to Favorites"}
                    isActive={isInFavorites}
                    isLoading={isToggling === favoritesList.$id}
                    onClick={() => handleToggle(favoritesList?.$id)}
                >
                    <HeartIcon className="w-6 h-6" />
                </ActionButton>
            )}
            
            {customLists.length > 0 && (
                <div className="relative" ref={menuRef}>
                    <div className="relative group">
                         <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white cinematic-btn-glow"
                            aria-label="Add to a custom list"
                        >
                            <PlusIcon className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Add to list
                        </div>
                    </div>
                    {isMenuOpen && (
                         <div className="absolute bottom-full right-0 sm:left-0 sm:right-auto mb-2 w-48 bg-gray-900/80 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl p-2 z-10 animate-fade-in-up">
                            {customLists.map(list => (
                                <button
                                    key={list.$id}
                                    onClick={() => handleToggle(list.$id)}
                                    disabled={!!isToggling}
                                    className="w-full text-left flex justify-between items-center px-3 py-2 text-sm rounded-md text-white hover:bg-theme transition-colors disabled:opacity-50"
                                >
                                    <span>{list.name}</span>
                                    {isToggling === list.$id 
                                        ? <LoadingSpinner size="small" /> 
                                        : mediaInListsMap.has(list.$id) && <CheckIcon className="w-5 h-5 text-green-400" />
                                    }
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};