'use client'

import { GlassCard } from '@/components/custom-ui/glass-components'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <GlassCard className="max-w-sm w-full p-8 text-center">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse"></div>
        </div>

        {/* Loading text */}
        <h2 className="text-lg font-semibold mb-2">Загрузка</h2>
        <p className="text-sm text-muted-foreground">
          Пожалуйста, подождите...
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </GlassCard>
    </div>
  )
}
