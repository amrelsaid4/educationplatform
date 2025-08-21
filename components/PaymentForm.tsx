'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { loadStripe } from '@stripe/stripe-js'
import { createCheckoutSession } from '@/lib/stripe'
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  courseId: string
  courseTitle: string
  amount: number
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PaymentForm({ courseId, courseTitle, amount, onSuccess, onCancel }: PaymentFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    if (!user?.id) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    setLoading(true)
    setError('')

    try {
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          courseTitle,
          amount,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الدفع')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectPayment = async () => {
    if (!user?.id) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          amount,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      // Here you would integrate with Stripe Elements for direct payment
      // For now, we'll redirect to checkout
      handlePayment()
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الدفع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          إتمام الشراء
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          اختر طريقة الدفع المناسبة لك
        </p>
      </div>

      {/* Course Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {courseTitle}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              وصول كامل للكورس
            </p>
          </div>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            ${amount}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4 mb-6">
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCardIcon className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  بطاقة ائتمان
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  دفع آمن عبر Stripe
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img src="/stripe-logo.png" alt="Stripe" className="h-6" />
              <LockClosedIcon className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        {/* Add more payment methods here */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 opacity-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  PayPal
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  قريباً
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </p>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            جاري التحميل...
          </>
        ) : (
          <>
            <CreditCardIcon className="w-5 h-5" />
            إتمام الدفع - ${amount}
          </>
        )}
      </button>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full mt-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          إلغاء
        </button>
      )}

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <LockClosedIcon className="w-4 h-4" />
          <span>مدفوعات آمنة ومشفرة</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          بياناتك محمية بموجب سياسة الخصوصية الخاصة بنا
        </p>
      </div>
    </div>
  )
}
