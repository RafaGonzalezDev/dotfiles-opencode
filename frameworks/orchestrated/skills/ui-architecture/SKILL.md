---
name: ui-architecture
description: Structure UI into components, layouts, and state boundaries. Use when designing component hierarchy, deciding where state lives, defining component responsibilities, or evaluating how UI pieces communicate.
---

## Component design principles

A component should have a single, nameable responsibility. If you cannot describe
what it does in one sentence without using "and", split it.

**Types of components:**

- **Page / Screen**: composes feature components, owns route-level state.
- **Feature**: encapsulates a complete user-facing capability (e.g. ChatPane, SettingsForm).
- **UI / Presentational**: stateless, receives props, owns no business logic.
- **Layout**: positions children, owns no content or state.
- **Container / Smart**: fetches or transforms data, delegates rendering to presentational components.

Never mix layout concerns with business logic in the same component.

## Component hierarchy rules

- Parents own state; children receive it as props or via context.
- Lift state only as high as the lowest common ancestor that needs it.
- Avoid prop drilling beyond two levels — introduce context or a state slice.
- Co-locate state with the component that owns it; only promote when necessary.

## State boundaries

| State type | Where it lives |
|---|---|
| UI state (open/closed, active tab) | Local component state |
| Shared feature state | Feature-level context or store slice |
| Cross-feature or global state | Global store (Context + useReducer, Zustand, etc.) |
| Server/async state | Dedicated layer (React Query, SWR, custom hook) |

## Communication patterns

- Parent → child: props.
- Child → parent: callback props.
- Sibling → sibling: lift state to common parent.
- Distant components: context or global store.
- Never communicate via DOM manipulation or direct ref calls across component boundaries.

## File and folder structure

Group by feature, not by type:
```
features/
  chat/
    ChatPane.tsx
    ChatComposer.tsx
    useChatState.ts
  settings/
    SettingsForm.tsx
    useSettingsState.ts
shared/
  components/
  hooks/
  utils/
```

## Review checklist

- Does each component have one responsibility?
- Is state owned at the right level?
- Are there prop drilling chains longer than two levels?
- Are layout, presentation, and logic separated?
- Could any component be replaced without touching its siblings?