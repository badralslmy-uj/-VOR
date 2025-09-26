import { Client, Account, Databases, ID, Query, Models, Storage, Permission, Role } from 'appwrite';
import type { Profile, List, ListItem } from '../types';

// --- Appwrite Configuration ---
// IMPORTANT: Make sure these values match your Appwrite project.
const PROJECT_ID = '68a480280023f26bf00a';
const API_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const DATABASE_ID = '68c20db20026dc12aae1';

const PROFILES_COLLECTION_ID = 'profile';
const LISTS_COLLECTION_ID = 'lists';
const LIST_ITEMS_COLLECTION_ID = 'list_items';

// IMPORTANT: Create a bucket with this ID in your Appwrite Storage.
const USER_ASSETS_BUCKET_ID = 'user_assets';
// ------------------------------

const client = new Client()
    .setEndpoint(API_ENDPOINT)
    .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// --- User Account Management ---

export const signup = (email: string, pass: string, username: string): Promise<Models.User<Models.Preferences>> => {
    return account.create(ID.unique(), email, pass, username);
};

export const updateUserPrefs = (prefs: Partial<{ avatar: string }>): Promise<Models.User<Models.Preferences>> => {
    return account.updatePrefs(prefs);
};


// --- Profile Management ---

export const createProfile = (userId: string, username:string): Promise<Profile> => {
    return databases.createDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        ID.unique(),
        { userId, username }
    );
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
    try {
        const response = await databases.listDocuments<Profile>(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            [Query.equal('userId', userId), Query.limit(1)]
        );
        return response.documents[0] || null;
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        return null;
    }
};

export const updateProfile = (profileId: string, data: { username?: string, displayName?: string, bio?: string }): Promise<Models.Document> => {
    // Filter out undefined values so we don't overwrite fields with nothing
    const cleanData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    return databases.updateDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        profileId,
        cleanData
    );
};

// --- Storage (File Uploads) ---

// FIX: The Appwrite SDK in use seems to return a string for getFilePreview, contrary to its type definition.
// This was causing a "Type 'string' is not assignable to type 'URL'" error.
// We cast the result to `any` and construct a new URL object to satisfy the function's return type contract.
export const getImageUrl = (fileId: string): URL => {
    return new URL(storage.getFilePreview(
        USER_ASSETS_BUCKET_ID,
        fileId
    ) as any);
};


// --- List Management ---

export const createDefaultLists = async (userId: string): Promise<void> => {
    const defaultLists = [
        { name: 'Watching', isSystemList: true, systemListType: 'WATCHING' },
        { name: 'Watched', isSystemList: true, systemListType: 'WATCHED' },
        { name: 'Favorites', isSystemList: true, systemListType: 'FAVORITES' },
    ];

    const promises = defaultLists.map(list => 
        databases.createDocument(
            DATABASE_ID,
            LISTS_COLLECTION_ID,
            ID.unique(),
            { ownerId: userId, ...list }
        )
    );
    await Promise.all(promises);
};

export const createList = (userId: string, name: string): Promise<List> => {
    return databases.createDocument(
        DATABASE_ID,
        LISTS_COLLECTION_ID,
        ID.unique(),
        {
            ownerId: userId,
            name,
            isSystemList: false
        }
    );
};

export const getLists = (userId: string): Promise<Models.DocumentList<List>> => {
    return databases.listDocuments(
        DATABASE_ID,
        LISTS_COLLECTION_ID,
        [Query.equal('ownerId', userId)]
    );
};

export const getListItems = (listIds: string[]): Promise<Models.DocumentList<ListItem>> => {
    if (listIds.length === 0) return Promise.resolve({ total: 0, documents: [] });
    return databases.listDocuments(
        DATABASE_ID,
        LIST_ITEMS_COLLECTION_ID,
        [Query.equal('listId', listIds), Query.limit(5000)]
    );
};


export const addToList = (ownerId: string, listId: string, anilistId: number): Promise<ListItem> => {
    return databases.createDocument(
        DATABASE_ID,
        LIST_ITEMS_COLLECTION_ID,
        ID.unique(),
        { ownerId, listId, anilistId, addedAt: new Date().toISOString() }
    );
};

export const removeFromList = (listItemId: string): Promise<{}> => {
    return databases.deleteDocument(
        DATABASE_ID,
        LIST_ITEMS_COLLECTION_ID,
        listItemId
    );
};

export const getAnimeListItems = (ownerId: string, anilistId: number): Promise<Models.DocumentList<ListItem>> => {
     return databases.listDocuments(
        DATABASE_ID,
        LIST_ITEMS_COLLECTION_ID,
        [
            Query.equal('ownerId', ownerId),
            Query.equal('anilistId', anilistId),
        ]
    );
};