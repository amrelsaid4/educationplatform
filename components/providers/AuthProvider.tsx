"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser } from '@/lib/auth-utils';
import { getSession, getCurrentUser, logoutUser } from '@/lib/simple-auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Initializing auth...');
        const session = await getSession();
        console.log('AuthProvider: Session retrieved:', session);
        if (session) {
          setUser(session.user);
          console.log('AuthProvider: User set:', session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
        console.log('AuthProvider: Loading completed');
      }
    };

    initializeAuth();

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eduplatform_session') {
        if (e.newValue) {
          try {
            const session = JSON.parse(e.newValue);
            setUser(session.user);
          } catch (error) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signOut = async () => {
    try {
      logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUser = (newUser: AuthUser) => {
    console.log('AuthProvider: Updating user:', newUser);
    setUser(newUser);
    setLoading(false); // Ensure loading is set to false
  };

  const value = {
    user,
    loading,
    signOut,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
