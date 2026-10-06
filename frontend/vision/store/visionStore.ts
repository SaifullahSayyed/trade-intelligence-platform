import { create } from "zustand";
import { ProvenanceDrawerPayload } from "../mock/types";

interface VisionState {
  // Density mode
  density: "comfortable" | "compact";
  toggleDensity: () => void;

  // Evidence Drawer
  drawerOpen: boolean;
  drawerPayload: ProvenanceDrawerPayload | null;
  openDrawer: (payload: ProvenanceDrawerPayload) => void;
  closeDrawer: () => void;

  // Guided Tour
  tourActive: boolean;
  tourStep: number;
  startTour: () => void;
  endTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;

  // Presenter "What's real today" menu
  presenterMenuOpen: boolean;
  setPresenterMenuOpen: (open: boolean) => void;
}

export const useVisionStore = create<VisionState>((set) => ({
  density: "comfortable",
  toggleDensity: () =>
    set((state) => ({
      density: state.density === "comfortable" ? "compact" : "comfortable",
    })),

  drawerOpen: false,
  drawerPayload: null,
  openDrawer: (payload) => set({ drawerOpen: true, drawerPayload: payload }),
  closeDrawer: () => set({ drawerOpen: false, drawerPayload: null }),

  tourActive: false,
  tourStep: 0,
  startTour: () => set({ tourActive: true, tourStep: 0 }),
  endTour: () => set({ tourActive: false, tourStep: 0 }),
  nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
  prevTourStep: () =>
    set((state) => ({ tourStep: Math.max(0, state.tourStep - 1) })),

  presenterMenuOpen: false,
  setPresenterMenuOpen: (open) => set({ presenterMenuOpen: open }),
}));

export default useVisionStore;
