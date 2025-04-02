import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  createPayment,
  fetchDiscounts,
  selectDiscounts,
  selectLoading,
  selectError,
} from '../../store/slices/paymentSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

interface PaymentFormProps {
  courseId: number;
  coursePrice: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  courseId,
  coursePrice,
  onSuccess,
  onError,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const discounts = useSelector(selectDiscounts);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [selectedProvider, setSelectedProvider] = useState<'click' | 'payme' | 'uzum'>('click');
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDiscounts());
    }
  }, [dispatch, isAuthenticated]);

  const handlePayment = async () => {
    try {
      const paymentData = {
        course_id: courseId,
        provider: selectedProvider,
        payment_data: {
          // Add provider-specific payment data here
          amount: calculateFinalPrice(),
          currency: 'USD',
        },
      };

      const result = await dispatch(createPayment(paymentData)).unwrap();
      
      // Handle payment provider integration
      switch (selectedProvider) {
        case 'click':
          // Integrate with Click payment gateway
          window.location.href = `/api/payments/click/redirect/${result.payment_id}`;
          break;
        case 'payme':
          // Integrate with Payme payment gateway
          window.location.href = `/api/payments/payme/redirect/${result.payment_id}`;
          break;
        case 'uzum':
          // Integrate with Uzum Bank payment gateway
          window.location.href = `/api/payments/uzum/redirect/${result.payment_id}`;
          break;
      }
    } catch (err: any) {
      onError(err.message || 'Payment failed');
    }
  };

  const calculateFinalPrice = () => {
    if (!selectedDiscount) return coursePrice;
    const discount = discounts.find(d => d.id === selectedDiscount);
    if (!discount) return coursePrice;
    return coursePrice * (1 - discount.discount_percentage / 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Please Log In to Purchase</h3>
        <p className="text-gray-600 mb-4">
          You need to be logged in to purchase this course.
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Purchase Course</h3>
      
      {/* Price Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Original Price:</span>
          <span className="text-lg font-semibold">${coursePrice}</span>
        </div>
        {selectedDiscount && (
          <div className="flex items-center justify-between mt-2 text-green-600">
            <span>Discount Applied:</span>
            <span>
              {discounts.find(d => d.id === selectedDiscount)?.discount_percentage}%
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2 border-t pt-2">
          <span className="text-gray-600">Final Price:</span>
          <span className="text-xl font-bold text-blue-600">
            ${calculateFinalPrice().toFixed(2)}
          </span>
        </div>
      </div>

      {/* Available Discounts */}
      {discounts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Available Discounts</h4>
          <div className="space-y-2">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className={`p-3 border rounded-lg cursor-pointer ${
                  selectedDiscount === discount.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedDiscount(discount.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {discount.discount_percentage}% Off
                  </span>
                  {discount.ai_recommended && (
                    <span className="text-sm text-green-600">AI Recommended</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {discount.recommendation_reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Provider Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Select Payment Method</h4>
        <div className="grid grid-cols-3 gap-4">
          <button
            className={`p-4 border rounded-lg ${
              selectedProvider === 'click'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedProvider('click')}
          >
            <img
              src="/images/click-logo.png"
              alt="Click"
              className="h-8 mx-auto"
            />
          </button>
          <button
            className={`p-4 border rounded-lg ${
              selectedProvider === 'payme'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedProvider('payme')}
          >
            <img
              src="/images/payme-logo.png"
              alt="Payme"
              className="h-8 mx-auto"
            />
          </button>
          <button
            className={`p-4 border rounded-lg ${
              selectedProvider === 'uzum'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedProvider('uzum')}
          >
            <img
              src="/images/uzum-logo.png"
              alt="Uzum Bank"
              className="h-8 mx-auto"
            />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Purchase Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } transition-colors`}
      >
        {loading ? 'Processing...' : 'Purchase Now'}
      </button>
    </div>
  );
};

export default PaymentForm; 