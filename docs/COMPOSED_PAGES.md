# Composed Pages Architecture - AetherWeave

**Context**: This document describes the architecture for composable micro-frontend pages where multiple Web Components from different services are assembled together on a single page and communicate with each other.

**Read this file when**:
- Creating pages that assemble multiple Web Components together
- Implementing cross-component communication
- Understanding the stateful EventBus pattern
- Working on composed dashboards or complex views

## Overview

AetherWeave supports **two patterns of micro-frontends**:

### Pattern 1: Full-Page Micro-Frontend (Current Implementation)
- **One Web Component = One complete page**
- Loaded via `MicroFrontendLoader.vue`
- Registered in `microservices.config.ts`
- Gets its own route and navigation entry
- Example: User Management page (`<user-management-app>`)

### Pattern 2: Composable Micro-Frontend (This Document)
- **Multiple small Web Components assembled into one page**
- Components come from **different services**
- Components need to **communicate with each other**
- Layout controlled by Portal (Vue.js pages)
- Example: Dashboard with `<user-stats-wc>`, `<order-list-wc>`, `<notification-panel-wc>`

## Architecture Decisions

Based on analysis and discussion, the following decisions were made:

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Communication** | EventBus with State (stateful) | Resolves timing issues, full decoupling, single pattern |
| **Page Definition** | Vue.js components in Portal | Simple, flexible, full layout control |
| **Component Loading** | Eager loading at startup | Simple, no latency, sufficient for < 20 WC |
| **Dependencies** | EventBus stateful only | One clear pattern, easy to document |

## Communication Architecture

### The Problem: Component Timing

When multiple Web Components need to share data, they may be loaded in **any order**:

```
Scenario 1: A loads before B
  T0: user-selector-wc emits user:selected
  T1: user-stats-wc loads and listens
  ❌ user-stats-wc missed the event!

Scenario 2: B loads before A
  T0: user-stats-wc loads and listens
  T1: user-selector-wc emits user:selected
  ✅ user-stats-wc receives the event
```

**Standard EventBus (pub/sub) only works in Scenario 2.**

### The Solution: Stateful EventBus

The EventBus needs to **persist the last state** of certain events so that late joiners can receive it immediately.

```typescript
// EventBus with state management
class MicroFrontendEventBus {
  private emitter: EventEmitter;
  private lastState: Map<string, { data: any; timestamp: number }>;

  // Emit + persist state
  emitStateful(eventName: string, payload: any): void {
    this.lastState.set(eventName, { data: payload, timestamp: Date.now() });
    this.emitter.emit(eventName, payload);
  }

  // Listen + receive current state if exists
  onStateful(eventName: string, callback: Function): () => void {
    // Deliver current state immediately if exists
    const state = this.lastState.get(eventName);
    if (state) {
      callback(state.data);
    }

    // Listen for future events
    this.emitter.on(eventName, callback);

    // Return unsubscribe function
    return () => this.emitter.off(eventName, callback);
  }

  // Clear persisted state
  clearState(eventName?: string): void {
    if (eventName) {
      this.lastState.delete(eventName);
    } else {
      this.lastState.clear();
    }
  }

  // Get current state without subscribing
  getState(eventName: string): any | undefined {
    return this.lastState.get(eventName)?.data;
  }
}
```

### Usage Pattern

#### Emitting Component (Source)

```typescript
// user-selector-wc
class UserSelectorWC extends LitElement {
  private handleUserSelect(user: User) {
    // Emit stateful event
    eventBus.emitStateful('user:selected', {
      userId: user.id,
      userName: user.name,
      email: user.email
    });
  }
}
```

#### Consuming Component (Listener)

```typescript
// user-stats-wc
class UserStatsWC extends LitElement {
  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();

    // Listen to stateful event
    // ✅ Receives current state immediately if exists
    // ✅ Then receives future updates
    this.unsubscribe = eventBus.onStateful('user:selected', (data) => {
      this.userId = data.userId;
      this.loadStats();
    });
  }

  disconnectedCallback() {
    // Clean up subscription
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  private async loadStats() {
    // Fetch stats for this.userId
  }
}
```

### Event Naming Convention

Use namespaced event names for clarity:

```typescript
// ✅ Good: Clear, namespaced
'user:selected'
'user:updated'
'order:created'
'filter:changed'
'search:query'

// ❌ Bad: Vague, conflicts possible
'selected'
'changed'
'update'
```

