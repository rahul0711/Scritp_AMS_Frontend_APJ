import { UserData, StudentData } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  /** All allotted records returned from login (course/semester/subject combos) */
  allRecords: UserData[];
  /** Logged in student data */
  studentData: StudentData | null;
  /** The user's role */
  role: 'faculty' | 'student' | null;
  /** Whether the store has been rehydrated from storage */
  _hasHydrated: boolean;

  /** Store login result */
  setAuth: (records: UserData[], role: 'faculty' | 'student', studentData?: StudentData | null) => void;
  /** Clear everything on logout */
  logout: () => void;
  /** Mark hydration complete */
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      allRecords: [],
      studentData: null,
      role: null,
      _hasHydrated: false,

      setAuth: (records, role, studentData = null) => set({ allRecords: records, role, studentData }),
      logout: () => set({ allRecords: [], role: null, studentData: null }),
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
        studentData: state.studentData,
        role: state.role,
      }),
    }
  )
);
