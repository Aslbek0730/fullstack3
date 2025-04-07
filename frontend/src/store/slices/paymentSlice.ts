import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { RootState } from '../store';
import api from '../../api';

export type PaymentProvider = 'click' | 'payme' | 'uzum';

export interface PaymentMethod {
  id: string;
  name: string;
  provider: PaymentProvider;
  logo: string;
}

export interface Discount {
  id: string;
  code: string;
  percentage: number;
  validUntil: string;
}

export interface Payment {
  id: string;
  courseId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  provider: PaymentProvider;
  transactionId: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentState {
  currentPayment: Payment | null;
  paymentMethods: PaymentMethod[];
  availableDiscounts: Discount[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  currentPayment: null,
  paymentMethods: [
    {
      id: 'click',
      name: 'Click',
      provider: 'click',
      logo: '/images/payment/click.png',
    },
    {
      id: 'payme',
      name: 'Payme',
      provider: 'payme',
      logo: '/images/payment/payme.png',
    },
    {
      id: 'uzum',
      name: 'Uzum Bank',
      provider: 'uzum',
      logo: '/images/payment/uzum.png',
    },
  ],
  availableDiscounts: [],
  loading: false,
  error: null,
};

// Async thunks
export const createPayment = createAsyncThunk<
  Payment,
  {
    courseId: number;
    provider: PaymentProvider;
    discountCode?: string;
  },
  { rejectValue: string }
>('payment/createPayment', async ({ courseId, provider, discountCode }, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/payments/', {
      course_id: courseId,
      provider,
      discount_code: discountCode,
    });
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to create payment');
  }
});

export const confirmPayment = createAsyncThunk<
  Payment,
  {
    paymentId: string;
    transactionId: string;
  },
  { rejectValue: string }
>('payment/confirmPayment', async ({ paymentId, transactionId }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/api/payments/${paymentId}/confirm/`, {
      transaction_id: transactionId,
    });
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to confirm payment');
  }
});

export const fetchDiscounts = createAsyncThunk<
  Discount[],
  number,
  { rejectValue: string }
>('payment/fetchDiscounts', async (courseId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/courses/${courseId}/discounts/`);
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to fetch discounts');
  }
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPayment: (state) => {
      state.currentPayment = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<PaymentState>) => {
    builder
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm payment
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch discounts
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.availableDiscounts = action.payload;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectCurrentPayment = (state: RootState) => state.payment.currentPayment;
export const selectPaymentMethods = (state: RootState) => state.payment.paymentMethods;
export const selectAvailableDiscounts = (state: RootState) => state.payment.availableDiscounts;
export const selectLoading = (state: RootState) => state.payment.loading;
export const selectError = (state: RootState) => state.payment.error;

export const { clearPayment, clearError } = paymentSlice.actions;

export default paymentSlice.reducer; 