import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/lib/supabase/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supaBaseClient } from '@/lib/supabase/client';
import { registerForPushNotifications } from '@/lib/supabase/services/push';
import type { DutyRole } from '@/lib/supabase/entities/types';

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
  /** Title only — confers no permissions. Access is decided by `role`. */
  duty_role?: DutyRole | null;
  /** Platform administrator. Orthogonal to `role`, not a replacement. */
  is_super_admin?: boolean;
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

/**
 * Which experience a platform admin is looking at.
 *
 * This is a view switch, not an identity switch: the signed-in user never
 * changes, so every database policy still applies to their real account. It
 * only decides which part of the app they are routed into.
 */
export type ViewAs = 'admin' | 'member';

const VIEW_AS_KEY = '@churchlife_view_as';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  /** Null when the platform admin is in their own view. */
  viewAs: ViewAs | null;
  setViewAs: (view: ViewAs | null) => void;
  /**
   * The role the app should route and render by. Equals the real role unless
   * a platform admin has switched view.
   */
  effectiveRole: UserRole;
}

const AuthContext = createContext<AuthContextType | null>(null);

const authService = new AuthService();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewAs, setViewAsState] = useState<ViewAs | null>(null);

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
    setViewAs(null);
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

  // Restore the switch across restarts, so an admin who was looking at the
  // member experience is not silently moved back on the next launch.
  useEffect(() => {
    AsyncStorage.getItem(VIEW_AS_KEY)
      .then((stored) => {
        if (stored === 'admin' || stored === 'member') setViewAsState(stored);
      })
      .catch(() => {});
  }, []);

  const setViewAs = useCallback((view: ViewAs | null) => {
    setViewAsState(view);
    const write = view
      ? AsyncStorage.setItem(VIEW_AS_KEY, view)
      : AsyncStorage.removeItem(VIEW_AS_KEY);
    write.catch(() => {});
  }, []);

  // Only a platform admin can switch, so an ordinary member cannot elevate
  // themselves by writing to storage. The database would refuse them anyway.
  const effectiveRole: UserRole =
    user?.is_super_admin && viewAs
      ? viewAs === 'admin'
        ? 'parish_admin'
        : 'member'
      : user?.role ?? 'member';

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
        viewAs: user?.is_super_admin ? viewAs : null,
        setViewAs,
        effectiveRole,
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

