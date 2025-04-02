import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

interface Payment {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  course: {
    id: number;
    title: string;
    price: number;
  };
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: 'click' | 'payme' | 'uzum';
  transaction_id: string;
  created_at: string;
  updated_at: string;
  fraud_score: number;
  discount_applied: number;
  bonus_points: number;
}

interface UserDiscount {
  id: number;
  discount_percentage: number;
  valid_until: string;
  is_active: boolean;
  ai_recommended: boolean;
  recommendation_reason: string;
}

interface PaymentState {
  payments: Payment[];
  discounts: UserDiscount[];
  loading: boolean;
  error: string | null;
  currentPayment: Payment | null;
}

const initialState: PaymentState = {
  payments: [],
  discounts: [],
  loading: false,
  error: null,
  currentPayment: null,
};

// Async thunks
export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData: {
    course_id: number;
    provider: string;
    payment_data: any;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/payments/', paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create payment');
    }
  }
);

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/payments/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch payments');
    }
  }
);

export const fetchDiscounts = createAsyncThunk(
  'payments/fetchDiscounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/payments/discounts/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch discounts');
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'payments/confirmPayment',
  async (paymentId: number, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/payments/${paymentId}/confirm/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to confirm payment');
    }
  }
);

export const failPayment = createAsyncThunk(
  'payments/failPayment',
  async ({ paymentId, errorMessage }: { paymentId: number; errorMessage: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/payments/${paymentId}/fail/`, { error_message: errorMessage });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to mark payment as failed');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.payments.push(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Discounts
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm Payment
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentPayment) {
          state.currentPayment.status = 'completed';
        }
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fail Payment
      .addCase(failPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(failPayment.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentPayment) {
          state.currentPayment.status = 'failed';
        }
      })
      .addCase(failPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPayment } = paymentSlice.actions;

// Selectors
export const selectPayments = (state: RootState) => state.payments.payments;
export const selectDiscounts = (state: RootState) => state.payments.discounts;
export const selectCurrentPayment = (state: RootState) => state.payments.currentPayment;
export const selectLoading = (state: RootState) => state.payments.loading;
export const selectError = (state: RootState) => state.payments.error;

export default paymentSlice.reducer; 