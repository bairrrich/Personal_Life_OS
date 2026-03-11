### Файл 1: `00-core.md` — Основы проекта (Server/Client, структура, TypeScript, именование, Git)

```markdown
# Core Principles — Next.js 15+ (App Router) проект

## 1. Server vs Client Components — золотое правило

- **По умолчанию всё — Server Component**.
- Добавляйте `"use client"` **только** когда компоненту действительно нужна клиентская интерактивность:
  - `useState`, `useEffect`, `useRef`
  - обработчики событий (`onClick`, `onSubmit`), если это не Server Action
  - браузерные API (`window`, `localStorage`, `document`)
  - сторонние библиотеки, не поддерживающие Server Components
- **Никогда** не ставьте `"use client"` «на всякий случай».

## 2. Структура папок (рекомендуемая)
```

src/
├── app/ # App Router
│ ├── (auth)/ # группа для публичных маршрутов
│ ├── (app)/ # защищённая часть
│ ├── api/ # Route Handlers
│ ├── layout.tsx
│ ├── page.tsx
│ ├── globals.css
│ ├── error.tsx
│ ├── not-found.tsx
│ └── loading.tsx
├── components/
│ ├── ui/ # shadcn/ui (не редактировать вручную)
│ ├── common/ # переиспользуемые UI (ButtonLink, Spinner)
│ ├── features/ # крупные фичи (UserMenu, DataTable)
│ ├── layout/ # Header, Sidebar, Footer
│ └── providers/ # ThemeProvider, AuthProvider
├── lib/ # утилиты, не связанные с UI
│ ├── utils.ts # cn, formatDate, getInitials
│ ├── constants.ts
│ ├── api.ts # типизированный fetch / axios
│ └── auth.ts
├── hooks/ # кастомные хуки
├── actions/ # Server Actions
├── types/ # глобальные типы
├── messages/ # переводы next-intl
└── styles/ # доп. стили (если нужно)

```

## 3. TypeScript — строгие правила
- `tsconfig.json`: `"strict": true`, `"noImplicitAny": true`
- Используйте **`type`** для большинства случаев (кроме случаев, когда нужен `extends` / `implements`).
- Все props компонентов обязаны быть типизированы.
- **Никакого `any`** (разрешён только с комментарием `// @ts-expect-error` в крайнем случае).

## 4. Именование (переменные, файлы, компоненты)

| Сущность               | Стиль                | Пример                          |
|------------------------|----------------------|---------------------------------|
| Переменные, функции, параметры | `camelCase` | `userName`, `fetchData()`       |
| Компоненты React       | `PascalCase`         | `UserProfile`, `Sidebar`        |
| Типы / интерфейсы TS   | `PascalCase`         | `UserProps`, `ApiResponse`      |
| Константы (примитивы, перечисления) | `UPPER_SNAKE_CASE` | `MAX_ITEMS`, `API_BASE_URL` |
| CSS классы (модули)    | `kebab-case`         | `user-card`, `sidebar__button`  |
| Файлы компонентов      | `PascalCase`         | `UserProfile.tsx`                |
| Утилиты / хуки         | `camelCase`          | `useAuth`, `formatDate`          |
| Спецфайлы Next.js      | точно по имени       | `page.tsx`, `layout.tsx`, `loading.tsx` |

- Имена должны быть самодокументируемыми, избегайте сокращений (кроме общепринятых: `id`, `url`, `ref`).
- Для пропсов React используйте интерфейс с суффиксом `Props`: `interface UserCardProps`.

## 5. Git и коммиты (Conventional Commits)
```

feat: add user profile page
fix(auth): handle token refresh error
refactor: extract design tokens layer
chore(deps): update shadcn/ui components
style: apply consistent spacing tokens
i18n: add missing ru translations for billing
test: add unit tests for useDebounce
docs: update README with setup instructions

```

## 6. Переменные окружения
- **Публичные** (доступны в браузере): префикс `NEXT_PUBLIC_` (например, `NEXT_PUBLIC_API_URL`).
- **Приватные** (только на сервере): без префикса (например, `DB_PASSWORD`).
- Никогда не передавайте секреты в клиентский код.
- Используйте `.env.local` для локальной разработки, `.env` – только пример с заглушками (не коммитить реальные секреты).
```

---
