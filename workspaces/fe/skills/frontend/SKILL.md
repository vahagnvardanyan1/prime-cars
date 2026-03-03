---
name: frontend
slug: frontend
version: "2.0.0"
description: "Multi-framework frontend development guidelines. Covers React, Vue, Svelte, Next.js, Nuxt, Astro, and vanilla JS/TS. Provides patterns for responsive, accessible, performant UI across any frontend stack. Read this skill alongside implement or debug to understand frontend-specific conventions."
metadata: {"openclaw":{"emoji":"🖥️","requires":{"bins":[]},"os":["linux","darwin","win32"]}}
---

## When to Use

Read this skill when working on any frontend task — features, bug fixes, refactors, or tests that involve UI components, pages, styling, state management, or client-side behavior. This skill supplements the `implement` and `debug` skills with frontend-specific guidance.

## Framework Detection

Detect the framework from project config files and `package.json`:

| Signal | Framework |
|--------|-----------|
| `next.config.*` or `next` in deps | Next.js |
| `nuxt.config.*` or `nuxt` in deps | Nuxt |
| `svelte.config.*` or `svelte` in deps | Svelte/SvelteKit |
| `astro.config.*` or `astro` in deps | Astro |
| `vite.config.*` + `react` in deps | React + Vite |
| `vite.config.*` + `vue` in deps | Vue + Vite |
| `remix.config.*` or `@remix-run/*` in deps | Remix |
| `angular.json` or `@angular/core` in deps | Angular |
| No framework, just `typescript` | Vanilla TS |

Then read 3+ existing component files to learn the project's specific patterns before writing anything.

## Universal Frontend Rules

These apply regardless of framework:

### 1. Mobile-First Responsive Design

- Start with mobile layout, scale up with breakpoints
- Every grid/flex layout must work on small screens
- Touch targets minimum 44×44px
- Test layouts at 320px, 768px, 1024px, 1440px widths mentally

### 2. Accessibility — Non-Negotiable

- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<button>` — not `<div>` for everything
- Color contrast: 4.5:1 for text, 3:1 for UI controls
- Visible focus indicators on every interactive element
- Full keyboard navigation (Tab, Enter, Space, Escape)
- `aria-label` on non-obvious interactive elements
- `alt` text on all images
- Form labels associated with inputs (`htmlFor`/`for` attribute)

### 3. Performance Basics

- Lazy-load below-fold content
- Optimize images (use framework's image component when available)
- Don't import entire libraries for one function (use tree-shakeable imports)
- Avoid layout shift (set explicit dimensions on images/containers)
- Memoize only when measured — no premature optimization

### 4. Error & Loading States

- Show loading state for any operation >500ms
- Handle error states gracefully — show user-friendly messages
- Preserve user input on errors — never clear forms on submission failure
- Handle empty states (no data, no results)

### 5. Styling

- Follow the project's existing styling approach exactly
- If Tailwind: use the project's configured classes, not arbitrary values
- If CSS Modules: follow existing naming conventions
- If styled-components/Emotion: match the existing patterns
- Never hardcode colors — use theme variables/tokens
- Support dark mode if the project has it configured

## React-Specific Patterns

When working in React (including Next.js, Remix, Vite+React):

```tsx
// Component structure — match project's existing pattern
// Most common: named export with typed props

interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ variant = "primary", children, onClick, disabled }: ButtonProps) {
  return (
    <button
      className={cn("rounded-md px-4 py-2", variants[variant])}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

**Hooks rules:**
- Custom hooks start with `use` prefix
- Keep hooks at the top of the component, before any early returns
- Don't call hooks conditionally
- Extract complex logic into custom hooks

**State management — use what the project uses:**
- `useState`/`useReducer` for local state
- Context API, Zustand, Redux/RTK, Jotai — match the project
- TanStack Query/SWR for server state — match the project

### Next.js App Router Specifics

- Server Components by default — add `"use client"` only when needed (hooks, events, browser APIs)
- Use `next/image` for images, `next/link` for navigation
- Data fetching in Server Components when possible
- Use `loading.tsx` and `error.tsx` for suspense boundaries

### Next.js Pages Router Specifics

- `getServerSideProps` for dynamic data, `getStaticProps` for static data
- `_app.tsx` for global layout, `_document.tsx` for HTML structure

## Vue-Specific Patterns

When working in Vue (including Nuxt):

```vue
<!-- Match project's API: Composition API vs Options API -->
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  increment: [value: number]
}>()

const doubled = computed(() => props.count * 2)
</script>

<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <span>{{ doubled }}</span>
  </div>
</template>
```

**Vue rules:**
- Check if project uses Composition API (`<script setup>`) or Options API
- Use Pinia for state if the project uses it
- In Nuxt: use `useFetch`/`useAsyncData` for data fetching

## Svelte-Specific Patterns

When working in Svelte/SvelteKit:

```svelte
<script lang="ts">
  export let title: string;
  export let count: number = 0;

  $: doubled = count * 2;

  function handleClick() {
    count += 1;
  }
</script>

<div class="card">
  <h2>{title}</h2>
  <button on:click={handleClick}>{doubled}</button>
</div>
```

**Svelte rules:**
- Use reactive declarations (`$:`) for derived values
- Use Svelte stores for shared state
- In SvelteKit: use `load` functions for data fetching

## Common Frontend Traps

| Trap | Why It's Bad | Fix |
|------|-------------|-----|
| Raw `<img>` in Next.js | No optimization, CLS | Use `next/image` |
| Hardcoded hex colors | Breaks themes/dark mode | Use CSS variables or theme tokens |
| Missing loading states | App feels broken | Add skeletons or spinners |
| `<div>` for buttons | Inaccessible | Use `<button>` |
| No error boundaries | White screen on error | Add error handling UI |
| Clearing form on error | User loses work | Preserve input, show error inline |
| `any` types on event handlers | Type safety lost | Use proper React/Vue event types |
| Index as key in lists | Bugs on reorder/delete | Use stable unique IDs |
| useEffect for derived state | Unnecessary re-renders | Use useMemo or compute inline |
| Missing cleanup in effects | Memory leaks | Return cleanup function |

## Scope

This skill provides frontend-specific patterns and guidelines. It supplements the `implement` skill's autonomous pipeline — it does not replace it. When both skills are relevant, read both and follow the implement pipeline with frontend patterns applied.
