### Файл 5: `04-advanced.md` — Маршрутизация, ошибки, производительность, i18n, SEO, тестирование, CI/CD, чек-листы

```markdown
# Расширенные темы: маршрутизация, ошибки, производительность, i18n, SEO, тестирование, CI/CD, чек-листы

## 1. Маршрутизация и защита
- Используйте **Route Groups** для разделения публичных и защищённых зон: `(public)`, `(app)`, `(auth)`.
- Проверка аутентификации — **в Server Component** с редиректом:
  ```tsx
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")
  ```
- Middleware используйте только для глобальных задач (редиректы по гео, A/B тесты), **не для проверки auth на каждый запрос** (дорого).

## 2. Обработка ошибок
- Обязательные файлы в `app`:
  - `error.tsx` (клиентский компонент) — ловит ошибки в layout/page.
  - `global-error.tsx` — заменяет корневой layout при ошибке (обязателен для продакшна).
  - `not-found.tsx` — 404.
  - `loading.tsx` — глобальный скелетон.
- В `error.tsx` обязательно предоставляйте кнопку `reset()` для повторной попытки.

## 3. Partial Prerendering (PPR) и Streaming
- **Стремитесь к PPR** (Next.js 15+ stable): статический shell + динамические «дыры».
- Все крупные блоки оборачивайте в `<Suspense>` с загрузкой (`loading.js` или `<Skeleton>`).
- Никогда не оставляйте страницу без loading-состояния — это портит LCP и CLS.

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react"
import { Stats } from "@/components/Stats"
import { StatsSkeleton } from "@/components/StatsSkeleton"

export default function DashboardPage() {
  return (
    <div>
      <h1>Дашборд</h1>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </div>
  )
}
```

## 4. Производительность (Core Web Vitals)
| Метрика | Цель 2026 | Инструменты проверки |
|--------|-----------|----------------------|
| LCP | < 2.5 с | Lighthouse, PageSpeed Insights |
| INP | < 200 мс | Chrome DevTools Performance |
| CLS | < 0.1 | — |
| TBT | < 300 мс | — |

- Используйте `next/image`, `next/font`, динамические импорты.
- Включите `next build --turbo` (Turbopack) для ускорения сборки.
- Следите за размером бандла (анализ с `@next/bundle-analyzer`).

## 5. Интернационализация (next-intl)
- **Структура переводов:**
  ```
  messages/
    en.json
    ru.json
    de.json
  ```
- **Ключи** — иерархические, точечные: `dashboard.title`, `form.email.placeholder`.
- **Все тексты** сразу выносите в переводы, никаких хардкод-строк.
- Используйте `useTranslations()` в клиентских и серверных компонентах (серверные через `getTranslations`).

```tsx
import { useTranslations } from 'next-intl'

export default function Component() {
  const t = useTranslations('form.email')
  return <input placeholder={t('placeholder')} />
}
```

## 6. SEO и метаданные
- Используйте `metadata` API в `layout.tsx` и `page.tsx`.
- Генерируйте `sitemap.ts` и `robots.ts` в папке `app`.
- Для динамических страниц используйте `generateMetadata`.
- Добавляйте Open Graph изображения, Twitter карточки.
- На staging / preview окружениях ставьте `noindex` (через мета‑тег или middleware).

## 7. Тестирование (минимум)
- **Unit**: Vitest + Testing Library (React).
- **E2E**: Playwright (лучше Cypress в 2026).
- Покрывайте critical paths: аутентификация, основные сценарии, формы.

Пример unit-теста:
```tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('renders children', () => {
  render(<Button>Click</Button>)
  expect(screen.getByText('Click')).toBeInTheDocument()
})
```

## 8. CI/CD и автоматизация
- **GitHub Actions**:
  - Линтинг (ESLint, Prettier, TypeScript)
  - Модульные тесты (Vitest)
  - Сборка проекта (`next build`)
  - (Опционально) E2E тесты
- Используйте **Husky** + **lint-staged** для автоматической проверки перед коммитом.
- Conventional Commits обязательны для автоматического версионирования (semantic-release).

## 9. Мониторинг и аналитика
- Подключите Sentry для отслеживания ошибок на клиенте и сервере.
- Аналитика: Google Analytics 4, Yandex Metrika, Vercel Analytics — через компонент Script (`next/script`) с стратегией `afterInteractive` или `lazyOnload`.
- Логирование на сервере: используйте pino / winston, структурированные логи.

## 10. Безопасность
- Настройте **Content Security Policy** (CSP) через middleware или заголовки в `next.config.js`.
- Санитизируйте пользовательский ввод (Zod уже помогает).
- Не храните секреты в коде, используйте переменные окружения.
- Для аутентификации используйте проверенные решения (Auth.js / Lucia / Clerk).
