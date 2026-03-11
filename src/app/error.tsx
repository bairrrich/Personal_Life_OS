'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { GlassCard, GlassButton } from '@/components/custom-ui/glass-components'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-gradient-to-br from-red-500 to-red-600 p-4 shadow-lg">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Что-то пошло не так</h1>
        <p className="text-muted-foreground mb-6">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-6 font-mono bg-black/20 rounded-lg p-2">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <GlassButton
            onClick={reset}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Попробовать снова
          </GlassButton>

          <Link href="/">
            <GlassButton variant="outline" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              На главную
            </GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
