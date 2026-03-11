### Файл 4: `03-data-fetching-forms.md` — Получение данных, Server Actions, формы

````markdown
# Данные, Server Actions и формы

## 1. Получение данных — Server Components

- В page/layout используйте `async/await` напрямую — данные кэшируются по умолчанию.
- **Не делайте fetch в клиентских компонентах**, если данные можно получить на сервере.
- Для клиентских данных (реального времени) используйте SWR / TanStack Query, но только там, где это действительно нужно.

```tsx
// app/users/page.tsx
export default async function UsersPage() {
  const users = await getUsers(); // fetch с кэшированием
  return <UserTable users={users} />;
}
```
````

## 2. Server Actions

- Предпочитайте Server Actions обычным Route Handlers (API), если не требуется внешний доступ.
- Всегда типизируйте входные данные с помощью Zod.
- Используйте `revalidatePath` / `revalidateTag` для обновления кэша после мутаций.
- Выносите Server Actions в отдельные файлы в папке `actions/`.

```ts
// actions/user.ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({ email: z.string().email() });

export async function updateEmail(prevState: any, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten() };

  // ... обновление в БД
  revalidatePath("/profile");
  return { success: true };
}
```

## 3. Формы — полный стек

- Используйте `react-hook-form` с `resolver` от `@hookform/resolvers/zod`.
- Подключайте Server Action через `useActionState` (React 19) или `useFormState` (Next.js).
- Отображайте ошибки валидации рядом с полями, учитывая возвращаемые `errors`.
- Для pending-состояния используйте `useFormStatus` (React 19) внутри отдельного компонента.

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { updateEmail } from "@/actions/user";
import { schema } from "@/actions/user/schema";

export function EmailForm() {
  const [state, formAction, pending] = useActionState(updateEmail, null);
  const {
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form action={formAction}>
      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      {state?.errors?.email && <p>{state.errors.email}</p>}
      <button type="submit" disabled={pending}>
        Сохранить
      </button>
    </form>
  );
}
```

## 4. API Routes

- Используйте для внешних интеграций или когда нужен не‑Next.js клиент.
- В `route.ts` экспортируйте функции с именами HTTP методов (`GET`, `POST`).
- Типизируйте `params` и `searchParams`.

## 5. Кэширование и ревалидация

- Понимайте разницу между `fetch` кэшем, полным роутом и тегами.
- Для динамических данных используйте `{ next: { revalidate: 60 } }` или `cache: "no-store"`.
- `revalidateTag` – мощный инструмент для точечной инвалидации.

```

---

```
