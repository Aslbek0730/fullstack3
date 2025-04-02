import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import paymentReducer from './slices/paymentSlice';
import testReducer from './slices/testSlice';
import rewardReducer from './slices/rewardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    payments: paymentReducer,
    test: testReducer,
    rewards: rewardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 