import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { updateProfile, updateUserPrefs } from '../services/appwriteService';
import { ProfileAnalysis } from '../components/ProfileAnalysis';
import { SelectableAvatar, avatarFaces, avatarColors, defaultAvatarId } from '../components/SelectableAvatar';
import { Logo } from '../components/icons/Logo';

// --- Local Icon Components ---
const AtSymbolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
  </svg>
);

const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) {
          setError(null);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters long.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, username);
      }
    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (err.response && err.response.message) {
        errorMessage = err.response.message;
      } else if (err.message) {
        errorMessage = err.message;
        const lowerCaseMessage = errorMessage.toLowerCase();
        if (lowerCaseMessage.includes('failed to fetch') || lowerCaseMessage.includes('load failed') || lowerCaseMessage.includes('network request failed')) {
             errorMessage = 'Network Error: Could not connect to the server. Please check your internet connection and ensure this app\'s hostname is added to your Appwrite project platforms.';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[600px] md:grid md:grid-cols-2 rounded-xl shadow-2xl overflow-hidden glass-pane">
        {/* Branding Panel */}
        <div className="hidden md:flex flex-col items-center justify-center text-center p-12 bg-gray-900/50 relative">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-10 animate-ken-burns"
                style={{backgroundImage: `url(https://images.unsplash.com/photo-1613376023733-0a73375d8628?q=80&w=1887&auto=format&fit=crop)`}}
            ></div>
            <div className="relative z-10">
                <Logo className="h-12 text-white mx-auto" />
                <h1 className="text-3xl font-bold text-white mt-6 text-gradient">Welcome to VOR</h1>
                <p className="text-gray-300 mt-2">Your next anime obsession awaits. Discover, watch, and collect your favorites all in one place.</p>
            </div>
        </div>

        {/* Form Panel */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-white mb-6">{isLogin ? 'Log In' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                 {!isLogin && (
                    <div className="relative">
                        <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
                        <input type="text" value={username} placeholder="Username" onChange={handleInputChange(setUsername)} required className="w-full bg-gray-900/50 border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus-ring-theme transition-all duration-300" />
                    </div>
                )}
                <div className="relative">
                    <AtSymbolIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
                    <input type="email" value={email} placeholder="Email" onChange={handleInputChange(setEmail)} required className="w-full bg-gray-900/50 border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus-ring-theme transition-all duration-300" />
                </div>
                <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
                    <input type="password" value={password} placeholder="Password" onChange={handleInputChange(setPassword)} required className="w-full bg-gray-900/50 border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus-ring-theme transition-all duration-300" />
                </div>
                
                {error && <p className="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded-md">{error}</p>}

                <button type="submit" disabled={loading} className="w-full bg-theme text-white font-bold py-3 rounded-lg transition-all duration-300 cinematic-btn-glow disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <LoadingSpinner size="small" /> : (isLogin ? 'Log In' : 'Create Account')}
                </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-theme-soft hover:text-theme hover:underline ml-2">
                    {isLogin ? 'Sign up' : 'Log in'}
                </button>
            </p>
        </div>
    </div>
  );
};