### When to Use Stateful vs Regular Events

| Event Type | Use | Example |
|------------|-----|---------|
| **Stateful** (`emitStateful`/`onStateful`) | Cross-component state that should persist | `user:selected`, `filter:changed`, `tab:active` |
| **Regular** (`emit`/`on`) | One-time notifications, no persistence needed | `notification:show`, `error:occurred`, `action:completed` |

**Rule of thumb**: If a late-joining component would need this data, use stateful.

## Creating a Composed Page

### Step 1: Define the Page Component

Create a Vue.js page that assembles the Web Components:

```vue
<!-- portal/src/views/DashboardComposed.vue -->
<template>
  <v-container fluid>
    <!-- Page header -->
    <v-row>
      <v-col>
        <h1>{{ $t('dashboard.title') }}</h1>
      </v-col>
    </v-row>

    <!-- Composed Web Components -->
    <v-row>
      <!-- User selector -->
      <v-col cols="12" md="4">
        <user-selector-wc
          :token="authStore.accessToken"
          :user="authStore.profile"
          :lang="locale"
        />
      </v-col>

      <!-- User stats (listens to user:selected) -->
      <v-col cols="12" md="8">
        <user-stats-wc
          :token="authStore.accessToken"
          :user="authStore.profile"
          :lang="locale"
        />
      </v-col>
    </v-row>

    <v-row>
      <!-- Order list (listens to user:selected) -->
      <v-col cols="12">
        <order-list-wc
          :token="authStore.accessToken"
          :user="authStore.profile"
          :lang="locale"
        />
      </v-col>
    </v-row>

    <v-row>
      <!-- Notification panel (independent) -->
      <v-col cols="12">
        <notification-panel-wc
          :token="authStore.accessToken"
          :user="authStore.profile"
          :lang="locale"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { locale } = useI18n();
</script>
```

### Step 2: Register the Route

Add the route in `portal/src/router/index.ts`:

```typescript
{
  path: '/dashboard-composed',
  name: 'dashboard-composed',
  component: () => import('@/views/DashboardComposed.vue'),
  meta: {
    requiresAuth: true, // Optional
    title: 'Composed Dashboard'
  }
}
```

### Step 3: Add Navigation Entry (Optional)

If you want the page in the sidebar, add it to `AppSidebar.vue`:

```vue
<v-list-item
  to="/dashboard-composed"
  prepend-icon="mdi-view-dashboard"
  :title="$t('nav.dashboardComposed')"
/>
```

### Step 4: Load Web Components (Eager Loading)

Import the Web Components in `portal/src/main.ts`:

```typescript
// Import Web Components (eager loading)
import '@user-service/frontend/user-selector-wc';
import '@user-service/frontend/user-stats-wc';
import '@order-service/frontend/order-list-wc';
import '@notification-service/frontend/notification-panel-wc';
```

**Note**: With eager loading, all Web Components are loaded at Portal startup. This is simple and works well for < 20 components. For more components, consider lazy loading (see Evolution Path below).

## Communication Flow Example

### Scenario: User Selection Dashboard

```
┌─────────────────────────────────────────────────────┐
│ Portal Page: DashboardComposed.vue                  │
│                                                      │
│  ┌──────────────────┐                               │
│  │ user-selector-wc │                               │
│  │ [Select: John]   │                               │
│  └────────┬─────────┘                               │
│           │                                          │
│           │ eventBus.emitStateful('user:selected', {│
│           │   userId: 123,                           │
│           │   userName: 'John Doe'                   │
│           │ })                                       │
│           │                                          │
│           ├─────────────────────┐                    │
│           │                     │                    │
│           ↓                     ↓                    │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ user-stats-wc    │  │ order-list-wc    │        │
│  │                  │  │                  │        │
│  │ onStateful(      │  │ onStateful(      │        │
│  │   'user:selected'│  │   'user:selected'│        │
│  │ )                │  │ )                │        │
│  │                  │  │                  │        │
│  │ Loads stats for  │  │ Loads orders for │        │
│  │ userId: 123      │  │ userId: 123      │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                      │
└─────────────────────────────────────────────────────┘

EventBus State:
  'user:selected' → { userId: 123, userName: 'John Doe', timestamp: ... }
```

