# Stateful EventBus - Test Guide

## Overview

The stateful EventBus has been implemented to support cross-component communication in composed pages. This allows Web Components from different services to communicate even when they load in different orders.

## What Was Implemented

### New EventBus Methods

1. **`emitStateful(eventName, payload)`** - Emit an event AND persist its state
2. **`onStateful(eventName, callback)`** - Listen to an event AND receive current state if exists
3. **`clearState(eventName?)`** - Clear persisted state (specific or all)
4. **`getState(eventName)`** - Get current state without subscribing
5. **`hasState(eventName)`** - Check if state exists
6. **`getAllState()`** - Get all persisted state (debugging)

### Key Features

- ✅ **Late joiners receive state immediately** - Components that subscribe after emission get the current state
- ✅ **Automatic cleanup on logout** - State is cleared when user logs out
- ✅ **Unsubscribe support** - `onStateful` returns a function to clean up listeners
- ✅ **Logging** - All stateful events are logged via `logService`
- ✅ **Window exposure** - Available to Web Components via `window.__AETHERWEAVE_STATEFUL_BUS__`

## How to Test

### 1. Start the Portal

```bash
cd portal
pnpm run dev
```

### 2. Access the Test Page

Navigate to: **http://localhost:5173/test/stateful-eventbus**

### 3. Test Scenarios

#### Scenario 1: Normal Event Flow (Listener Before Emission)

1. Click **"Start Listening"** on Listener Component 1
2. Enter user ID and name in Emitter Component
3. Click **"Emit user:selected"**
4. ✅ Listener 1 should immediately receive the data

#### Scenario 2: Late Joiner (Listener After Emission)

1. Enter user ID and name in Emitter Component
2. Click **"Emit user:selected"** (before starting listener 2!)
3. Click **"Start Listening (Late)"** on Listener Component 2
4. ✅ Listener 2 should **immediately** receive the persisted state

**This is the key feature!** The component receives data even though it subscribed AFTER the event was emitted.

#### Scenario 3: State Inspection

1. Emit some events
2. Click **"Refresh State"** in State Inspector
3. ✅ You should see all persisted state with timestamps and age
4. ✅ Check that `hasState` returns true for emitted events
5. ✅ Check that `getState` returns the current state

#### Scenario 4: State Clearing

1. Emit some events
2. Subscribe with listeners
3. Click **"Clear All State"**
4. ✅ State Inspector should show empty state
5. Click **"Start Listening (Late)"** again
6. ✅ Listener should NOT receive data (state was cleared)

#### Scenario 5: Unsubscribe

1. Start listening on Listener 1
2. Emit an event (listener receives it)
3. Click **"Stop Listening"**
4. Emit another event
5. ✅ Listener 1 should NOT receive the second event (unsubscribed)

### 4. Check Console Logs

Open browser DevTools console and look for:

```
[EventBus] Stateful event emitted: user:selected
[EventBus] Delivering persisted state for: user:selected (age: 123ms)
[EventBus] Unsubscribed from: user:selected
[EventBus] Cleared all state (2 events)
```

## Using in Real Components

### From Portal (Vue.js)

```typescript
import { eventBus } from '@/services/event-bus.service';

// Emit stateful event
eventBus.emitStateful('user:selected', { userId: 123, userName: 'John' });

// Listen to stateful event
const unsubscribe = eventBus.onStateful('user:selected', (data) => {
  console.log('User:', data.userId);
});

// Clean up
unsubscribe();
```

### From Web Components (Lit)

```typescript
import { LitElement } from 'lit';

class MyComponent extends LitElement {
  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();

    // Get stateful bus from window
    const statefulBus = (window as any).__AETHERWEAVE_STATEFUL_BUS__;

    // Listen to stateful event
    this.unsubscribe = statefulBus.onStateful('user:selected', (data: any) => {
      this.userId = data.userId;
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    // Clean up subscription
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  private handleUserSelect(user: any) {
    const statefulBus = (window as any).__AETHERWEAVE_STATEFUL_BUS__;
    statefulBus.emitStateful('user:selected', {
      userId: user.id,
      userName: user.name
    });
  }
}
```

## Event Naming Conventions

Use namespaced event names:

```typescript
// ✅ Good
'user:selected'
'user:updated'
'order:created'
'filter:changed'
'search:query'

// ❌ Bad
'selected'
'update'
'data'
```

## When to Use Stateful vs Regular Events

| Event Type | Use Case | Example |
|------------|----------|---------|
| **Stateful** | Cross-component state that should persist | `user:selected`, `filter:changed` |
| **Regular** | One-time notifications | `notification:show`, `error:occurred` |

**Rule**: If a late-joining component would need this data, use stateful.

## State Lifecycle

```typescript
// 1. State is created
eventBus.emitStateful('user:selected', { userId: 123 });

// 2. State persists in memory
const state = eventBus.getState('user:selected'); // { userId: 123 }

// 3. State is cleared on logout (automatic)
// OR manually:
eventBus.clearState('user:selected');
```

## Debugging Tips

### Check if state exists

```typescript
console.log('Has user state?', eventBus.hasState('user:selected'));
```

### Inspect all state

```typescript
console.log('All state:', eventBus.getAllState());
```

### Log event age

```typescript
const state = eventBus.getAllState().get('user:selected');
if (state) {
  console.log('State age:', Date.now() - state.timestamp, 'ms');
}
```

## Next Steps

1. ✅ **Phase 1 Complete**: Stateful EventBus implemented and tested
2. ⏳ **Phase 2**: Create a real composed page (e.g., Dashboard with multiple WC)
3. ⏳ **Phase 3**: Update WEB_COMPONENTS.md with usage examples
4. ⏳ **Phase 4**: Create sample Web Components that use stateful events

## Related Documentation

- [docs/COMPOSED_PAGES.md](../docs/COMPOSED_PAGES.md) - Full architecture documentation
- [portal/PORTAL.md](PORTAL.md) - Portal architecture
- [src/services/event-bus.service.ts](src/services/event-bus.service.ts) - Implementation

## Troubleshooting

### State not persisting

- Check that you're using `emitStateful`, not `emit`
- Check console logs for "Stateful event emitted"

### Listener not receiving state

- Check that you're using `onStateful`, not `on`
- Check that state exists: `eventBus.hasState('event-name')`
- Check that state wasn't cleared

### Memory concerns

- State is cleared automatically on logout
- State is stored in memory (Map), not persisted
- Call `clearState()` when state is no longer valid