const ProfileView: React.FC = () => {
    const { user, profile, logout, refreshProfile } = useAuth();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        bio: ''
    });
    const [selectedAvatarId, setSelectedAvatarId] = useState(profile?.avatar || defaultAvatarId);
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (profile) {
            setFormData({
                displayName: profile.displayName || '',
                bio: profile.bio || ''
            });
            setSelectedAvatarId(profile.avatar || defaultAvatarId);
        }
    }, [profile]);

    // Live theme preview while editing
    useEffect(() => {
        if (!isEditing) return;
        
        const hexToRgb = (hex: string): string => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
                : '139, 92, 246'; // Default purple
        };
      
        const color = selectedAvatarId.split('_')[1] || '#8b5cf6';
        const rgb = hexToRgb(color);
        document.documentElement.style.setProperty('--theme-color-rgb', rgb);

    }, [selectedAvatarId, isEditing]);


    const handleSave = async () => {
        if (!profile || !user) return;
        setIsSaving(true);
        setSaveError('');
        try {
            const profileUpdatePromise = updateProfile(profile.$id, formData);
            const prefsUpdatePromise = updateUserPrefs({ avatar: selectedAvatarId });

            await Promise.all([profileUpdatePromise, prefsUpdatePromise]);
            
            await refreshProfile();
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
            setSaveError('Could not save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const cancelEdit = () => {
      setIsEditing(false);
      if (profile) {
        // This will trigger the useEffect to revert the theme
        setSelectedAvatarId(profile.avatar || defaultAvatarId);
      }
    };

    const joinedDate = new Date(profile!.$createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const [selectedFace, selectedColor] = selectedAvatarId.split('_');

    return (
        <div className="w-full max-w-4xl mx-auto">
             <div className="glass-pane rounded-xl shadow-2xl overflow-hidden">
                <div className="px-6 md:px-8 pt-8 pb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-32 h-32 rounded-xl flex-shrink-0 overflow-hidden">
                                <SelectableAvatar avatarId={selectedAvatarId} />
                            </div>
                            <div className="pt-2 text-center sm:text-left">
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={formData.displayName} 
                                        onChange={(e) => setFormData(f => ({...f, displayName: e.target.value}))} 
                                        className="text-2xl font-bold text-white bg-gray-900/50 rounded-lg px-3 py-1 w-full focus-ring-theme" 
                                        placeholder="Display Name"
                                    />
                                ) : (
                                    <h1 className="text-2xl font-bold text-white">{profile!.displayName || profile!.username}</h1>
                                )}
                                <p className="text-md text-gray-400">@{profile!.username}</p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 mx-auto sm:mx-0">
                            {isEditing ? (
                            <div className="flex gap-2">
                                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-theme hover-bg-theme-dark text-white font-bold text-sm rounded-md transition-colors disabled:opacity-50">
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={cancelEdit} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm rounded-md transition-colors">Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white font-bold text-sm rounded-md transition-colors">
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {isEditing && (
                        <div className="mt-6 border-t border-white/10 pt-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Choose Your Look</h3>
                                <div className="flex flex-wrap gap-4">
                                    {Object.keys(avatarFaces).map(faceKey => (
                                        <button key={faceKey} onClick={() => setSelectedAvatarId(`${faceKey}_${selectedColor}`)} className={`w-16 h-16 p-1 rounded-xl overflow-hidden transition-all duration-200 ring-offset-2 ring-offset-[#16161c] ${selectedFace === faceKey ? 'ring-2 ring-theme scale-110' : 'opacity-70 hover:opacity-100'}`}>
                                        <SelectableAvatar avatarId={`${faceKey}_${selectedColor}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Choose Your Color</h3>
                                <div className="flex flex-wrap gap-4">
                                    {avatarColors.map(color => (
                                        <button key={color} onClick={() => setSelectedAvatarId(`${selectedFace}_${color}`)} className={`w-12 h-12 rounded-full transition-all duration-200 ring-offset-2 ring-offset-[#16161c] ${selectedColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`} style={{backgroundColor: color}}></button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-6 border-t border-white/10 pt-6">
                        {isEditing ? (
                            <textarea 
                            value={formData.bio} 
                            onChange={(e) => setFormData(f => ({...f, bio: e.target.value}))}
                            className="text-sm text-gray-300 bg-gray-900/50 rounded-lg px-3 py-2 w-full h-24 focus-ring-theme"
                            placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-sm text-gray-300">{profile!.bio || 'No bio yet.'}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-4">Joined {joinedDate}</p>
                        {saveError && <p className="text-red-500 text-center mt-4">{saveError}</p>}
                    </div>

                    {user && <ProfileAnalysis />}
                </div>

                <div className="text-center bg-black/20 p-4 border-t border-white/10">
                    <button onClick={logout} className="text-gray-400 hover:text-white hover:underline text-sm font-semibold">
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}

const AccountPage: React.FC = () => {
  const { user, profile, isLoading, isProfileLoading } = useAuth();
  
  if (isLoading || (user && isProfileLoading)) {
     return (
        <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-200px)]">
            <LoadingSpinner size="large" />
        </div>
    );
  }

  if (user && !profile) {
      return (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
            <p className="text-gray-400 max-w-lg mx-auto">We couldn't find a profile for your account. This can happen if the signup process was interrupted.</p>
            <p className="text-gray-400 mt-2 max-w-lg mx-auto">Please ensure the "Users" role has "Read" permission on your 'profile' collection in the Appwrite database settings.</p>
          </div>
      );
  }
  
  const backgroundStyle = {
      background: `radial-gradient(ellipse 80% 50% at 50% -20%, var(--theme-color-glow), transparent), radial-gradient(ellipse 80% 50% at 50% 120%, rgba(var(--theme-color-rgb), 0.2), transparent)`
  };

  return (
    <div className="min-h-[calc(100vh-80px)] relative flex items-center justify-center py-12">
      <div className="absolute inset-0 transition-all duration-500" style={backgroundStyle}></div>
       <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        {user ? <ProfileView /> : <AuthForm />}
      </div>
    </div>
  );
};

export default AccountPage;