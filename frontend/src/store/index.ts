import { configureStore } from '@reduxjs/toolkit'
import type { ThunkAction, Action, Middleware, MiddlewareAPI } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import courseReducer from './slices/courseSlice'
import paymentReducer from './slices/paymentSlice'
import testReducer from './slices/testSlice'
import rewardReducer from './slices/rewardSlice'
import chatbotReducer from './slices/chatbotSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    payments: paymentReducer,
    test: testReducer,
    reward: rewardReducer,
    chatbot: chatbotReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.MODE !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

export const selectCurrentPayment = (state: RootState) => state.payments.currentPayment
export const selectPaymentMethods = (state: RootState) => state.payments.paymentMethods
export const selectAvailableDiscounts = (state: RootState) => state.payments.availableDiscounts
export const selectLoading = (state: RootState) => state.payments.loading
export const selectError = (state: RootState) => state.payments.error

export default store 