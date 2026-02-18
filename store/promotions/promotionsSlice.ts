import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../utils/promotions/api";

// Custom item discount for CUSTOM_ITEMS promotions
export interface CustomItemDiscount {
  item_id: string;
  item_name: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: number;
}

export interface Promotion {
  id: string;
  promo_code: string;
  title: string;
  type: "PERCENTAGE" | "FIXED" | "CUSTOM_ITEMS";
  value: number;
  start_at: string;
  end_at: string;
  status: "ACTIVE" | "INACTIVE";
  usage_limit: number | null;
  usage_count: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  description: string | null;
  custom_items?: CustomItemDiscount[];
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
      return response.data.data as Promotion[];
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
      return response.data.data as Promotion;
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
      return response.data.data as Promotion;
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
      const response = await api.patch(`/promotions/${id}/toggle`);
      return response.data.data as Promotion;
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

