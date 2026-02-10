import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import flavorReducer from "./flavorSlice";
import menuReducer from "./menuSlice";
import stockReducer from "./stockSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    theme: themeReducer,
    auth: authReducer,
    menu: menuReducer,
    stock: stockReducer,
    flavor: flavorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

