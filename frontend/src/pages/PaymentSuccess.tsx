import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../store'
import { confirmPayment } from '../store/slices/paymentSlice'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        const paymentId = searchParams.get('payment_id')
        const transactionId = searchParams.get('transaction_id')

        if (!paymentId || !transactionId) {
          setStatus('error')
          setMessage('Invalid payment callback parameters')
          return
        }

        const result = await dispatch(
          confirmPayment({
            paymentId,
            transactionId,
          })
        ).unwrap()

        if (result.status === 'completed') {
          setStatus('success')
          setMessage('Payment completed successfully')
          // Redirect to the course page after 3 seconds
          setTimeout(() => {
            const courseId = searchParams.get('course_id')
            navigate(courseId ? `/courses/${courseId}` : '/courses')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(result.message || 'Payment failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Failed to confirm payment')
      }
    }

    handlePaymentCallback()
  }, [dispatch, navigate, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <h2 className="text-2xl font-bold text-white">Processing Payment</h2>
              <p className="mt-2 text-gray-400">Please wait while we confirm your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Payment Successful</h2>
              <p className="mt-2 text-gray-400">{message}</p>
              <p className="mt-4 text-sm text-gray-500">
                You will be redirected to your course in a few seconds...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
              <p className="mt-2 text-gray-400">{message}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess 