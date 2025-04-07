import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendMessageToChatbot, getSuggestions as getApiSuggestions, analyzeUserBehavior } from '../../api/chatbot';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  type: 'text' | 'suggestion' | 'error';
  metadata?: {
    solution?: string;
    courseId?: string;
    confidence?: number;
  };
}

interface ChatbotState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  context: {
    interests: string[];
    performance: {
      courseId: string;
      score: number;
    }[];
  };
}

const initialState: ChatbotState = {
  messages: [],
  isOpen: false,
  isLoading: false,
  error: null,
  context: {
    interests: [],
    performance: [],
  },
};

export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (message: string, { rejectWithValue }) => {
    try {
      const response = await sendMessageToChatbot(message);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to send message');
    }
  }
);

export const getSuggestions = createAsyncThunk(
  'chatbot/getSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getApiSuggestions();
      return response;
    } catch (error) {
      return rejectWithValue('Failed to get suggestions');
    }
  }
);

export const updateContext = createAsyncThunk(
  'chatbot/updateContext',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyzeUserBehavior();
      return response;
    } catch (error) {
      return rejectWithValue('Failed to update context');
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
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          id: Date.now().toString(),
          content: action.payload.message,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          type: action.payload.type,
          metadata: action.payload.metadata,
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getSuggestions.fulfilled, (state, action) => {
        state.messages = [...state.messages, ...action.payload];
      })
      .addCase(updateContext.fulfilled, (state, action) => {
        state.context = action.payload;
      });
  },
});

export const { toggleChat, addMessage, clearMessages } = chatbotSlice.actions;

export const selectMessages = (state: { chatbot: ChatbotState }) => state.chatbot.messages;
export const selectIsOpen = (state: { chatbot: ChatbotState }) => state.chatbot.isOpen;
export const selectIsLoading = (state: { chatbot: ChatbotState }) => state.chatbot.isLoading;
export const selectError = (state: { chatbot: ChatbotState }) => state.chatbot.error;
export const selectContext = (state: { chatbot: ChatbotState }) => state.chatbot.context;

export default chatbotSlice.reducer; 