import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import api from '../../api';

export interface Reward {
  id: number;
  type: 'bonus' | 'certificate' | 'badge' | 'discount';
  title: string;
  description: string;
  value: number;
  awardedAt: string;
  expiresAt?: string;
}

export interface Recommendation {
  id: number;
  type: 'course' | 'exercise' | 'practice';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reason: string;
  score: number;
}

export interface RewardState {
  rewards: Reward[];
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
}

const initialState: RewardState = {
  rewards: [],
  recommendations: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchRewards = createAsyncThunk(
  'reward/fetchRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/rewards/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch rewards');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'reward/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/recommendations/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch recommendations');
    }
  }
);

export const claimReward = createAsyncThunk(
  'reward/claimReward',
  async (rewardId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/rewards/${rewardId}/claim/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to claim reward');
    }
  }
);

const rewardSlice = createSlice({
  name: 'reward',
  initialState,
  reducers: {
    clearRewards: (state) => {
      state.rewards = [];
      state.recommendations = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rewards
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Claim Reward
      .addCase(claimReward.fulfilled, (state, action) => {
        const index = state.rewards.findIndex((reward) => reward.id === action.payload.id);
        if (index !== -1) {
          state.rewards[index] = action.payload;
        }
      });
  },
});

// Selectors
export const selectRewards = (state: RootState) => state.reward.rewards;
export const selectRecommendations = (state: RootState) => state.reward.recommendations;
export const selectRewardLoading = (state: RootState) => state.reward.loading;
export const selectRewardError = (state: RootState) => state.reward.error;

export const { clearRewards, clearError } = rewardSlice.actions;

export default rewardSlice.reducer; 