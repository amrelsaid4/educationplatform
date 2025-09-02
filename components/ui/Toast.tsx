'use client'

import { Toaster, toast } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

// Toast configuration
const toastConfig = {
  duration: 4000,
  position: 'top-center' as const,
  style: {
    background: '#fff',
    color: '#333',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxWidth: '400px',
    direction: 'rtl',
  },
}

// Icon components for different toast types
const ToastIcon = ({ type }: { type: ToastType }) => {
  const iconClasses = 'h-5 w-5'
  
  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClasses} text-green-500`} />
    case 'error':
      return <XCircle className={`${iconClasses} text-red-500`} />
    case 'warning':
      return <AlertTriangle className={`${iconClasses} text-yellow-500`} />
    case 'info':
      return <Info className={`${iconClasses} text-blue-500`} />
    default:
      return null
  }
}

// Custom toast component
const CustomToast = ({ 
  type, 
  message, 
  t 
}: { 
  type: ToastType
  message: string
  t: any 
}) => {
  return (
    <div className="flex items-start space-x-3 space-x-reverse">
      <ToastIcon type={type} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast functions
export const showToast = {
  success: (message: string, options?: any) => {
    return toast.custom(
      (t) => <CustomToast type="success" message={message} t={t} />,
      { ...toastConfig, ...options }
    )
  },
  
  error: (message: string, options?: any) => {
    return toast.custom(
      (t) => <CustomToast type="error" message={message} t={t} />,
      { ...toastConfig, ...options }
    )
  },
  
  warning: (message: string, options?: any) => {
    return toast.custom(
      (t) => <CustomToast type="warning" message={message} t={t} />,
      { ...toastConfig, ...options }
    )
  },
  
  info: (message: string, options?: any) => {
    return toast.custom(
      (t) => <CustomToast type="info" message={message} t={t} />,
      { ...toastConfig, ...options }
    )
  },
  
  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      ...toastConfig,
      duration: Infinity,
      ...options,
    })
  },
  
  dismiss: (toastId: string) => {
    toast.dismiss(toastId)
  },
  
  dismissAll: () => {
    toast.dismiss()
  },
}

// Toast provider component
export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '400px',
          direction: 'rtl',
        },
      }}
    />
  )
}

// Hook for using toasts
export const useToast = () => {
  return {
    success: showToast.success,
    error: showToast.error,
    warning: showToast.warning,
    info: showToast.info,
    loading: showToast.loading,
    dismiss: showToast.dismiss,
    dismissAll: showToast.dismissAll,
  }
}

// Toast with promise
export const toastPromise = <T>(
  promise: Promise<T>,
  {
    loading = 'جاري التحميل...',
    success = 'تم بنجاح!',
    error = 'حدث خطأ!',
  }: {
    loading?: string
    success?: string
    error?: string
  } = {}
) => {
  const toastId = showToast.loading(loading)
  
  return promise
    .then((result) => {
      showToast.dismiss(toastId)
      showToast.success(success)
      return result
    })
    .catch((error) => {
      showToast.dismiss(toastId)
      showToast.error(error)
      throw error
    })
}

// Toast with custom actions
export const showToastWithActions = (
  message: string,
  actions: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>,
  type: ToastType = 'info'
) => {
  const ToastWithActions = ({ t }: { t: unknown }) => (
    <div className="flex items-start space-x-3 space-x-reverse">
      <ToastIcon type={type} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 mb-2">{message}</p>
        <div className="flex space-x-2 space-x-reverse">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick()
                toast.dismiss(t.id)
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                action.variant === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
  
  return toast.custom(
    (t) => <ToastWithActions t={t} />,
    { ...toastConfig, duration: 6000 }
  )
}

// Export default toast functions for backward compatibility
export default showToast