**Flow**:
1. User clicks on "John Doe" in `user-selector-wc`
2. Component emits `user:selected` via `emitStateful`
3. EventBus persists the state AND emits the event
4. `user-stats-wc` receives the event and loads stats
5. `order-list-wc` receives the event and loads orders
6. If another component loads later (e.g., lazy-loaded), it will immediately receive the current state

## State Management

### State Lifecycle

```typescript
// State is created
eventBus.emitStateful('user:selected', { userId: 123 });

// State persists in memory
const currentState = eventBus.getState('user:selected');
// → { userId: 123 }

// State is cleared (when appropriate)
eventBus.clearState('user:selected');

// Or clear all state
eventBus.clearAll();
```

### When to Clear State

Clear state when it's no longer valid:

```typescript
// On logout
eventBus.onLogout(() => {
  eventBus.clearState(); // Clear all state
});

// On route change (if state is page-specific)
router.beforeEach((to, from) => {
  if (to.path !== from.path) {
    eventBus.clearState('page-specific:*');
  }
});

// When user manually resets
handleReset() {
  eventBus.clearState('user:selected');
  eventBus.clearState('filter:changed');
}
```

### State vs Props

**Question**: Should we use EventBus state OR Vue props?

**Answer**: Use **EventBus state for cross-service communication**, but Web Components still receive `token`, `user`, `lang` as **props** from the Portal.

```vue
<!-- Portal passes standard props -->
<user-stats-wc
  :token="authStore.accessToken"
  :user="authStore.profile"
  :lang="locale"
/>

<!-- Component receives business data via EventBus -->
<script>
eventBus.onStateful('user:selected', (data) => {
  this.selectedUserId = data.userId; // From EventBus
  // this.token is from props
  // this.user is from props (current logged-in user)
});
</script>
```

**Props** (from Portal):
- Authentication: `token`, `user`
- Locale: `lang`
- Configuration: static settings

**EventBus** (cross-component):
- Business data: selected user, filters, search queries
- User interactions: item clicked, selection changed
- Application events: data updated, action completed

## Best Practices

### ✅ Do

- **Use stateful events for cross-component state** (`user:selected`, `filter:changed`)
- **Use regular events for notifications** (`action:completed`, `error:occurred`)
- **Use namespaced event names** (`user:selected`, not `selected`)
- **Clean up subscriptions** in `disconnectedCallback()`
- **Document event contracts** (event name, payload structure)
- **Use TypeScript interfaces** for event payloads
- **Log important events** for debugging
- **Clear state on logout** or when no longer valid

### ❌ Don't

- **Don't use stateful for everything** (only for persistent state)
- **Don't forget to unsubscribe** (memory leaks!)
- **Don't emit huge payloads** (keep data minimal, IDs preferred)
- **Don't use EventBus for auth/locale** (use props from Portal)
- **Don't create event name conflicts** (namespace properly)
- **Don't keep stale state forever** (clear when appropriate)

## TypeScript Support

### Event Payload Interfaces

Define strong types for event payloads:

```typescript
// shared/types/events.ts
export interface UserSelectedEvent {
  userId: number;
  userName: string;
  email?: string;
}

export interface FilterChangedEvent {
  filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export interface OrderCreatedEvent {
  orderId: number;
  userId: number;
  total: number;
}
```

### Strongly Typed EventBus (Future Enhancement)

```typescript
// Extend EventBus with type-safe methods
interface ComposedPageEvents {
  'user:selected': UserSelectedEvent;
  'filter:changed': FilterChangedEvent;
  'order:created': OrderCreatedEvent;
}

// Usage with autocomplete + type checking
eventBus.emitStateful<'user:selected'>('user:selected', {
  userId: 123,
  userName: 'John',
  email: 'john@example.com'
});

eventBus.onStateful<'user:selected'>('user:selected', (data) => {
  // data is typed as UserSelectedEvent
  console.log(data.userId); // ✅ Autocomplete works
});
```

## Debugging

### Debugging EventBus Communication

