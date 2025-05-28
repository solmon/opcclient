import React from 'react'
import { Button } from '@/components/ui/button'

interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function SimpleModal({
  isOpen,
  onClose,
  title,
  children,
  footer
}: SimpleModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">{title}</h2>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full"
          >
            <span className="sr-only">Close</span>
            <span aria-hidden="true">&times;</span>
          </Button>
        </div>
        
        <div className="mb-4">
          {children}
        </div>
        
        {footer && (
          <div className="flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
