import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
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

interface PaymentMethod {
  id: string
  name: string
  provider: PaymentProvider
  logo: string
}

interface Discount {
  id: string
  code: string
  percentage: number
  validUntil: string
}

interface PaymentModalProps {
  courseId: number
  courseTitle: string
  price: number
  onClose: () => void
  onSuccess: () => void
}

const PaymentModal: FC<PaymentModalProps> = ({
  courseId,
  courseTitle,
  price,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const currentPayment = useSelector(selectCurrentPayment)
  const paymentMethods = useSelector(selectPaymentMethods)
  const availableDiscounts = useSelector(selectAvailableDiscounts)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null)
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0)

  useEffect(() => {
    dispatch(fetchDiscounts(courseId))
  }, [dispatch, courseId])

  const handlePaymentMethodSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider)
  }

  const handleDiscountApply = () => {
    const discount = availableDiscounts.find((d: Discount) => d.code === discountCode)
    if (discount) {
      setAppliedDiscount(discount.percentage)
    }
  }

  const finalPrice = price * (1 - appliedDiscount / 100)

  const handlePaymentSubmit = async () => {
    if (!selectedProvider) return

    try {
      const paymentResult = await dispatch(
        createPayment({
          courseId,
          provider: selectedProvider,
          discountCode: discountCode || undefined,
        })
      ).unwrap()

      // Handle different payment providers
      switch (selectedProvider) {
        case 'click':
          // Redirect to Click payment page
          window.location.href = paymentResult.paymentUrl || ''
          break
        case 'payme':
          // Open Payme widget
          window.open(paymentResult.paymentUrl || '', 'Payme', 'width=450,height=600')
          break
        case 'uzum':
          // Handle Uzum Bank payment
          const uzumResponse = await dispatch(
            confirmPayment({
              paymentId: paymentResult.id,
              transactionId: paymentResult.transactionId,
            })
          ).unwrap()
          
          if (uzumResponse.status === 'completed') {
            onSuccess()
          }
          break
      }
    } catch (err) {
      console.error('Payment failed:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-gray-900 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Purchase Course</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-semibold text-white">{courseTitle}</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Original Price:</span>
            <span className="text-white">${price}</span>
          </div>
          {appliedDiscount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Discount:</span>
              <span className="text-green-400">-{appliedDiscount}%</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-gray-700 pt-2">
            <span className="font-semibold text-white">Final Price:</span>
            <span className="text-xl font-bold text-indigo-400">
              ${finalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {availableDiscounts.length > 0 && (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Discount Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 rounded-md border-0 bg-gray-800 px-3 py-1.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-600"
                placeholder="Enter discount code"
              />
              <button
                onClick={handleDiscountApply}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-400">
            Select Payment Method
          </label>
          <div className="grid grid-cols-3 gap-4">
            {paymentMethods.map((method: PaymentMethod) => (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.provider)}
                className={`flex flex-col items-center rounded-lg border p-4 transition-colors ${
                  selectedProvider === method.provider
                    ? 'border-indigo-500 bg-indigo-500 bg-opacity-10'
                    : 'border-gray-700 hover:border-indigo-500'
                }`}
              >
                <img src={method.logo} alt={method.name} className="mb-2 h-8 w-8" />
                <span className="text-sm text-white">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-500 bg-opacity-10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handlePaymentSubmit}
          disabled={!selectedProvider || loading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          ) : (
            'Proceed to Payment'
          )}
        </button>
      </div>
    </div>
  )
}

export default PaymentModal 