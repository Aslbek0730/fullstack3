import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  question_type: string;
  question_text: string;
  points: number;
  choices: Choice[];
}

interface Test {
  id: number;
  title: string;
  description: string;
  test_type: string;
  max_score: number;
  passing_score: number;
  time_limit: number | null;
  due_date: string | null;
  questions: Question[];
}

interface QuestionSubmission {
  id: number;
  question: {
    id: number;
    question_text: string;
    points: number;
  };
  answer_text: string;
  selected_choices: Choice[];
  score: number | null;
  ai_feedback: string | null;
  ai_score: number | null;
}

interface TestSubmission {
  id: number;
  test: {
    id: number;
    max_score: number;
  };
  score: number | null;
  status: string;
  submitted_at: string;
  graded_at: string | null;
  ai_feedback: string | null;
  ai_score: number | null;
  question_submissions: QuestionSubmission[];
}

interface UserReward {
  id: number;
  reward_type: string;
  reward_value: string;
  awarded_at: string;
}

interface TestState {
  currentTest: Test | null;
  currentSubmission: TestSubmission | null;
  userRewards: UserReward[];
  loading: boolean;
  error: string | null;
}

const initialState: TestState = {
  currentTest: null,
  currentSubmission: null,
  userRewards: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchTest = createAsyncThunk(
  'test/fetchTest',
  async (testId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/tests/${testId}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch test');
    }
  }
);

export const submitTest = createAsyncThunk(
  'test/submitTest',
  async ({ testId, submissions }: { testId: number; submissions: any[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/tests/${testId}/submit/`, {
        test_id: testId,
        question_submissions: submissions,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to submit test');
    }
  }
);

export const fetchTestResults = createAsyncThunk(
  'test/fetchTestResults',
  async (testId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/tests/${testId}/results/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch test results');
    }
  }
);

export const fetchUserRewards = createAsyncThunk(
  'test/fetchUserRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/rewards/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch rewards');
    }
  }
);

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetTest: (state) => {
      state.currentTest = null;
      state.currentSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Test
      .addCase(fetchTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTest = action.payload;
      })
      .addCase(fetchTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit Test
      .addCase(submitTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubmission = action.payload.submission;
        state.userRewards = action.payload.rewards;
      })
      .addCase(submitTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Test Results
      .addCase(fetchTestResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestResults.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubmission = action.payload;
      })
      .addCase(fetchTestResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch User Rewards
      .addCase(fetchUserRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.userRewards = action.payload;
      })
      .addCase(fetchUserRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetTest } = testSlice.actions;

// Selectors
export const selectCurrentTest = (state: RootState) => state.test.currentTest;
export const selectCurrentSubmission = (state: RootState) => state.test.currentSubmission;
export const selectUserRewards = (state: RootState) => state.test.userRewards;
export const selectLoading = (state: RootState) => state.test.loading;
export const selectError = (state: RootState) => state.test.error;

export default testSlice.reducer; 