import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPEN_GROUPS } from '@/constants/groups';

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
  groupId: string;
  groupName: string;
  role: UserRole;
  hasParishAccess: boolean;
  createdAt: string;
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
  groupId: string;
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

const AUTH_KEY = '@churchlife_user';

// ─── Mock admin user for testing admin screens ───────────────────────────
const MOCK_ADMIN: AuthUser = {
  id: 'admin-001',
  fullName: 'Fr. Emmanuel Okafor',
  email: 'admin@church.ng',
  sex: 'Male',
  birthdayMonth: 'March',
  parishId: 'p001',
  parishName: 'Holy Cross Cathedral',
  groupId: 'cmo',
  groupName: 'Catholic Men Organization',
  role: 'parish_admin',
  hasParishAccess: true,
  createdAt: new Date().toISOString(),
};

// ─── Mock regular user ───────────────────────────────────────────────────
const MOCK_USER: AuthUser = {
  id: 'user-001',
  fullName: 'Chidi Okonkwo',
  baptismalName: 'Anthony',
  email: 'chidi@example.com',
  sex: 'Male',
  birthdayMonth: 'June',
  parishId: 'p001',
  parishName: 'Holy Cross Cathedral',
  groupId: 'cyon',
  groupName: 'Catholic Youth Organization of Nigeria',
  role: 'member',
  hasParishAccess: true,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted session on app start
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {
        // ignore storage errors
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login — accept admin@church.ng / admin or any registered user
    if (email === 'admin@church.ng' && password === 'admin') {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(MOCK_ADMIN));
      setUser(MOCK_ADMIN);
      return { success: true };
    }

    if (email === 'chidi@example.com' && password === 'password') {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(MOCK_USER));
      setUser(MOCK_USER);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password. Please try again.' };
  };

  const register = async (payload: RegisterPayload) => {
    const group = OPEN_GROUPS.find((g) => g.id === payload.groupId);
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      fullName: payload.fullName,
      baptismalName: payload.baptismalName,
      email: payload.email,
      sex: payload.sex,
      birthdayMonth: payload.birthdayMonth,
      parishId: payload.parishId,
      parishName: payload.parishName,
      groupId: payload.groupId,
      groupName: group?.name ?? payload.groupId,
      role: 'member',
      hasParishAccess: payload.parishId !== null,
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  const updateUser = async (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    setUser(updated);
  };

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
