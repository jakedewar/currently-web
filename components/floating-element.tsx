"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  animationDuration?: string
  delay?: string
  onBoatClick?: () => void
  animationType?: "float" | "sail"
}

export function FloatingElement({
  children,
  className,
  animationDuration = "180s",
  delay = "0s",
  onBoatClick,
  animationType = "sail"
}: FloatingElementProps) {
  const animationClass = animationType === "sail" ? "animate-sail" : "animate-float"
  
  return (
    <div
      className={cn(
        "absolute cursor-pointer hover:scale-110 transition-transform duration-200",
        animationClass,
        className
      )}
      style={{
        animationDuration,
        animationDelay: delay,
      }}
      onClick={onBoatClick}
    >
      {children}
    </div>
  )
}
