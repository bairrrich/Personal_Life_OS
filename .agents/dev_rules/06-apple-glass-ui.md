# Glassmorphism в стиле Apple — правила и реализация

Данный документ описывает, как внедрить эффект «стекла» (glassmorphism), характерный для интерфейсов Apple, в проект на Next.js + Tailwind CSS v4 + OKLCH. Правила дополняют основные соглашения по стилизации и компонентам.

## 1. Что такое glassmorphism в стиле Apple

- Полупрозрачный фон с сильным размытием (`backdrop-filter: blur()`).
- Тонкая светлая или тёмная обводка, имитирующая края стекла.
- Лёгкая тень для отделения от фона.
- Цвет фона зависит от темы (светлая/тёмная) и обычно использует очень светлые или очень тёмные оттенки с небольшой насыщенностью.
- Текст и элементы сохраняют высокую контрастность благодаря затемнению/осветлению подложки.

## 2. Цветовая система (OKLCH + CSS-переменные)

Определите новые семантические переменные в вашем `globals.css` (или `theme.css`):

```css
@theme {
  /* Основной цвет фона для стекла (полупрозрачный) */
  --color-glass: oklch(98% 0.01 240 / 0.6); /* светлая тема */
  --color-glass-border: oklch(90% 0.02 240 / 0.3);
  --color-glass-shadow: 0 8px 32px oklch(0% 0 0 / 0.1);

  /* Для тёмной темы */
  --color-glass-dark: oklch(20% 0.02 260 / 0.7);
  --color-glass-border-dark: oklch(40% 0.03 260 / 0.2);
  --color-glass-shadow-dark: 0 8px 32px oklch(0% 0 0 / 0.5);
}
```

**Важно:** используйте `oklch()` с прозрачностью (четвёртый параметр). Это даёт плавный контроль над альфа-каналом и сохраняет возможность динамической смены темы.

Если вы предпочитаете управлять темой через `dark:` варианты, можно определить переменные в корне и переопределить в `[data-theme="dark"]`:

```css
:root {
  --glass-bg: oklch(98% 0.01 240 / 0.6);
  --glass-border: oklch(90% 0.02 240 / 0.3);
  --glass-shadow: 0 8px 32px oklch(0% 0 0 / 0.1);
}

[data-theme="dark"] {
  --glass-bg: oklch(20% 0.02 260 / 0.7);
  --glass-border: oklch(40% 0.03 260 / 0.2);
  --glass-shadow: 0 8px 32px oklch(0% 0 0 / 0.5);
}
```

## 3. Tailwind-классы для glassmorphism

Создайте набор утилитных классов (можно через `@layer components`), чтобы переиспользовать стили:

```css
@layer components {
  .glass {
    background-color: var(--glass-bg, oklch(98% 0.01 240 / 0.6));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border, oklch(90% 0.02 240 / 0.3));
    box-shadow: var(--glass-shadow, 0 8px 32px oklch(0% 0 0 / 0.1));
  }

  .glass-dark {
    background-color: oklch(20% 0.02 260 / 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid oklch(40% 0.03 260 / 0.2);
    box-shadow: 0 8px 32px oklch(0% 0 0 / 0.5);
  }
}
```

**Либо используйте произвольные значения прямо в JSX** (Tailwind v4 поддерживает произвольные свойства):

```tsx
<div className="bg-[oklch(98%_0.01_240_/_0.6)] backdrop-blur-xl border border-[oklch(90%_0.02_240_/_0.3)] shadow-lg">
  Content
</div>
```

Но лучше создать компонент-обёртку, чтобы не дублировать.

## 4. Пример компонента GlassCard

Создайте кастомный компонент в `components/custom-ui/glass-card.tsx`:

