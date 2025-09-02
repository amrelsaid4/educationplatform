'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  gray: 'text-gray-400',
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && (
        <span className={`mr-3 text-sm ${colorClasses[color]}`}>
          {text}
        </span>
      )}
    </div>
  )
}

// Full page loading spinner
export const FullPageSpinner: React.FC<{ text?: string }> = ({ text = 'جاري التحميل...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  )
}

// Inline loading spinner
export const InlineSpinner: React.FC<{ text?: string }> = ({ text }) => {
  return <LoadingSpinner size="sm" text={text} />
}

// Button loading spinner
export const ButtonSpinner: React.FC<{ text?: string }> = ({ text = 'جاري التحميل...' }) => {
  return (
    <div className="flex items-center">
      <LoadingSpinner size="sm" color="white" />
      <span className="mr-2 text-sm">{text}</span>
    </div>
  )
}

// Skeleton loading components
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <SkeletonText lines={3} />
      <div className="flex space-x-2 space-x-reverse">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b">
        <div className="flex space-x-4 space-x-reverse">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4 space-x-reverse">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Loading overlay
export const LoadingOverlay: React.FC<{ 
  isLoading: boolean
  text?: string
  children: React.ReactNode 
}> = ({ isLoading, text = 'جاري التحميل...', children }) => {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center">
          <LoadingSpinner size="lg" text={text} />
        </div>
      </div>
    </div>
  )
}

// Loading button
export const LoadingButton: React.FC<{
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}> = ({
  isLoading,
  loadingText = 'جاري التحميل...',
  children,
  className = '',
  disabled = false,
  onClick,
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading ? (
        <ButtonSpinner text={loadingText} />
      ) : (
        children
      )}
    </button>
  )
}







