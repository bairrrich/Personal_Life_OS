# Spec-Kit в Personal Life OS

## Что такое Spec-Kit?

**Spec-Kit** — это toolkit для **Spec-Driven Development** (разработки на основе спецификаций). Он позволяет сосредоточиться на продуктовых сценариях и предсказуемых результатах.

**Основная идея:** спецификации становятся исполняемыми и напрямую генерируют рабочие реализации.

## Установка (выполнено)

```bash
# already installed
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

## Структура проекта

```
Personal_Life_OS/
├── .specify/                    # Spec-kit артефакты (игнорируется в git)
│   ├── memory/
│   │   └── constitution.md      # Принципы проекта
│   ├── scripts/
│   │   └── powershell/          # PowerShell скрипты
│   ├── specs/                   # Спецификации фич
│   │   └── 001-<feature-name>/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── tasks.md
│   │       └── contracts/
│   └── templates/               # Шаблоны документов
├── .gitignore
├── mcp.json                     # Конфигурация MCP + Spec-Kit
└── README.md
```

## Slash-команды для работы

### Основные команды

| Команда | Описание | Когда использовать |
|---------|----------|-------------------|
| `/speckit.constitution` | Принципы проекта | При старте новой фичи |
| `/speckit.specify` | Требования и user stories | После определения цели |
| `/speckit.clarify` | Уточняющие вопросы | Перед планированием |
| `/speckit.plan` | Технический план | После утверждения spec |
| `/speckit.tasks` | Список задач | После плана |
| `/speckit.implement` | Реализация задач | Когда задачи готовы |

### Дополнительные команды

| Команда | Описание |
|---------|----------|
| `/speckit.analyze` | Анализ согласованности артефактов |
| `/speckit.checklist` | Чеклисты качества |

## Рабочий процесс

### 1. Начало новой фичи

```
/specify <описание фичи>
```

Пример:
```
/specify Добавить возможность сканирования штрих-кодов продуктов через камеру
```

### 2. Создание спецификации

После `/specify` создаётся директория `.specify/specs/001-<feature-name>/` с документами:
- `spec.md` — требования и user stories
- `plan.md` — технический план
- `tasks.md` — задачи для реализации

### 3. Реализация

Используйте `/speckit.implement` для пошаговой реализации задач.

## Constitution проекта

Файл `.specify/memory/constitution.md` содержит принципы проекта:

1. **Offline-First Architecture** — все данные локально в IndexedDB
2. **Entity-Driven Data Model** — универсальная таблица entities
3. **Event Sourcing for Sync** — события для синхронизации
4. **Spec-Driven Development** — спецификации перед кодом
5. **Test-First Implementation** — тесты перед реализацией
6. **API Integration Layer** — адаптеры для внешних API
7. **Component Architecture** — строгая слоёность компонентов
8. **PWA-First Deployment** — progressive web app

## Интеграция с Qwen Code

Spec-kit настроен для работы с Qwen Code через MCP.

### Конфигурация в mcp.json

```json
{
  "specKit": {
    "enabled": true,
    "aiAgent": "qwen",
    "scriptType": "ps",
    "version": "0.2.0"
  }
}
```

## PowerShell скрипты

В `.specify/scripts/powershell/` находятся вспомогательные скрипты:

- `check-prerequisites.ps1` — проверка окружения
- `create-new-feature.ps1` — создание новой фичи
- `setup-plan.ps1` — настройка плана
- `update-agent-context.ps1` — обновление контекста агента

## Примеры использования

### Пример 1: Добавление новой фичи

1. Запустите `/speckit.specify` с описанием
2. Ответьте на уточняющие вопросы (`/speckit.clarify`)
3. Создайте план (`/speckit.plan`)
4. Сгенерируйте задачи (`/speckit.tasks`)
5. Реализуйте (`/speckit.implement`)

### Пример 2: Анализ существующей фичи

1. Запустите `/speckit.analyze` для проверки согласованности
2. Используйте `/speckit.checklist` для валидации качества

## Полезные ссылки

- [Официальная документация Spec-Kit](https://github.github.com/spec-kit/)
- [Репозиторий Spec-Kit](https://github.com/github/spec-kit)
- [DEV_RULES_PERSONAL.md](./.personal_life_os_rules/DEV_RULES_PERSONAL.md) — полные правила разработки проекта
