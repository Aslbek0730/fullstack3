import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { RootState } from '../store';
import api from '../../api';

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  instructor: {
    id: number;
    name: string;
    avatar: string;
  };
  rating: number;
  totalStudents: number;
  isPurchased: boolean;
  createdAt: string;
}

interface CourseState {
  courses: Course[];
  popularCourses: Course[];
  recommendedCourses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
  sortBy: 'popularity' | 'rating' | 'newest' | 'price';
  userInterests: string[];
  purchasedCourses: Course[];
}

const initialState: CourseState = {
  courses: [],
  popularCourses: [],
  recommendedCourses: [],
  currentCourse: null,
  loading: false,
  error: null,
  sortBy: 'popularity',
  userInterests: [],
  purchasedCourses: [],
};

// Async thunks
export const fetchCourses = createAsyncThunk<
  Course[],
  void,
  { rejectValue: string }
>('courses/fetchCourses', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/courses/');
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to fetch courses');
  }
});

export const fetchCourseDetails = createAsyncThunk(
  'courses/fetchCourseDetails',
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/courses/${courseId}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch course details');
    }
  }
);

export const fetchPopularCourses = createAsyncThunk<
  Course[],
  void,
  { rejectValue: string }
>('courses/fetchPopularCourses', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/courses/popular/');
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to fetch popular courses');
  }
});

export const fetchRecommendedCourses = createAsyncThunk<
  Course[],
  void,
  { rejectValue: string }
>('courses/fetchRecommendedCourses', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/courses/recommended/');
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to fetch recommended courses');
  }
});

export const fetchCourseById = createAsyncThunk<
  Course,
  number,
  { rejectValue: string }
>('courses/fetchCourseById', async (courseId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/courses/${courseId}/`);
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to fetch course details');
  }
});

export const fetchPurchasedCourses = createAsyncThunk<
  Course[],
  void,
  { rejectValue: string }
>('courses/fetchPurchasedCourses', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/courses/purchased/');
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to fetch purchased courses');
  }
});

export const recordCourseView = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('courses/recordCourseView', async (courseId, { rejectWithValue }) => {
  try {
    await api.post(`/api/courses/${courseId}/view/`);
    return courseId;
  } catch (error) {
    return rejectWithValue('Failed to record course view');
  }
});

export const updateUserInterests = createAsyncThunk<
  { interests: string[] },
  string[],
  { rejectValue: string }
>('courses/updateUserInterests', async (interests, { rejectWithValue }) => {
  try {
    const response = await api.put('/api/users/interests/', { interests });
    return response.data;
  } catch (error) {
    return rejectWithValue('Failed to update user interests');
  }
});

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
    setSortBy: (state, action: PayloadAction<CourseState['sortBy']>) => {
      state.sortBy = action.payload;
      // Sort courses based on the selected criteria
      state.courses = [...state.courses].sort((a, b) => {
        switch (state.sortBy) {
          case 'popularity':
            return b.totalStudents - a.totalStudents;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'price':
            return a.price - b.price;
          default:
            return 0;
        }
      });
    },
    setUserInterests: (state, action) => {
      state.userInterests = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<CourseState>) => {
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
      // Fetch Course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Purchased Courses
      .addCase(fetchPurchasedCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchasedCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.purchasedCourses = action.payload;
      })
      .addCase(fetchPurchasedCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Record Course View
      .addCase(recordCourseView.fulfilled, (state, action) => {
        const course = state.courses.find((c) => c.id === action.payload);
        if (course) {
          course.totalStudents += 1;
        }
      })
      // Update User Interests
      .addCase(updateUserInterests.fulfilled, (state, action) => {
        state.userInterests = action.payload.interests;
      });
  },
});

export const { clearError, setCurrentCourse, setSortBy, setUserInterests } = courseSlice.actions;

// Selectors
export const selectAllCourses = (state: RootState) => state.courses.courses;
export const selectCurrentCourse = (state: RootState) => state.courses.currentCourse;
export const selectPopularCourses = (state: RootState) => state.courses.popularCourses;
export const selectRecommendedCourses = (state: RootState) => state.courses.recommendedCourses;
export const selectPurchasedCourses = (state: RootState) => state.courses.purchasedCourses;
export const selectLoading = (state: RootState) => state.courses.loading;
export const selectError = (state: RootState) => state.courses.error;
export const selectSortBy = (state: RootState) => state.courses.sortBy;
export const selectUserInterests = (state: RootState) => state.courses.userInterests;

export default courseSlice.reducer; 