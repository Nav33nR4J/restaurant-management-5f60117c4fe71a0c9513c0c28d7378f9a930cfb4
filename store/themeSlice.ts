import { createSlice } from "@reduxjs/toolkit";

import { Loggers } from "../utils/logger";

export type ThemeMode = "light" | "dark";

export interface ThemeState {
  mode: ThemeMode;
  error: string | null;
}

const initialState: ThemeState = {
  mode: "light",
  error: null,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const oldMode = state.mode;
      state.mode = state.mode === "light" ? "dark" : "light";
      state.error = null;
      Loggers.theme.info(`Theme toggled from ${oldMode} to ${state.mode}`);
    },
    setTheme: (state, action: { payload: ThemeMode }) => {
      state.mode = action.payload;
      state.error = null;
      Loggers.theme.info(`Theme set to ${action.payload}`);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;

