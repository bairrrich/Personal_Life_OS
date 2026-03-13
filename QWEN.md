## Qwen Added Memories

- При разработке Personal Life OS нужно придерживаться следующей структуры папок:
- **src/features/** — бизнес-логика (actions, types, utils, categories)
- **src/components/features/** — UI компоненты (диалоги, карточки, виджеты) в плоской структуре без вложенных папок
- **src/app/[locale]/** — страницы (только route-ы)
- **src/app/[locale]/analytics/** — вся аналитика (finance, nutrition, workouts)
