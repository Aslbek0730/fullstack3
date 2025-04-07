import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../store'
import {
  createPayment,
  confirmPayment,
  fetchDiscounts,
  selectCurrentPayment,
  selectPaymentMethods,
  selectAvailableDiscounts,
  selectLoading,
  selectError,
  PaymentProvider,
} from '../store/slices/paymentSlice'
import { useNavigate } from 'react-router-dom'

export const usePayment = (courseId: number) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null)
  const [discountCode, setDiscountCode] = useState('')

  const currentPayment = useSelector(selectCurrentPayment)
  const paymentMethods = useSelector(selectPaymentMethods)
  const availableDiscounts = useSelector(selectAvailableDiscounts)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  const handlePayment = useCallback(
    async (provider: PaymentProvider) => {
      if (!provider) return

      try {
        const paymentResult = await dispatch(
          createPayment({
            courseId,
            provider,
            discountCode: discountCode || undefined,
          })
        ).unwrap()

        // Handle different payment providers
        switch (provider) {
          case 'click':
            // Redirect to Click payment page
            window.location.href = paymentResult.payment_url
            break
          case 'payme':
            // Open Payme widget
            window.open(paymentResult.payment_url, 'Payme', 'width=450,height=600')
            break
          case 'uzum':
            // Handle Uzum Bank payment
            const uzumResponse = await dispatch(
              confirmPayment({
                paymentId: paymentResult.id,
                transactionId: paymentResult.transaction_id!,
              })
            ).unwrap()

            if (uzumResponse.status === 'completed') {
              navigate(`/courses/${courseId}`)
            }
            break
        }
      } catch (err) {
        console.error('Payment failed:', err)
      }
    },
    [dispatch, courseId, discountCode, navigate]
  )

  const loadDiscounts = useCallback(() => {
    dispatch(fetchDiscounts(courseId))
  }, [dispatch, courseId])

  return {
    selectedProvider,
    setSelectedProvider,
    discountCode,
    setDiscountCode,
    currentPayment,
    paymentMethods,
    availableDiscounts,
    loading,
    error,
    handlePayment,
    loadDiscounts,
  }
}

export default usePayment 