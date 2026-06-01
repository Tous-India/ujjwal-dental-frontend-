import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      patient: null,
      isAuthenticated: false,
      pendingEmail: null,

      login: (patient) =>
        set({
          patient,
          isAuthenticated: true,
          pendingEmail: null,
        }),

      setPendingEmail: (email) =>
        set({ pendingEmail: email }),

      updatePatient: (patientData) =>
        set((state) => ({
          patient: { ...state.patient, ...patientData },
        })),

      logout: () =>
        set({
          patient: null,
          isAuthenticated: false,
          pendingEmail: null,
        }),
    }),
    {
      name: "patient-auth",
      partialize: (state) => ({
        patient: state.patient,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
