# Personal Life OS

**Offline-first персональная life-management система**

Personal Life OS — это амбициозный продукт, объединяющий в одном приложении функции:
- 📊 **Учёт финансов** — доходы, расходы, бюджеты, счета
- 🍎 **Трекинг питания** — еда, макронутриенты, приёмы пищи
- 💪 **Управление тренировками** — упражнения, сеты, программы
- 🛒 **Каталог продуктов и добавок**
- 📈 **Аналитика и отчёты** по всем направлениям

## Стек технологий

| Компонент | Технология |
|-----------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Стили | Tailwind CSS 4, OKLCH цветовая система |
| UI | Radix UI, shadcn/ui паттерны |
| Локальная БД | IndexedDB + Dexie.js |
| Формы | React Hook Form + Zod |
| PWA | next-pwa, Service Worker |

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка production
npm run build
```

Приложение доступно по адресу [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
Personal_Life_OS/
├── src/
│   ├── app/              # Next.js App Router страницы
│   ├── components/       # UI компоненты
│   │   ├── ui/           # Базовые компоненты (Button, Card)
│   │   ├── layout/       # Layout компоненты (Sidebar, Nav)
│   │   └── features/     # Компоненты фич
│   ├── db/               # Database слой (Dexie.js)
│   ├── entities/         # Entity Engine и типы
│   ├── features/         # Бизнес-логика фич
│   ├── lib/              # Утилиты и валидаторы
│   └── widgets/          # Виджеты для Dashboard
├── .specify/             # Spec-kit артефакты
│   ├── memory/           # Конституция проекта
│   ├── specs/            # Спецификации фич
│   ├── templates/        # Шаблоны документов
│   └── scripts/          # Скрипты
└── public/               # Статические файлы
```

## Spec-Driven Development

Этот проект использует **Spec-Kit** — toolkit для Spec-Driven Development.

### Slash-команды

| Команда | Описание |
|---------|----------|
| `/speckit.constitution` | Принципы проекта |
| `/speckit.specify` | Требования и user stories |
| `/speckit.clarify` | Уточняющие вопросы |
| `/speckit.plan` | Технический план |
| `/speckit.tasks` | Список задач |
| `/speckit.implement` | Реализация задач |
| `/speckit.analyze` | Анализ согласованности |
| `/speckit.checklist` | Чеклисты качества |

### Начало новой фичи

1. Используйте `/speckit.specify <описание фичи>` для создания спецификации
2. Пройдите через `/speckit.plan` и `/speckit.tasks`
3. Реализуйте через `/speckit.implement`

См. [`SPEC_KIT_GUIDE.md`](./SPEC_KIT_GUIDE.md) для подробной документации.

## Архитектура

### Entity-Driven Data Model

Вместо множества таблиц используется универсальная `entities` таблица:

```typescript
interface BaseEntity {
  id: string
  type: string        // 'transaction', 'food', 'workout', ...
  name: string
  data: Record<string, any>  // специфичные поля
  createdAt: number
  updatedAt: number
}
```

### Event Sourcing

Все изменения порождают события для синхронизации:

```typescript
interface SyncEvent {
  entityId: string
  eventType: 'create' | 'update' | 'delete'
  payload: any
  timestamp: number
  synced: boolean
}
```

### Offline-First

- Все данные хранятся локально в IndexedDB
- UI работает с локальной базой (мгновенный отклик)
- Фоновая синхронизация при наличии соединения

## Roadmap

- [ ] **Finance Module** — транзакции, счета, категории
- [ ] **Nutrition Module** — еда, приёмы пищи, макронутриенты
- [ ] **Workouts Module** — тренировки, упражнения, сеты
- [ ] **Sync Engine** — синхронизация с сервером
- [ ] **PWA** — service worker, offline режим
- [ ] **Analytics** — отчёты и графики

## Документация

- [DEV_RULES_PERSONAL.md](./.personal_life_os_rules/DEV_RULES_PERSONAL.md) — полное руководство по разработке
- [SPEC_KIT_GUIDE.md](./SPEC_KIT_GUIDE.md) — руководство по Spec-Kit
- [.dev_rules/](./.dev_rules/) — правила разработки (core, styling, components)

## Лицензия

MIT
