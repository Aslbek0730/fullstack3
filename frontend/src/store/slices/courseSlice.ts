import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  instructor: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  category: string;
  level: string;
  duration: string;
  rating: number;
  enrolled_students: number;
  is_enrolled: boolean;
  view_count: number;
  objectives: string;
  requirements: string;
  syllabus: Array<{
    title: string;
    description: string;
  }>;
}

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  popularCourses: Course[];
  recommendedCourses: Course[];
  categories: string[];
  levels: string[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  popularCourses: [],
  recommendedCourses: [],
  categories: [],
  levels: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/courses/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch courses');
    }
  }
);

export const fetchCourseDetails = createAsyncThunk(
  'courses/fetchCourseDetails',
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch course details');
    }
  }
);

export const fetchPopularCourses = createAsyncThunk(
  'courses/fetchPopularCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/courses/popular/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch popular courses');
    }
  }
);

export const fetchRecommendedCourses = createAsyncThunk(
  'courses/fetchRecommendedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/courses/recommended/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch recommended courses');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'courses/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/courses/categories/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch categories');
    }
  }
);

export const fetchLevels = createAsyncThunk(
  'courses/fetchLevels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/courses/levels/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch levels');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Course Details
      .addCase(fetchCourseDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Popular Courses
      .addCase(fetchPopularCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.popularCourses = action.payload;
      })
      .addCase(fetchPopularCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Recommended Courses
      .addCase(fetchRecommendedCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendedCourses = action.payload;
      })
      .addCase(fetchRecommendedCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Levels
      .addCase(fetchLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.levels = action.payload;
      })
      .addCase(fetchLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentCourse } = courseSlice.actions;

// Selectors
export const selectCourses = (state: RootState) => state.courses.courses;
export const selectCurrentCourse = (state: RootState) => state.courses.currentCourse;
export const selectPopularCourses = (state: RootState) => state.courses.popularCourses;
export const selectRecommendedCourses = (state: RootState) => state.courses.recommendedCourses;
export const selectCategories = (state: RootState) => state.courses.categories;
export const selectLevels = (state: RootState) => state.courses.levels;
export const selectLoading = (state: RootState) => state.courses.loading;
export const selectError = (state: RootState) => state.courses.error;

export default courseSlice.reducer; 