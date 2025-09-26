import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { List, ListItem, Media } from '../types';
import { createList } from '../services/appwriteService';
import { fetchAnilist, mediaByIdsQuery } from '../services/anilistService';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimeCarousel from '../components/AnimeCarousel';
import { ListIcon } from '../components/icons/ListIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { XIcon } from '../components/icons/XIcon';
import GridCard from '../components/GridCard';

interface MyListPageProps {
  onCardClick: (media: Media) => void;
}

type ActiveTab = 'watching' | 'watched' | 'favorites' | 'lists';

const MyListPage: React.FC<MyListPageProps> = ({ onCardClick }) => {
  const { user, lists, listItems, isProfileLoading, refreshUserLists } = useAuth();
  const [animeData, setAnimeData] = useState<Record<string, Media[]>>({});
  const [anilistLoading, setAnilistLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('watching');

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      if (listItems.length === 0) {
        setAnimeData({});
        setAnilistLoading(false);
        return;
      }

      setAnilistLoading(true);
      try {
        const anilistIds = [...new Set(listItems.map(item => item.anilistId))];
        
        if (anilistIds.length > 0) {
          const anilistResponse = await fetchAnilist(mediaByIdsQuery, { ids: anilistIds, perPage: 50 });
          const anilistMedia = anilistResponse.data.Page.media;
          const mediaMap = new Map<number, Media>(anilistMedia.map(m => [m.id, m]));
          
          const newAnimeData: Record<string, Media[]> = {};
          lists.forEach(list => {
            const itemsInList = listItems
              .filter(item => item.listId === list.$id)
              .map(item => mediaMap.get(item.anilistId))
              .filter((m): m is Media => !!m);
            newAnimeData[list.$id] = itemsInList;
          });
          setAnimeData(newAnimeData);
        } else {
          // handles case where there are lists but no items
          const emptyAnimeData: Record<string, Media[]> = {};
          lists.forEach(list => { emptyAnimeData[list.$id] = []; });
          setAnimeData(emptyAnimeData);
        }

      } catch (error) {
        console.error("Failed to fetch anime details from AniList:", error);
      } finally {
        setAnilistLoading(false);
      }
    };

    if (!isProfileLoading) { // Only run when Appwrite data is ready
        fetchAnimeDetails();
    }
  }, [listItems, lists, isProfileLoading]);

  
  const { watchingItems, watchedItems, favoritesItems, customLists } = useMemo(() => {
    const watchingList = lists.find(l => l.systemListType === 'WATCHING');
    const watchedList = lists.find(l => l.systemListType === 'WATCHED');
    const favoritesList = lists.find(l => l.systemListType === 'FAVORITES');
    const custom = lists.filter(l => !l.isSystemList);

    return {
      watchingItems: watchingList ? animeData[watchingList.$id] || [] : [],
      watchedItems: watchedList ? animeData[watchedList.$id] || [] : [],
      favoritesItems: favoritesList ? animeData[favoritesList.$id] || [] : [],
      customLists: custom
    };
  }, [lists, animeData]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newListName.trim().length < 2) return;
    setIsCreating(true);
    setCreateError('');
    try {
        await createList(user.$id, newListName.trim());
        await refreshUserLists();
        setNewListName('');
        setShowCreateForm(false);
    } catch (error: any) {
        console.error("Failed to create list", error);
        if (error.code === 401 && error.type === 'user_unauthorized') {
            setCreateError('Permission Denied. Please ensure the "Users" role has "Create" permission for the "lists" collection in your Appwrite database settings.');
        } else {
            setCreateError(error.message || 'An unexpected error occurred.');
        }
    } finally {
        setIsCreating(false);
    }
  };
  
  const openCreateForm = () => {
    setShowCreateForm(true);
    setCreateError('');
  };

  const renderContent = () => {
    let items: Media[] = [];
    let emptyMessage = "This list is empty. Add some anime to get started!";

    if (activeTab === 'watching') items = watchingItems;
    if (activeTab === 'watched') items = watchedItems;
    if (activeTab === 'favorites') items = favoritesItems;
    
    if (activeTab === 'lists') {
      return (
        <div className="space-y-12">
           <button 
              onClick={openCreateForm}
              className="w-full flex items-center justify-center gap-2 bg-gray-800/50 hover:bg-gray-800 border border-dashed border-gray-600 group-hover:border-theme text-gray-400 hover:text-white font-bold py-6 px-4 rounded-lg transition-colors"
            >
              <PlusIcon />
              <span>Create New List</span>
            </button>
            {showCreateForm && (
            <form onSubmit={handleCreateList} className="p-6 bg-[#101014] rounded-lg border border-white/10">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="New list name..."
                        className="flex-grow bg-gray-900/50 border-white/10 rounded-lg px-4 py-2 text-white"
                        autoFocus
                    />
                    <button type="submit" disabled={isCreating} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-green-800">
                        {isCreating ? 'Creating...' : 'Create'}
                    </button>
                    <button type="button" onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-white">
                        <XIcon />
                    </button>
                </div>
                {createError && <p className="text-red-500 text-sm mt-4 text-center">{createError}</p>}
            </form>
          )}

          {customLists.length > 0 ? (
            customLists.map(list => (
              <div key={list.$id}>
                {(animeData[list.$id] && animeData[list.$id].length > 0) ? (
                  <AnimeCarousel
                    title={list.name}
                    media={animeData[list.$id]}
                    onCardClick={onCardClick}
                  />
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white px-2">{list.name}</h3>
                    <div className="text-gray-400 px-2 py-8 text-center bg-gray-900/30 rounded-lg">
                      This list is empty. Add some anime to get started!
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            !showCreateForm && <p className="text-lg text-gray-400 text-center py-20">You don't have any custom lists yet.</p>
          )}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-gray-400 px-2 py-16 text-center bg-gray-900/30 rounded-lg">
          <p>{emptyMessage}</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-5 gap-y-8">
        {items.map(item => <GridCard key={item.id} media={item} onClick={() => onCardClick(item)} />)}
      </div>
    );
  };
  
  const loading = isProfileLoading || anilistLoading;
  
  const backgroundStyle = {
      background: `radial-gradient(ellipse 80% 50% at 50% -20%, var(--theme-color-glow), transparent)`
  };

  let pageContent;

  if (loading) {
      pageContent = (
          <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-200px)]">
              <LoadingSpinner />
          </div>
      );
  } else if (!user) {
      pageContent = (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <ListIcon className="w-16 h-16 text-theme mb-6" />
              <h1 className="text-4xl font-bold text-white mb-4">My List</h1>
              <p className="text-lg text-gray-400 max-w-md">
                  <a href="#/account" className="text-theme-soft hover:text-theme hover:underline font-semibold">Log in</a> to create and view your personal anime lists.
              </p>
          </div>
      );
  } else {
      const TABS: { id: ActiveTab; label: string }[] = [
          { id: 'watching', label: 'Watching' },
          { id: 'watched', label: 'Watched' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'lists', label: 'My Lists' },
      ];
      pageContent = (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
              <h1 className="text-4xl font-bold text-white mb-8">My List</h1>
              
              <div className="mb-8 border-b border-white/10">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

              <div>{renderContent()}</div>
            </div>
      );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 transition-all duration-500 pointer-events-none" style={backgroundStyle}></div>
      <div className="relative">
        {pageContent}
      </div>
    </div>
  );
};

export default MyListPage;