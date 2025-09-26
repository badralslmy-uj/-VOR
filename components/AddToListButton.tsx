import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Media } from '../types';
import { useAuth } from '../hooks/useAuth';
import * as appwrite from '../services/appwriteService';
import LoadingSpinner from './LoadingSpinner';
import { PlusIcon } from './icons/PlusIcon';
import { CheckIcon } from './icons/CheckIcon';

interface AddToListButtonProps {
    media: Media;
    className?: string;
}

export const AddToListButton: React.FC<AddToListButtonProps> = ({ media, className }) => {
    const { user, lists, listItems, isProfileLoading, refreshUserLists } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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


    const mediaInListsMap = useMemo(() => {
        const map = new Map<string, string>(); // listId -> listItemId
        listItems
            .filter(item => item.anilistId === media.id)
            .forEach(item => {
                map.set(item.listId, item.$id);
            });
        return map;
    }, [listItems, media.id]);

    const handleToggleInList = async (listId: string) => {
        if (!user) return;

        const listItemId = mediaInListsMap.get(listId);
        if (listItemId) {
            await appwrite.removeFromList(listItemId);
        } else {
            await appwrite.addToList(user.$id, listId, media.id);
        }
        await refreshUserLists();
    };

    if (!user) {
        return (
            <a href="#/account" className={`bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg text-white font-bold py-3 px-8 rounded-full border border-white/30 shadow-lg shadow-black/20 hover:from-white/30 hover:to-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105 ${className}`}>
                Add to List
            </a>
        );
    }
    
    if (isProfileLoading) {
        return <div className={`w-36 h-12 flex items-center justify-center ${className}`}><LoadingSpinner /></div>
    }

    return (
        <div className="relative" ref={menuRef}>
             <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center justify-center bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg text-white font-bold py-3 px-8 rounded-full border border-white/30 shadow-lg shadow-black/20 hover:from-white/30 hover:to-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105 ${className}`}
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                <span>Add to List</span>
            </button>
            {isMenuOpen && (
                <div className="absolute bottom-full mb-2 w-48 bg-gray-900/80 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl p-2 z-10 animate-fade-in-up">
                    {lists.map(list => (
                        <button 
                            key={list.$id}
                            onClick={() => handleToggleInList(list.$id)}
                            className="w-full text-left flex justify-between items-center px-3 py-2 text-sm rounded-md text-white hover:bg-theme transition-colors"
                        >
                            <span>{list.name}</span>
                            {mediaInListsMap.has(list.$id) && <CheckIcon className="w-5 h-5 text-green-400" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};