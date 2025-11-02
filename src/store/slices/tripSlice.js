import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateTripPlan } from "../../utils/tripPlanner";

export const generateActiveTrip = createAsyncThunk(
  "trip/generateActiveTrip",
  async ({ trip, user, navigate,callback=null }, { dispatch }) => {
    // Call your trip generation logic
    generateTripPlan(trip, user, navigate,callback);

    // Return trip so it updates the store
    return trip;
  }
);

const tripSlice = createSlice({
  name: "trip",
  initialState: {
    activeTrip: null,
    aiSuggestion: null,
    weather: null,
  },
  reducers: {
    setActiveTrip: (state, action) => {
      state.activeTrip = action.payload;
    },
    updateTrip: (state, action) => {
      state.activeTrip = { ...state.activeTrip, ...action.payload };
    },
    clearTrip: (state) => {
      state.activeTrip = null;
      state.aiSuggestion = null;
      state.weather = null;
    },
    setAISuggestion: (state, action) => {
      state.aiSuggestion = action.payload;
    },
    setWeather: (state, action) => {
      state.weather = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(generateActiveTrip.fulfilled, (state, action) => {
      state.activeTrip = action.payload;
    });
  },
});

export const {
  setActiveTrip,
  updateTrip,
  clearTrip,
  setAISuggestion,
  setWeather,
} = tripSlice.actions;

export default tripSlice.reducer;
