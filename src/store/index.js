import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import tripReducer from "./slices/tripSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    trip: tripReducer,
  },
});

export default store;
