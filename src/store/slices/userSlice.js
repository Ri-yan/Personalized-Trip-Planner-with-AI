import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    current: null,
    pastTrips: [],
    loading: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.current = action.payload;
    },
    clearUser: (state) => {
      state.current = null;
      state.pastTrips = [];
    },
    setPastTrips: (state, action) => {
      state.pastTrips = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, clearUser, setPastTrips, setLoading } =
  userSlice.actions;

export default userSlice.reducer;