```tsx
import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "heavy"; // регулировка прозрачности/размытия
}

export function GlassCard({
  className,
  intensity = "medium",
  children,
  ...props
}: GlassCardProps) {
  const blurMap = {
    light: "backdrop-blur-md",
    medium: "backdrop-blur-xl",
    heavy: "backdrop-blur-2xl",
  };

  const bgOpacityMap = {
    light: "bg-[oklch(98%_0.01_240_/_0.8)] dark:bg-[oklch(20%_0.02_260_/_0.8)]",
    medium:
      "bg-[oklch(98%_0.01_240_/_0.6)] dark:bg-[oklch(20%_0.02_260_/_0.7)]",
    heavy: "bg-[oklch(98%_0.01_240_/_0.4)] dark:bg-[oklch(20%_0.02_260_/_0.6)]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 dark:border-white/10 shadow-xl",
        blurMap[intensity],
        bgOpacityMap[intensity],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

**Примечание:** для границы использован `border-white/20` – это простой способ получить белую полупрозрачную линию, которая будет работать и на светлом, и на тёмном фоне. Можно также завязать на переменные.

## 5. Текст и контрастность

На стекле текст должен оставаться читаемым. Используйте стандартные семантические цвета `text-foreground` или `text-foreground/90`. Если фон стекла очень светлый, тёмный текст будет контрастным; на тёмном стекле — светлый текст. Обычно `foreground` уже настроен правильно.

Для дополнительного контроля можно задать переменные `--glass-foreground` и использовать их.

## 6. Применение в навигации (меню, хедеры)

Apple часто использует glassmorphism в навбарах. Пример для `Header`:

```tsx
<header className="sticky top-0 z-50 glass border-b border-glass-border">
  <nav className="container mx-auto px-4 py-3">{/* содержимое */}</nav>
</header>
```

Не забудьте про `z-index` для правильного перекрытия.

## 7. Производительность и совместимость

- `backdrop-filter` может быть затратным для анимации, но современные браузеры справляются хорошо. Избегайте анимации размытия на больших областях.
- Для старых браузеров можно предложить фолбэк (сплошной фон без размытия). Используйте @supports:

```css
@supports (backdrop-filter: blur(12px)) {
  .glass {
    backdrop-filter: blur(12px);
  }
}
@supports not (backdrop-filter: blur(12px)) {
  .glass {
    background-color: oklch(98% 0.01 240 / 1); /* без прозрачности */
  }
}
```

## 8. Интеграция с shadcn/ui

Для модальных окон, дропдаунов и поповеров можно переопределить их фон через глобальные переменные. Например, изменить `--popover`:

```css
:root {
  --popover: oklch(98% 0.01 240 / 0.6); /* было oklch(98% 0.01 240) */
  --popover-foreground: ...;
}
```

Но это может повлиять на все компоненты. Лучше создать отдельные кастомные варианты.

## 9. Чек-лист при использовании glassmorphism

- [ ] Все цвета фона заданы через OKLCH с прозрачностью.
- [ ] Граница использует `border-white/10` или переменную с альфой.
- [ ] Контраст текста проверен на обоих темах (можно использовать инструмент проверки контрастности).
- [ ] Для областей с размытием установлен `z-index` выше, чем у обычного контента.
- [ ] Предусмотрен фолбэк для браузеров без поддержки `backdrop-filter`.
- [ ] Glass-эффект не применяется к слишком большим блокам, чтобы избежать падения производительности.
- [ ] При изменении темы переменные переключаются корректно (если используется подход с `[data-theme]`).

## 10. Пример готового стекла (светлая и тёмная тема)

```tsx
<GlassCard intensity="medium" className="p-6 max-w-md mx-auto">
  <h2 className="text-2xl font-semibold text-foreground">Заголовок</h2>
  <p className="text-muted-foreground mt-2">
    Этот текст хорошо читается на полупрозрачном фоне благодаря правильному
    контрасту.
  </p>
</GlassCard>
```

Следуя этим правилам, вы сможете создать элегантный интерфейс в стиле Apple, сохраняя при этом согласованность с основной кодовой базой и требованиями доступности.
