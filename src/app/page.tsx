import Link from 'next/link'

const sections = [
  {
    title: 'Foods',
    description: 'Track your nutrition and meals',
    href: '/foods',
    icon: '🍎',
  },
  {
    title: 'Transactions',
    description: 'Manage your finances and expenses',
    href: '/transactions',
    icon: '💰',
  },
  {
    title: 'Workouts',
    description: 'Log your exercises and fitness progress',
    href: '/workouts',
    icon: '💪',
  },
  {
    title: 'Entities',
    description: 'Browse all entities in the system',
    href: '/entities',
    icon: '📊',
  },
  {
    title: 'Events',
    description: 'View event history and audit log',
    href: '/events',
    icon: '📜',
  },
  {
    title: 'Tags',
    description: 'Organize and categorize your data',
    href: '/tags',
    icon: '🏷️',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Personal Life OS</h1>
          <p className="mt-2 text-muted-foreground">
            Your personal operating system for life management
          </p>
        </header>

        <nav className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
            >
              <span className="text-2xl" aria-hidden="true">
                {section.icon}
              </span>
              <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                {section.title}
              </h2>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </Link>
          ))}
        </nav>

        <footer className="mt-12 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Built with Next.js 15, React 19, and Dexie.js
          </p>
        </footer>
      </div>
    </main>
  )
}
