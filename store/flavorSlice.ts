import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Loggers } from "../utils/logger";

// Flavor types
export type Flavor = "HQ" | "USER" | "BRANCH";

// Flavor state interface
export interface FlavorState {
  currentFlavor: Flavor;
  loading: boolean;
  error: string | null;
}

// Storage key for flavor
const FLAVOR_STORAGE_KEY = "@flavor";

// Default flavor
const DEFAULT_FLAVOR: Flavor = "USER";

const initialState: FlavorState = {
  currentFlavor: DEFAULT_FLAVOR,
  loading: true,
  error: null,
};

// Async thunk to load flavor from storage
export const loadFlavorFromStorage = createAsyncThunk(
  "flavor/loadFromStorage",
  async () => {
    try {
      const storedFlavor = await AsyncStorage.getItem(FLAVOR_STORAGE_KEY);
      Loggers.flavor.info("Flavor loaded from storage", { storedFlavor });
      
      if (storedFlavor && ["HQ", "USER", "BRANCH"].includes(storedFlavor)) {
        return storedFlavor as Flavor;
      }
      return DEFAULT_FLAVOR;
    } catch (error) {
      Loggers.flavor.error("Failed to load flavor from storage", error);
      return DEFAULT_FLAVOR;
    }
  }
);

// Async thunk to save flavor to storage
export const saveFlavorToStorage = createAsyncThunk(
  "flavor/saveToStorage",
  async (flavor: Flavor, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem(FLAVOR_STORAGE_KEY, flavor);
      Loggers.flavor.info("Flavor saved to storage", { flavor });
      return flavor;
    } catch (error) {
      Loggers.flavor.error("Failed to save flavor to storage", error);
      return rejectWithValue("Failed to save flavor preference");
    }
  }
);

export const flavorSlice = createSlice({
  name: "flavor",
  initialState,
  reducers: {
    setFlavor: (state, action: PayloadAction<Flavor>) => {
      state.currentFlavor = action.payload;
      state.error = null;
      Loggers.flavor.info("Flavor set", { flavor: action.payload });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load from storage
    builder
      .addCase(loadFlavorFromStorage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFlavorFromStorage.fulfilled, (state, action) => {
        state.currentFlavor = action.payload;
        state.loading = false;
      })
      .addCase(loadFlavorFromStorage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to load flavor";
        state.loading = false;
      });

    // Save to storage
    builder
      .addCase(saveFlavorToStorage.pending, (state) => {
        state.error = null;
      })
      .addCase(saveFlavorToStorage.fulfilled, (state, action) => {
        state.currentFlavor = action.payload;
      })
      .addCase(saveFlavorToStorage.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to save flavor";
      });
  },
});

export const { setFlavor, clearError } = flavorSlice.actions;
export default flavorSlice.reducer;

