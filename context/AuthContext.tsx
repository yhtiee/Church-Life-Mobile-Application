import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/lib/supabase/services/auth';
import { supaBaseClient } from '@/lib/supabase/client';
import { registerForPushNotifications } from '@/lib/supabase/services/push';

export type UserRole = 'member' | 'group_admin' | 'parish_admin';
export type Sex = 'Male' | 'Female';
export type BirthdayMonth =
  | 'January' | 'February' | 'March' | 'April' | 'May' | 'June'
  | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

export interface AuthUser {
  id: string;
  fullName: string;
  baptismalName?: string;
  email: string;
  sex: Sex;
  birthdayMonth: BirthdayMonth;
  parishId: string | null;
  parishName: string | null;
  groupId?: string | null;
  groupName?: string | null;
  role: UserRole;
  hasParishAccess: boolean;
  createdAt: string;
  push_token?: string | null;
}

export interface RegisterPayload {
  fullName: string;
  baptismalName?: string;
  email: string;
  password: string;
  sex: Sex;
  birthdayMonth: BirthdayMonth;
  parishId: string | null;
  parishName: string | null;
  groupId?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const authService = new AuthService();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session and subscribe to auth state changes on start
  useEffect(() => {
    const restore = async () => {
      try {
        const { data: { session } } = await supaBaseClient.auth.getSession();
        if (session?.user) {
          const profile = await authService.getUserProfile(session.user.id);
          if (profile.data) {
            setUser(profile.data);
          }
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    restore();

    // Listen for auth changes to sync state
    const { data: { subscription } } = supaBaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        if (profile.data) {
          setUser(profile.data);
        } else {
          // If profiles entry is not created yet (failing or delay during registration),
          // fallback to user metadata or base profile schema
          setUser({
            id: session.user.id,
            fullName: session.user.user_metadata?.fullName || '',
            baptismalName: session.user.user_metadata?.baptismalName || '',
            email: session.user.email || '',
            sex: session.user.user_metadata?.sex || 'Male',
            birthdayMonth: session.user.user_metadata?.birthdayMonth || 'January',
            parishId: session.user.user_metadata?.parishId || null,
            parishName: session.user.user_metadata?.parishName || null,
            groupId: session.user.user_metadata?.groupId || null,
            groupName: session.user.user_metadata?.groupName || null,
            role: 'member',
            hasParishAccess: !!session.user.user_metadata?.parishId,
            createdAt: session.user.created_at,
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await authService.signInWithEmail(email, password);
    if (error) {
      return { success: false, error: error.message || 'Invalid email or password.' };
    }

    if (data?.user) {
      const profile = await authService.getUserProfile(data.user.id);
      if (profile.data) {
        setUser(profile.data);
      }
    }

    return { success: true };
  };

  const register = async (payload: RegisterPayload) => {
    const result = await authService.signUpWithEmail(payload);
    if (result.error) {
      return { success: false, error: result.error.message || 'Registration failed.' };
    }

    const { data, profile } = result;

    if (profile) {
      setUser(profile as any);
    } else if (data?.user) {
      // In case signup profile call didn't finish locally, fetch it
      const profileRes = await authService.getUserProfile(data.user.id);
      if (profileRes.data) {
        setUser(profileRes.data);
      }
    }

    return { success: true };
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateUser = async (updates: Partial<AuthUser>) => {
    if (!user) return;
    const { data, error } = await authService.updateUserProfile(user.id, updates);
    if (!error && data) {
      setUser(data);
    }
  };

  // Register push notifications when a user ID is present
  useEffect(() => {
    if (user?.id) {
      registerForPushNotifications(user.id);
    }
  }, [user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

