import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatbotState {
  messages: Message[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ChatbotState = {
  messages: [
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ],
  isOpen: false,
  loading: false,
  error: null,
};

// Async thunks
export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (message: string, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/chatbot/message/', { message });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        // Add user message
        state.messages.push({
          id: Date.now().toString(),
          text: action.meta.arg,
          isUser: true,
          timestamp: new Date().toISOString(),
        });
        // Add AI response
        state.messages.push({
          id: (Date.now() + 1).toString(),
          text: action.payload.response,
          isUser: false,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { toggleChat, clearError } = chatbotSlice.actions;

// Selectors
export const selectMessages = (state: RootState) => state.chatbot.messages;
export const selectIsOpen = (state: RootState) => state.chatbot.isOpen;
export const selectLoading = (state: RootState) => state.chatbot.loading;
export const selectError = (state: RootState) => state.chatbot.error;

export default chatbotSlice.reducer; 