import Link from 'next/link'
import { GlassCard, GlassButton } from '@/components/custom-ui/glass-components'
import { Home, Search, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-lg">
            <FileQuestion className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4">Страница не найдена</h2>
        <p className="text-muted-foreground mb-6">
          К сожалению, страница, которую вы ищете, не существует или была перемещена.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link href="/">
            <GlassButton className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              На главную
            </GlassButton>
          </Link>

          <Link href="/dashboard">
            <GlassButton variant="outline" className="flex items-center justify-center gap-2">
              <Search className="h-4 w-4" />
              Поиск
            </GlassButton>
          </Link>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-sm text-muted-foreground">
            Возможные причины:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Неправильный URL</li>
            <li>• Страница была удалена</li>
            <li>• Страница перемещена</li>
          </ul>
        </div>
      </GlassCard>
    </div>
  )
}
