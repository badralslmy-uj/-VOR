import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { EyeIcon } from './icons/EyeIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { HeartIcon } from './icons/HeartIcon';

// FIX: The type for the `icon` prop was made more specific to solve a TypeScript error.
// `React.ReactElement` alone doesn't guarantee that the component accepts a `className`,
// leading to an error with `React.cloneElement`.
const StatCard: React.FC<{ value: number; label: string; icon: React.ReactElement<{ className?: string }>, gradient: string }> = ({ value, label, icon, gradient }) => (
    <div className={`relative ${gradient} p-4 rounded-lg text-center transform transition-transform hover:scale-105 overflow-hidden`}>
        <div className="absolute -top-2 -right-2 text-white/10">
            {React.cloneElement(icon, { className: "w-20 h-20" })}
        </div>
        <div className="relative">
            <p className="text-4xl font-black text-white tabular-nums drop-shadow-md">{value}</p>
            <p className="text-sm font-semibold text-gray-200 uppercase tracking-wider mt-1">{label}</p>
        </div>
    </div>
);

export const ProfileAnalysis: React.FC = () => {
    const { lists, listItems, isProfileLoading } = useAuth();
    
    const stats = useMemo(() => {
        const watchedList = lists.find(l => l.systemListType === 'WATCHED');
        const watchingList = lists.find(l => l.systemListType === 'WATCHING');
        const favoritesList = lists.find(l => l.systemListType === 'FAVORITES');
        
        const watchedCount = watchedList ? listItems.filter(i => i.listId === watchedList.$id).length : 0;
        const watchingCount = watchingList ? listItems.filter(i => i.listId === watchingList.$id).length : 0;
        const favoritesCount = favoritesList ? listItems.filter(i => i.listId === favoritesList.$id).length : 0;
        
        return { watched: watchedCount, watching: watchingCount, favorites: favoritesCount };
    }, [lists, listItems]);

    if (isProfileLoading) {
        return <div className="flex justify-center py-4"><LoadingSpinner /></div>;
    }

    return (
        <div className="mt-6 border-t border-white/10 pt-6">
            <h3 className="text-xl font-bold text-white mb-4">Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard value={stats.watching} label="Watching" icon={<EyeIcon />} gradient="bg-gradient-to-br from-blue-500 to-blue-700"/>
                <StatCard value={stats.watched} label="Watched" icon={<CheckBadgeIcon />} gradient="bg-gradient-to-br from-green-500 to-green-700"/>
                <StatCard value={stats.favorites} label="Favorites" icon={<HeartIcon />} gradient="bg-gradient-to-br from-pink-500 to-pink-700"/>
            </div>
        </div>
    );
};