```typescript
// Enable verbose logging in EventBus
eventBus.enableDebugMode(); // (future enhancement)

// Check current state
console.log('Current state:', eventBus.getState('user:selected'));

// Listen to all events (wildcard)
eventBus.onAllWebComponentEvents((eventName, payload) => {
  console.log(`[EventBus] ${eventName}`, payload);
});
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Component doesn't receive data | Not using `onStateful`, only `on` | Use `onStateful` for persistent state |
| Stale data displayed | State not cleared when invalid | Call `clearState()` on logout/reset |
| Memory leak | Forgot to unsubscribe | Call `unsubscribe()` in `disconnectedCallback()` |
| Event not received | Wrong event name (typo) | Use constants for event names |
| Circular updates | Component emits in response to same event | Add guards to prevent loops |

## Evolution Path

This architecture is designed to evolve as needs grow:

### Phase 1: Current (Simple, Sufficient for < 20 WC)
- ✅ Stateful EventBus
- ✅ Eager loading (all WC loaded at startup)
- ✅ Vue pages define composition
- ✅ Manual route registration

### Phase 2: Scaling (20-50 WC)
- 🔄 Lazy loading by route
- 🔄 Router guards load WC on demand
- 🔄 Split WC by "core" (eager) vs "feature" (lazy)

### Phase 3: Advanced (50+ WC, Multiple Teams)
- 🔄 Web Component manifests (services declare their pages)
- 🔄 Dynamic route registration from manifests
- 🔄 Bundle loading per service (UMD/ESM bundles via APISIX)
- 🔄 Version management for WC

### Phase 4: Generator (Automation)
- 🔄 Generator produces WC with EventBus integration
- 🔄 Auto-generated event types and documentation
- 🔄 Meta-model defines compositions
- 🔄 Generated manifests and routes

**Current status**: Phase 1 (sufficient for MVP and initial development)

## Implementation Checklist

To implement this architecture:

### 1. Enhance EventBus ✅ (To Do)
- [ ] Add `lastState` Map to `MicroFrontendEventBus`
- [ ] Implement `emitStateful(eventName, payload)`
- [ ] Implement `onStateful(eventName, callback)` with unsubscribe
- [ ] Implement `clearState(eventName?)` and `clearAll()`
- [ ] Implement `getState(eventName)`
- [ ] Add logging for stateful events
- [ ] Add unit tests

### 2. Update Documentation ✅
- [x] Create this document (`COMPOSED_PAGES.md`)
- [ ] Update `WEB_COMPONENTS.md` with EventBus usage examples
- [ ] Update `PORTAL.md` with reference to composed pages
- [ ] Add TypeScript interfaces for common events

### 3. Create Example Composed Page ⏳ (Future)
- [ ] Create `DashboardComposed.vue` example
- [ ] Create 2-3 simple Web Components for testing
- [ ] Demonstrate cross-component communication
- [ ] Test timing scenarios (component load order)
- [ ] Document patterns and learnings

### 4. Testing ⏳ (Future)
- [ ] Unit tests for stateful EventBus
- [ ] Integration tests for composed pages
- [ ] E2E tests for cross-component communication
- [ ] Performance tests (state memory usage)

## Related Documentation

- [portal/PORTAL.md](../portal/PORTAL.md) - Portal architecture, EventBus basics
- [WEB_COMPONENTS.md](WEB_COMPONENTS.md) - Web Component creation guide
- [CLAUDE.md](../CLAUDE.md) - Main project documentation
- [architecture/dream.md](../architecture/dream.md) - Project vision

## Questions & Decisions Log

**Q**: Why not use a centralized store (Pinia) instead of EventBus?
**A**: Pinia is Vue-specific. EventBus is framework-agnostic and works with any Web Component framework (Lit, Stencil, vanilla). We want WC to be Portal-independent.

**Q**: Why not use Custom Events (DOM events)?
**A**: Custom Events require components to be in the same DOM tree and know about each other. EventBus provides full decoupling across services.

**Q**: Why not pass data via props from the Vue page?
**A**: Props require the Vue page to orchestrate all data flow, creating tight coupling. EventBus allows components to communicate directly without the parent being involved.

**Q**: When should we clear state?
**A**: On logout (always), on route change (if state is page-specific), or when user explicitly resets. Don't clear too aggressively (lose benefits of stateful) or too rarely (stale data).

**Q**: What if two components emit the same event?
**A**: Last write wins. If this is a problem, use more specific event names or include source information in the payload.

**Q**: How do we handle event versioning?
**A**: For now, maintain backward compatibility. Future: version event names (`user:selected:v2`) or include version in payload.

**Q**: How do Web Components receive theme changes (dark/light mode)?
**A**: The Portal emits a stateful `theme:changed` event when the user toggles the theme. WC listen via `onStateful()` and receive the current theme immediately on load. See [WEB_COMPONENTS.md - Theme Support](./WEB_COMPONENTS.md#theme-support-darklight-mode) for implementation details.
