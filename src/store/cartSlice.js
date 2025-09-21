import { createSlice } from "@reduxjs/toolkit";

const loadLocalItems = () => {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem("guest_cart");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const initialState = {
  localItems: loadLocalItems(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addLocalItem(state, action) {
      state.localItems.push(action.payload);
    },
    updateLocalItem(state, action) {
      const { id, changes } = action.payload;
      const idx = state.localItems.findIndex((it) => it.id === id);
      if (idx !== -1) state.localItems[idx] = { ...state.localItems[idx], ...changes };
    },
    removeLocalItem(state, action) {
      state.localItems = state.localItems.filter((it) => it.id !== action.payload);
    },
    setLocalItems(state, action) {
      state.localItems = action.payload || [];
    },
    clearLocalItems(state) {
      state.localItems = [];
    },
  },
});

export const { addLocalItem, updateLocalItem, removeLocalItem, setLocalItems, clearLocalItems } = cartSlice.actions;
export default cartSlice.reducer;
