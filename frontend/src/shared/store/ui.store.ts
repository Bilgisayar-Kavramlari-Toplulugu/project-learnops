import { create } from "zustand";

interface UiState {
  selectedWorkspaceId: string | null;
  dashboardSearch: string;
  setSelectedWorkspaceId: (workspaceId: string) => void;
  setDashboardSearch: (value: string) => void;
  resetUiState: () => void;
}

const initialState = {
  selectedWorkspaceId: null,
  dashboardSearch: "",
};

export const useUiStore = create<UiState>((set) => ({
  ...initialState,
  setSelectedWorkspaceId: (workspaceId) => set({ selectedWorkspaceId: workspaceId }),
  setDashboardSearch: (value) => set({ dashboardSearch: value }),
  resetUiState: () => set(initialState),
}));
