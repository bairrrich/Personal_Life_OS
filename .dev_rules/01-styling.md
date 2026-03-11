### Файл 2: `01-styling.md` — Стилизация и темизация (OKLCH, Tailwind, токены)

```markdown
# Стилизация и цветовая система (Tailwind v4 + OKLCH)

## 1. Цвета — только OKLCH и CSS‑переменные
- **Никогда** не используйте hex, rgb, hsl напрямую в коде.
- Все цвета определяются через CSS‑переменные в формате `oklch()` в `globals.css` или `theme.css`.

```css
@theme {
  --color-background:     oklch(99% 0.015 240);
  --color-foreground:     oklch(12% 0.04  260);
  --color-primary:        oklch(68% 0.22  260);
  --color-primary-hover:  oklch(60% 0.22  260);
  --color-primary-active: oklch(52% 0.22  260);
  --color-primary-muted:  oklch(76% 0.14  260);
  --color-destructive:    oklch(62% 0.24  25);
  --color-border:         oklch(88% 0.02  240);
  --color-input:          oklch(94% 0.01  240);
  --color-ring:           oklch(68% 0.22  260);
  --color-muted:          oklch(94% 0.008 240);
  --color-muted-foreground: oklch(48% 0.04  260);
  --color-accent:         oklch(96% 0.03  200);
  --color-accent-foreground: oklch(30% 0.06  200);
  --color-popover:        oklch(99% 0.015 240);
  --color-card:           oklch(99.4% 0.012 240);
  --color-secondary:      oklch(90% 0.04  240);
  --color-secondary-foreground: oklch(25% 0.05  260);
}
```

- **Тёмная тема** — второй набор переменных под `[data-theme="dark"]` или использование `dark:` вариантов.

## 2. Семантические имена цветов
Используйте семантические имена (назначение), а не конкретные цвета (blue, red). Минимальный набор:
```
background / foreground
primary / primary-foreground / primary-hover / primary-active / primary-muted
secondary / secondary-foreground
destructive / destructive-foreground
warning / warning-foreground
success / success-foreground
info / info-foreground
muted / muted-foreground
accent / accent-foreground
border / input / ring
popover / popover-foreground
card / card-foreground
```

## 3. Tailwind — использование классов
- Всегда применяйте семантические классы: `bg-background`, `text-foreground`, `border-border`, `ring-ring`.
- Для кастомизации используйте `cn()` из `lib/utils` при комбинировании классов.
- Не пишите цвета в виде `bg-[#0f172a]` — только через переменные.

## 4. Радиусы, тени, шрифты — тоже переменные
```css
@theme {
  --radius: 0.5rem;
  --radius-sm: calc(var(--radius) - 0.25rem);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 0.25rem);

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

## 5. Работа со шрифтами (next/font)
- Всегда используйте `next/font` (Google или локальные) для оптимизации.
- Настраивайте `preload` и `variable` для подстановки в CSS.
```ts
// lib/fonts.ts
import { Inter } from 'next/font/google'
export const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
```
- В корневом layout добавьте `className={inter.variable}` и используйте переменную в Tailwind:
```css
@theme {
  --font-sans: var(--font-sans);
}
```

## 6. Дизайн‑токены (опционально)
Для сложных проектов создайте файл `lib/design-tokens.ts` с константами отступов, радиусов и т.д., чтобы обеспечить единообразие.
```

---

