import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { account, signup as signupService, createProfile, createDefaultLists, getProfile as fetchProfile, getLists, getListItems as fetchListItems } from '../services/appwriteService';
import type { Models } from 'appwrite';
import type { AuthContextType, Profile, List, ListItem } from '../types';
import { defaultAvatarId } from '../components/SelectableAvatar';

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '139, 92, 246'; // Default purple
};

const applyTheme = (avatarId: string | undefined) => {
  const color = (avatarId || defaultAvatarId).split('_')[1] || '#8b5cf6';
  const rgb = hexToRgb(color);
  document.documentElement.style.setProperty('--theme-color-rgb', rgb);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const fetchAndSetUserLists = async (currentUserId: string) => {
      try {
          const listResponse = await getLists(currentUserId);
          const userLists = listResponse.documents;
          setLists(userLists);

          if (userLists.length > 0) {
              const listItemsResponse = await fetchListItems(userLists.map(l => l.$id));
              setListItems(listItemsResponse.documents);
          } else {
              setListItems([]);
          }
      } catch (e) {
          console.error("Failed to fetch user lists:", e);
          setLists([]);
          setListItems([]);
      }
  };
  
  const refreshUserLists = async () => {
    if (user) {
      await fetchAndSetUserLists(user.$id);
    }
  };

  const fetchAndSetAugmentedProfile = async (currentUser: Models.User<Models.Preferences>) => {
    setIsProfileLoading(true);
    try {
        let rawProfile = await fetchProfile(currentUser.$id);

        // SELF-HEALING: If a user from Auth doesn't have a profile doc, create one.
        if (!rawProfile) {
            console.warn(`Profile not found for user ${currentUser.$id}. Creating one now.`);
            await createProfile(currentUser.$id, currentUser.name);
            
            // Also create default lists if the user has none.
            const userListsCheck = await getLists(currentUser.$id);
            if (userListsCheck.total === 0) {
              console.warn(`Default lists not found for user ${currentUser.$id}. Creating them now.`);
              await createDefaultLists(currentUser.$id);
            }

            // Re-fetch the profile now that it's created.
            rawProfile = await fetchProfile(currentUser.$id);
        }
        
        if (rawProfile) {
            // Augment the profile with avatar from user preferences
            const augmentedProfile = { ...rawProfile } as Profile;
            augmentedProfile.avatar = (currentUser.prefs as { avatar?: string }).avatar || defaultAvatarId;
            setProfile(augmentedProfile);
            applyTheme(augmentedProfile.avatar);
            
            // Fetch lists after profile is confirmed to exist
            await fetchAndSetUserLists(currentUser.$id);
        } else {
            setProfile(null);
            setLists([]);
            setListItems([]);
            applyTheme(undefined);
        }
       
    } catch (e) {
        console.error("Failed to fetch profile and lists:", e);
        setProfile(null);
        setLists([]);
        setListItems([]);
        applyTheme(undefined);
    } finally {
        setIsProfileLoading(false);
    }
  };
  
  const refreshProfile = async () => {
    try {
      // Always refetch the user object to get the latest data, including prefs.
      const currentUser = await account.get();
      setUser(currentUser);
      await fetchAndSetAugmentedProfile(currentUser);
    } catch (e) {
      console.error("Failed to refresh user session, logging out.", e);
      // If the session is invalid, clear the user state.
      setUser(null);
      setProfile(null);
      setLists([]);
      setListItems([]);
      applyTheme(undefined);
    }
  };


  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        await fetchAndSetAugmentedProfile(currentUser);
      } catch (error) {
        setUser(null);
        setProfile(null);
        setLists([]);
        setListItems([]);
        setIsProfileLoading(false); // Ensure profile loading is false if auth fails
        applyTheme(undefined);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email: string, pass: string) => {
    await account.createEmailPasswordSession(email, pass);
    const currentUser = await account.get();
    setUser(currentUser);
    await fetchAndSetAugmentedProfile(currentUser);
  };

  const signup = async (email: string, pass: string, username: string) => {
    // 1. Create the user in Appwrite Auth
    const newUser = await signupService(email, pass, username);
    
    // 2. Log the new user in to create a session
    await account.createEmailPasswordSession(email, pass);
    
    // 3. With an active session, create the required DB documents
    await createProfile(newUser.$id, username);
    await createDefaultLists(newUser.$id);
    
    // 4. Fetch the full user and profile data to update the context state
    const currentUser = await account.get();
    setUser(currentUser);
    await fetchAndSetAugmentedProfile(currentUser);
  };

  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
    setProfile(null);
    setLists([]);
    setListItems([]);
    applyTheme(undefined);
    // Use hash navigation to redirect to home page after logout
    window.location.hash = '/';
  };

  return (
    <AuthContext.Provider value={{ user, profile, lists, listItems, isLoading, isProfileLoading, login, signup, logout, refreshProfile, refreshUserLists }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
