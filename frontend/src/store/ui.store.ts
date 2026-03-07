import { create } from "zustand";

interface UiState {
  dashboardSearch: string;
  setDashboardSearch: (value: string) => void;
  resetUiState: () => void;
}

const initialState = {
  dashboardSearch: "",
};

export const useUiStore = create<UiState>((set) => ({
  ...initialState,
  setDashboardSearch: (value) => set({ dashboardSearch: value }),
  resetUiState: () => set(initialState),
}));
