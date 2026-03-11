import { AppLayout } from '@/components/layout/app-layout'
import { GlassCard } from '@/components/custom-ui/glass-components'

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Аналитика
          </h1>
          <p className="text-muted-foreground text-lg">
            Статистика и аналитика по всем аспектам жизни
          </p>
        </div>

        <GlassCard className="p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl">🚧</div>
            <h2 className="text-2xl font-semibold">В разработке</h2>
            <p className="text-muted-foreground">
              Эта страница находится в активной разработке и скоро будет доступна
            </p>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  )
}
