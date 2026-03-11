import { AppLayout } from '@/components/layout/app-layout'
import { GlassCard } from '@/components/custom-ui/glass-components'

export default function ProductsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Продукты
          </h1>
          <p className="text-muted-foreground text-lg">
            Каталог продуктов и управление запасами
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
