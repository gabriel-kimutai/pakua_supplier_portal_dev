"use client"

// This is a mock implementation of the useToast hook
// In a real application, you would use a proper toast library

import { useState } from "react"

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    // In a real implementation, this would show a toast notification
    console.log(`Toast: ${props.title} - ${props.description}`)

    // For demonstration purposes, we'll just add it to our state
    setToasts((prev) => [...prev, props])

    // And remove it after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== props))
    }, 3000)
  }

  return { toast, toasts }
}
