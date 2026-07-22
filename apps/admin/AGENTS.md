# TypeScript & ESLint Rules

## General

- Always generate valid TypeScript.
- Never generate JavaScript.
- Never use `any`.
- Prefer `unknown` over `any`.
- Always use strict typing.
- All exported functions must have explicit parameter and return types.
- Avoid unnecessary type assertions (`as`).
- Prefer interfaces for object shapes.
- Use type aliases for unions, intersections and utility types.
- Prefer readonly whenever possible.

## Variables

- Use `const` by default.
- Use `let` only when mutation is required.
- Never use `var`.

## Functions

- Prefer arrow functions.
- Keep functions small and focused.
- One responsibility per function.
- Avoid nested callbacks.

Example:

```ts
const calculateTotal = (
  items: CartItem[],
): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

## Imports

- Use absolute imports when configured.
- Remove unused imports.
- Sort imports automatically.
- Group imports:
  1. React
  2. External packages
  3. Internal modules
  4. Relative imports

## Objects

- Prefer object shorthand.
- Prefer destructuring.
- Avoid object mutation.

## Arrays

- Prefer map/filter/reduce.
- Avoid forEach when transformation is needed.
- Avoid index-based mutation.

## Async

- Always use async/await.
- Never use promise chains unless necessary.
- Always handle errors.

```ts
try {
  const user = await getUser();
} catch (error) {
  console.error(error);
}
```

## React

- Functional components only.
- Never use class components.
- Use hooks correctly.
- No hooks inside conditions.
- Prefer Server Components when applicable.
- Client Components must begin with:

```ts
'use client';
```

## Next.js

- Use App Router.
- Prefer Server Actions when appropriate.
- Use `next/navigation`.
- Use `next/image`.
- Use `next/link`.

## Naming

Component → PascalCase

```ts
UserCard
```

Hook → camelCase

```ts
useAuth
```

Interface

```ts
interface User
```

Type

```ts
type UserRole
```

Constant

```ts
const MAX_SIZE
```

Enum

```ts
enum UserStatus
```

## ESLint

Generated code MUST satisfy:

- @typescript-eslint/no-explicit-any
- @typescript-eslint/no-unused-vars
- prefer-const
- no-console (except error and warn)
- eqeqeq
- curly
- no-var
- object-shorthand
- prefer-template
- prefer-arrow-callback

Never disable ESLint.

Do not generate:

```ts
// eslint-disable
```

or

```ts
// @ts-ignore
```

unless explicitly requested.

## Formatting

- Follow Prettier.
- 2 spaces indentation.
- Single quotes.
- Trailing commas where supported.
- Semicolons required.

## Error Handling

Never ignore errors.

Instead of:

```ts
catch {}
```

Use:

```ts
catch (error) {
  console.error(error);
}
```

## Quality

Before returning code verify:

- No ESLint errors.
- No TypeScript errors.
- No unused imports.
- No unused variables.
- No implicit any.
- All types inferred correctly.