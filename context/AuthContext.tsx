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
  phoneNumber?: string | null;
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
  phoneNumber?: string;
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
    let mounted = true;

    // Load the DB profile for a session user, falling back to auth metadata
    // if the profiles row isn't ready yet (e.g. mid-registration).
    const loadProfile = async (sessionUser: any) => {
      const profile = await authService.getUserProfile(sessionUser.id);
      if (!mounted) return;
      if (profile.data) {
        setUser(profile.data);
      } else {
        setUser({
          id: sessionUser.id,
          fullName: sessionUser.user_metadata?.fullName || '',
          baptismalName: sessionUser.user_metadata?.baptismalName || '',
          email: sessionUser.email || '',
          phoneNumber: sessionUser.user_metadata?.phoneNumber || null,
          sex: sessionUser.user_metadata?.sex || 'Male',
          birthdayMonth: sessionUser.user_metadata?.birthdayMonth || 'January',
          parishId: sessionUser.user_metadata?.parishId || null,
          parishName: sessionUser.user_metadata?.parishName || null,
          groupId: sessionUser.user_metadata?.groupId || null,
          groupName: sessionUser.user_metadata?.groupName || null,
          role: 'member',
          hasParishAccess: !!sessionUser.user_metadata?.parishId,
          createdAt: sessionUser.created_at,
        });
      }
    };

    // Initial session restore (a single profile fetch gating the splash).
    const restore = async () => {
      try {
        const { data: { session } } = await supaBaseClient.auth.getSession();
        if (session?.user) await loadProfile(session.user);
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    restore();

    // React only to *transitions* (sign-in/out, token refresh). The initial
    // event is skipped because restore() already handles it — this avoids a
    // duplicate startup fetch. Supabase calls are deferred out of the callback
    // to avoid the auth-client lock/deadlock warned about in supabase-js v2.
    const { data: { subscription } } = supaBaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      if (session?.user) {
        setTimeout(() => { if (mounted) loadProfile(session.user); }, 0);
      } else {
        setUser(null);
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
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

