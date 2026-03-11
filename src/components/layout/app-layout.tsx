'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Wallet,
  Utensils,
  Dumbbell,
  Package,
  BarChart3,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Финансы', href: '/finance', icon: Wallet },
  { name: 'Питание', href: '/nutrition', icon: Utensils },
  { name: 'Тренировки', href: '/workouts', icon: Dumbbell },
  { name: 'Продукты', href: '/products', icon: Package },
  { name: 'Аналитика', href: '/analytics', icon: BarChart3 },
]

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Desktop Sidebar - Glass Effect */}
      <aside className="hidden md:flex md:w-64 md:flex-col glass border-r fixed inset-y-0 left-0 z-40">
        <div className="flex h-14 items-center border-b border-white/10 px-6 glass-light">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Personal Life OS
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[oklch(68%_0.22_260_/_0.9)] text-white shadow-md'
                    : 'text-muted-foreground hover:bg-[oklch(96%_0.03_200_/_0.5)] hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 glass border-b md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/" className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Personal Life OS
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-[oklch(96%_0.03_200_/_0.5)] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <nav className="glass border-t border-white/10 px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-[oklch(68%_0.22_260_/_0.9)] text-white'
                        : 'text-muted-foreground hover:bg-[oklch(96%_0.03_200_/_0.5)]'
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          )}
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t md:hidden safe-area-pb">
          <div className="grid grid-cols-6 gap-1 p-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-xs font-medium transition-all',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  <span className="truncate w-full text-center">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
