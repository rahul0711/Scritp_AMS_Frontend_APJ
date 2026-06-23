import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from '@/services/auth';

interface AuthState {
  /** All allotted records returned from login (course/semester/subject combos) */
  allRecords: UserData[];
  /** The user's role */
  role: 'faculty' | 'student' | null;
  /** Whether the store has been rehydrated from storage */
  _hasHydrated: boolean;

  /** Store login result */
  setAuth: (records: UserData[], role: 'faculty' | 'student') => void;
  /** Clear everything on logout */
  logout: () => void;
  /** Mark hydration complete */
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      allRecords: [],
      role: null,
      _hasHydrated: false,

      setAuth: (records, role) => set({ allRecords: records, role }),
      logout: () => set({ allRecords: [], role: null }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      // Only persist these keys
      partialize: (state) => ({
        allRecords: state.allRecords,
        role: state.role,
      }),
    }
  )
);
