import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || "",
};

export const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    clearToken(state) {
      state.token = "";
      localStorage.removeItem("token");
    },
  },
});

export const { setToken, clearToken } = userSlice.actions;

export default userSlice.reducer;
