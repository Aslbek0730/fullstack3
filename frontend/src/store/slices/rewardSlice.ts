import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

interface Reward {
  id: number;
  reward_type: string;
  reward_value: string;
  awarded_at: string;
}

interface Recommendation {
  id: number;
  course_id: number;
  course_title: string;
  difficulty_level: string;
  reason: string;
  confidence_score: number;
}

interface RewardState {
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
export const fetchUserRewards = createAsyncThunk(
  'rewards/fetchUserRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/rewards/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch rewards');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'rewards/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/rewards/recommendations/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch recommendations');
    }
  }
);

const rewardSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addReward: (state, action) => {
      state.rewards.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Rewards
      .addCase(fetchUserRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchUserRewards.rejected, (state, action) => {
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
      });
  },
});

export const { clearError, addReward } = rewardSlice.actions;

// Selectors
export const selectRewards = (state: RootState) => state.rewards.rewards;
export const selectRecommendations = (state: RootState) => state.rewards.recommendations;
export const selectLoading = (state: RootState) => state.rewards.loading;
export const selectError = (state: RootState) => state.rewards.error;

export default rewardSlice.reducer; 