import api from '../api'
import type { PaymentProvider } from '../store/slices/paymentSlice'

interface CreatePaymentResponse {
  id: string
  payment_url: string
  transaction_id?: string
}

interface ConfirmPaymentResponse {
  status: 'completed' | 'failed'
  message: string
}

export const paymentApi = {
  createPayment: async (
    courseId: number,
    provider: PaymentProvider,
    discountCode?: string
  ): Promise<CreatePaymentResponse> => {
    const response = await api.post('/api/payments/', {
      course_id: courseId,
      provider,
      discount_code: discountCode,
    })
    return response.data
  },

  confirmPayment: async (
    paymentId: string,
    transactionId: string
  ): Promise<ConfirmPaymentResponse> => {
    const response = await api.post(`/api/payments/${paymentId}/confirm/`, {
      transaction_id: transactionId,
    })
    return response.data
  },

  getPaymentStatus: async (paymentId: string): Promise<ConfirmPaymentResponse> => {
    const response = await api.get(`/api/payments/${paymentId}/status/`)
    return response.data
  },

  getDiscounts: async (courseId: number) => {
    const response = await api.get(`/api/courses/${courseId}/discounts/`)
    return response.data
  },

  validateDiscount: async (courseId: number, code: string) => {
    const response = await api.post(`/api/courses/${courseId}/validate-discount/`, {
      code,
    })
    return response.data
  },
}

export default paymentApi 