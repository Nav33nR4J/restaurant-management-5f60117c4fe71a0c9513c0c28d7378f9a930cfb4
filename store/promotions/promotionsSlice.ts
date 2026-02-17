import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../utils/promotions/api";

export interface Promotion {
  id: string;
  promo_code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  current_uses?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  description?: string;
}

interface PromotionsState {
  items: Promotion[];
  loading: boolean;
  error: string | null;
}

const initialState: PromotionsState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchPromotions = createAsyncThunk(
  "promotions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/promotions");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch promotions");
    }
  }
);

export const createPromotion = createAsyncThunk(
  "promotions/create",
  async (data: Partial<Promotion>, { rejectWithValue }) => {
    try {
      const response = await api.post("/promotions", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create promotion");
    }
  }
);

export const updatePromotion = createAsyncThunk(
  "promotions/update",
  async ({ id, data }: { id: string; data: Partial<Promotion> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/promotions/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update promotion");
    }
  }
);

export const deletePromotion = createAsyncThunk(
  "promotions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/promotions/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete promotion");
    }
  }
);

export const togglePromotionStatus = createAsyncThunk(
  "promotions/toggleStatus",
  async ({ id, isActive }: { id: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/promotions/${id}`, { is_active: isActive });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to toggle promotion status");
    }
  }
);

const promotionsSlice = createSlice({
  name: "promotions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all promotions
      .addCase(fetchPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action: PayloadAction<Promotion[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create promotion
      .addCase(createPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromotion.fulfilled, (state, action: PayloadAction<Promotion>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update promotion
      .addCase(updatePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromotion.fulfilled, (state, action: PayloadAction<Promotion>) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete promotion
      .addCase(deletePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromotion.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle promotion status
      .addCase(togglePromotionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePromotionStatus.fulfilled, (state, action: PayloadAction<Promotion>) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(togglePromotionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = promotionsSlice.actions;
export default promotionsSlice.reducer;
