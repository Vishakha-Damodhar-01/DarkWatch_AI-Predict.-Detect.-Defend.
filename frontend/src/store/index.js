import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import threatReducer from './threatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    threat: threatReducer
  }
});
