import axios from 'axios'
import { Message } from '../store/slices/chatbotSlice'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

export interface ChatbotResponse {
  message: string
  type: 'text' | 'suggestion' | 'error'
  metadata?: {
    solution?: string
    courseId?: string
    confidence?: number
  }
}

export const sendMessageToChatbot = async (message: string): Promise<ChatbotResponse> => {
  try {
    const response = await axios.post(`${API_URL}/chatbot/`, { message })
    return response.data
  } catch (error) {
    console.error('Error sending message to chatbot:', error)
    throw error
  }
}

export const getSuggestions = async (): Promise<Message[]> => {
  try {
    const response = await axios.get(`${API_URL}/chatbot/suggestions/`)
    return response.data
  } catch (error) {
    console.error('Error getting suggestions:', error)
    throw error
  }
}

export const analyzeUserBehavior = async (): Promise<{
  interests: string[]
  performance: {
    courseId: string
    score: number
  }[]
}> => {
  try {
    const response = await axios.get(`${API_URL}/chatbot/analyze/`)
    return response.data
  } catch (error) {
    console.error('Error analyzing user behavior:', error)
    throw error
  }
} 