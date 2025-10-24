<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Stateful EventBus Test Page</v-card-title>
          <v-card-subtitle>
            Test cross-component communication with stateful events
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Emitter Component -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Emitter Component</v-card-title>
          <v-card-text>
            <p>This component emits stateful events</p>

            <v-text-field
              v-model="userId"
              label="User ID"
              type="number"
              class="mb-4"
            />

            <v-text-field
              v-model="userName"
              label="User Name"
              class="mb-4"
            />

            <v-btn
              color="primary"
              @click="emitUserSelected"
              class="mb-2"
            >
              Emit user:selected
            </v-btn>

            <v-btn
              color="secondary"
              @click="emitFilterChanged"
              class="mb-2 ml-2"
            >
              Emit filter:changed
            </v-btn>

            <v-btn
              color="warning"
              @click="clearAllState"
              class="mb-2 ml-2"
            >
              Clear All State
            </v-btn>

            <v-divider class="my-4" />

            <p class="text-caption">Current state:</p>
            <pre class="text-caption">{{ currentState }}</pre>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Listener Component 1 -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Listener Component 1</v-card-title>
          <v-card-text>
            <p>This component listens to user:selected</p>

            <v-alert
              v-if="!isListening1"
              type="info"
              class="mb-4"
            >
              Not listening yet. Click "Start Listening" to subscribe.
            </v-alert>

            <v-alert
              v-else-if="!receivedData1"
              type="warning"
              class="mb-4"
            >
              Listening... No data received yet.
            </v-alert>

            <v-alert
              v-else
              type="success"
              class="mb-4"
            >
              Received data!
            </v-alert>

            <v-btn
              v-if="!isListening1"
              color="primary"
              @click="startListening1"
            >
              Start Listening
            </v-btn>

            <v-btn
              v-else
              color="error"
              @click="stopListening1"
            >
              Stop Listening
            </v-btn>

            <v-divider class="my-4" />

            <p class="text-caption">Received data:</p>
            <pre class="text-caption">{{ receivedData1 }}</pre>

            <p class="text-caption mt-4">Receive count: {{ receiveCount1 }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Listener Component 2 (late joiner) -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Listener Component 2 (Late Joiner)</v-card-title>
          <v-card-text>
            <p>This component subscribes AFTER emission to test state persistence</p>

            <v-alert
              v-if="!isListening2"
              type="info"
              class="mb-4"
            >
              Not listening yet. Emit an event first, THEN click "Start Listening".
              You should receive the persisted state immediately!
            </v-alert>

            <v-alert
              v-else-if="!receivedData2"
              type="warning"
              class="mb-4"
            >
              Listening... No data received yet.
            </v-alert>

            <v-alert
              v-else
              type="success"
              class="mb-4"
            >
              ✅ Received persisted state immediately!
            </v-alert>

            <v-btn
              v-if="!isListening2"
              color="primary"
              @click="startListening2"
            >
              Start Listening (Late)
            </v-btn>

            <v-btn
              v-else
              color="error"
              @click="stopListening2"
            >
              Stop Listening
            </v-btn>

            <v-divider class="my-4" />

            <p class="text-caption">Received data:</p>
            <pre class="text-caption">{{ receivedData2 }}</pre>

            <p class="text-caption mt-4">Receive count: {{ receiveCount2 }}</p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- State Inspector -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>State Inspector</v-card-title>
          <v-card-text>
            <v-btn
              color="primary"
              @click="inspectState"
              class="mb-4"
            >
              Refresh State
            </v-btn>

            <v-divider class="my-4" />

            <p class="text-caption">All persisted state:</p>
            <pre class="text-caption">{{ inspectedState }}</pre>

            <v-divider class="my-4" />

            <p class="text-caption">Test user:selected exists:</p>
            <p class="text-body-2">{{ hasUserSelected }}</p>

            <p class="text-caption mt-2">Get user:selected directly:</p>
            <pre class="text-caption">{{ directUserState }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { eventBus } from '@/services/event-bus.service';

// Emitter state
const userId = ref(123);
const userName = ref('John Doe');
const currentState = ref<any>({});

// Listener 1 state
const isListening1 = ref(false);
const receivedData1 = ref<any>(null);
const receiveCount1 = ref(0);
let unsubscribe1: (() => void) | null = null;

// Listener 2 state (late joiner)
const isListening2 = ref(false);
const receivedData2 = ref<any>(null);
const receiveCount2 = ref(0);
let unsubscribe2: (() => void) | null = null;

// Inspector state
const inspectedState = ref<any>({});
const hasUserSelected = ref(false);
const directUserState = ref<any>(null);

// Emitter methods
function emitUserSelected() {
  const payload = {
    userId: userId.value,
    userName: userName.value,
    timestamp: new Date().toISOString(),
  };

  eventBus.emitStateful('user:selected', payload);
  updateCurrentState();
  console.log('[TEST] Emitted user:selected', payload);
}

function emitFilterChanged() {
  const payload = {
    status: 'active',
    category: 'electronics',
    timestamp: new Date().toISOString(),
  };

  eventBus.emitStateful('filter:changed', payload);
  updateCurrentState();
  console.log('[TEST] Emitted filter:changed', payload);
}

function clearAllState() {
  eventBus.clearState();
  updateCurrentState();
  inspectState();
  console.log('[TEST] Cleared all state');
}

function updateCurrentState() {
  const allState = eventBus.getAllState();
  const stateObj: any = {};
  allState.forEach((value, key) => {
    stateObj[key] = value;
  });
  currentState.value = stateObj;
}

// Listener 1 methods
function startListening1() {
  unsubscribe1 = eventBus.onStateful('user:selected', (data) => {
    receivedData1.value = data;
    receiveCount1.value++;
    console.log('[TEST] Listener 1 received:', data);
  });
  isListening1.value = true;
}

function stopListening1() {
  if (unsubscribe1) {
    unsubscribe1();
    unsubscribe1 = null;
  }
  isListening1.value = false;
  console.log('[TEST] Listener 1 stopped');
}

// Listener 2 methods (late joiner)
function startListening2() {
  unsubscribe2 = eventBus.onStateful('user:selected', (data) => {
    receivedData2.value = data;
    receiveCount2.value++;
    console.log('[TEST] Listener 2 (late joiner) received:', data);
  });
  isListening2.value = true;
}

function stopListening2() {
  if (unsubscribe2) {
    unsubscribe2();
    unsubscribe2 = null;
  }
  isListening2.value = false;
  console.log('[TEST] Listener 2 stopped');
}

// Inspector methods
function inspectState() {
  const allState = eventBus.getAllState();
  const stateObj: any = {};
  allState.forEach((value, key) => {
    stateObj[key] = {
      data: value.data,
      age: `${Date.now() - value.timestamp}ms`,
    };
  });
  inspectedState.value = stateObj;

  hasUserSelected.value = eventBus.hasState('user:selected');
  directUserState.value = eventBus.getState('user:selected');
}

// Initialize
updateCurrentState();
inspectState();
</script>
