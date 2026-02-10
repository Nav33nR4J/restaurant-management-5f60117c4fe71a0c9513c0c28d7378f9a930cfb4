import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Loggers } from "../utils/logger";

export interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  loading: true,
  error: null,
};

const AUTH_STORAGE_KEY = "@auth_user_data";
const ASYNC_STORAGE_TIMEOUT = 5000; // 5 second timeout

// Helper function to wrap AsyncStorage operations with timeout
const asyncStorageWithTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = ASYNC_STORAGE_TIMEOUT
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`AsyncStorage operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

// Async thunks for storage operations
export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUserFromStorage",
  async () => {
    const userData = await asyncStorageWithTimeout(
      AsyncStorage.getItem(AUTH_STORAGE_KEY)
    );
    if (userData) {
      return JSON.parse(userData) as UserData;
    }
    return null;
  }
);

export const saveUserToStorage = createAsyncThunk(
  "auth/saveUserToStorage",
  async (user: UserData) => {
    await asyncStorageWithTimeout(
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    );
    return user;
  }
);

export const clearUserFromStorage = createAsyncThunk(
  "auth/clearUserFromStorage",
  async () => {
    await asyncStorageWithTimeout(AsyncStorage.removeItem(AUTH_STORAGE_KEY));
    return null;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromStorage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isLoggedIn = true;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load user";
        Loggers.auth.error("Failed to load user from storage", action.error);
      })
      .addCase(saveUserToStorage.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(saveUserToStorage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to save user";
        Loggers.auth.error("Failed to save user to storage", action.error);
      })
      .addCase(clearUserFromStorage.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(clearUserFromStorage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to clear user";
        Loggers.auth.error("Failed to clear user from storage", action.error);
      });
  },
});

export const { setUser, logout, setLoading, updateUser } = authSlice.actions;
export default authSlice.reducer;

