import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
import api from '../../api';

export interface TestQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'code' | 'text';
  options?: string[];
  correctAnswer?: string;
  codeTemplate?: string;
  testCases?: {
    input: string;
    expectedOutput: string;
  }[];
}

export interface Test {
  id: number;
  courseId: number;
  title: string;
  description: string;
  questions: TestQuestion[];
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
}

export interface TestResult {
  id: number;
  testId: number;
  userId: number;
  score: number;
  answers: {
    questionId: number;
    answer: string;
    isCorrect: boolean;
    feedback?: string;
  }[];
  completedAt: string;
}

export interface TestState {
  currentTest: Test | null;
  testResults: TestResult[];
  loading: boolean;
  error: string | null;
  submissionStatus: 'idle' | 'submitting' | 'success' | 'error';
  aiFeedback: {
    codeReview?: string;
    suggestions?: string[];
    score?: number;
  } | null;
}

const initialState: TestState = {
  currentTest: null,
  testResults: [],
  loading: false,
  error: null,
  submissionStatus: 'idle',
  aiFeedback: null,
};

// Async thunks
export const fetchTest = createAsyncThunk(
  'test/fetchTest',
  async (testId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/tests/${testId}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch test');
    }
  }
);

export const submitTest = createAsyncThunk(
  'test/submitTest',
  async (
    { testId, answers }: { testId: number; answers: Record<number, string> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/api/tests/${testId}/submit/`, { answers });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to submit test');
    }
  }
);

export const submitCodeExercise = createAsyncThunk(
  'test/submitCodeExercise',
  async (
    { testId, code }: { testId: number; code: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/api/tests/${testId}/submit-code/`, { code });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to submit code');
    }
  }
);

export const fetchTestResults = createAsyncThunk(
  'test/fetchTestResults',
  async (testId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/tests/${testId}/results/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch test results');
    }
  }
);

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    clearTest: (state) => {
      state.currentTest = null;
      state.error = null;
      state.submissionStatus = 'idle';
      state.aiFeedback = null;
    },
    clearError: (state) => {
      state.error = null;
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
        state.submissionStatus = 'submitting';
        state.error = null;
      })
      .addCase(submitTest.fulfilled, (state, action) => {
        state.submissionStatus = 'success';
        state.testResults.push(action.payload);
      })
      .addCase(submitTest.rejected, (state, action) => {
        state.submissionStatus = 'error';
        state.error = action.payload as string;
      })
      // Submit Code Exercise
      .addCase(submitCodeExercise.pending, (state) => {
        state.submissionStatus = 'submitting';
        state.error = null;
      })
      .addCase(submitCodeExercise.fulfilled, (state, action) => {
        state.submissionStatus = 'success';
        state.aiFeedback = action.payload;
      })
      .addCase(submitCodeExercise.rejected, (state, action) => {
        state.submissionStatus = 'error';
        state.error = action.payload as string;
      })
      // Fetch Test Results
      .addCase(fetchTestResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestResults.fulfilled, (state, action) => {
        state.loading = false;
        state.testResults = action.payload;
      })
      .addCase(fetchTestResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectCurrentTest = (state: RootState) => state.test.currentTest;
export const selectTestResults = (state: RootState) => state.test.testResults;
export const selectTestLoading = (state: RootState) => state.test.loading;
export const selectTestError = (state: RootState) => state.test.error;
export const selectSubmissionStatus = (state: RootState) => state.test.submissionStatus;
export const selectAIFeedback = (state: RootState) => state.test.aiFeedback;

export const { clearTest, clearError } = testSlice.actions;

export default testSlice.reducer; 