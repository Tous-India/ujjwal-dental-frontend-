import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAdminStore = create(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,

      login: (admin) =>
        set({
          admin,
          isAuthenticated: true,
        }),

      updateAdmin: (adminData) =>
        set((state) => ({
          admin: { ...state.admin, ...adminData },
        })),

      logout: () =>
        set({
          admin: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "admin-auth",
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
