<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon size="32" color="primary" class="mr-3">mdi-cog</v-icon>
          <h1 class="text-h4">{{ $t('settings.title', 'Settings') }}</h1>
        </div>
      </v-col>
    </v-row>

    <!-- Settings Sections as Accordions -->
    <v-row>
      <v-col cols="12">
        <v-expansion-panels>
          <!-- Language Settings -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-translate</v-icon>
                <span class="text-h6">{{ $t('settings.language.title', 'Language Settings') }}</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="text-body-2 mb-4">
                {{ $t('settings.language.description', 'Select your preferred language for the application interface.') }}
              </p>
              <v-select
                v-model="selectedLocale"
                :items="locales"
                :label="$t('settings.language.select', 'Language')"
                @update:model-value="changeLocale"
                variant="outlined"
                density="comfortable"
              >
                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :icon="item.raw.icon"></v-icon>
                    </template>
                  </v-list-item>
                </template>
                <template v-slot:selection="{ item }">
                  <v-icon :icon="item.raw.icon" class="mr-2"></v-icon>
                  {{ item.raw.title }}
                </template>
              </v-select>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Account Management -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-account-cog</v-icon>
                <span class="text-h6">{{ $t('settings.account.title', 'Account Management') }}</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="text-body-2 mb-4">
                {{ $t('settings.account.description', 'Manage your account settings and security.') }}
              </p>

              <v-list density="compact">
                <v-list-item
                  prepend-icon="mdi-lock-reset"
                  :title="$t('settings.account.changePassword', 'Change Password')"
                  :subtitle="$t('settings.account.changePasswordDesc', 'Update your account password')"
                  @click="redirectToPasswordChange"
                >
                  <template v-slot:append>
                    <v-icon icon="mdi-open-in-new"></v-icon>
                  </template>
                </v-list-item>

                <v-list-item
                  prepend-icon="mdi-shield-account"
                  :title="$t('settings.account.accountSettings', 'Account Settings')"
                  :subtitle="$t('settings.account.accountSettingsDesc', 'Manage your profile and security settings')"
                  @click="redirectToAccountManagement"
                >
                  <template v-slot:append>
                    <v-icon icon="mdi-open-in-new"></v-icon>
                  </template>
                </v-list-item>
              </v-list>

              <v-alert type="info" variant="tonal" class="mt-4">
                <div class="text-body-2">
                  {{ $t('settings.account.redirectInfo', 'You will be redirected to your identity provider account management.') }}
                </div>
              </v-alert>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Data Management -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-database-remove</v-icon>
                <span class="text-h6">{{ $t('settings.data.title', 'Data Management') }}</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="text-body-2 mb-4">
                {{ $t('settings.data.description', 'Manage application data stored locally in your browser.') }}
              </p>

              <!-- Storage Statistics -->
              <div class="mb-4">
                <div class="d-flex align-center mb-3">
                  <v-icon icon="mdi-chart-bar" class="mr-2"></v-icon>
                  <span class="text-subtitle-1 font-weight-medium">{{ $t('settings.data.stats', 'Storage Statistics') }}</span>
                </div>
                <v-list density="compact" class="mb-2">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-database"></v-icon>
                    </template>
                    <v-list-item-title>IndexedDB</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ storageStats.indexedDB.count }} database(s): {{ storageStats.indexedDB.databases.join(', ') }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-package-variant"></v-icon>
                    </template>
                    <v-list-item-title>localStorage</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ storageStats.localStorage.count }} item(s) - {{ formatBytes(storageStats.localStorage.sizeBytes) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-package-variant-closed"></v-icon>
                    </template>
                    <v-list-item-title>sessionStorage</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ storageStats.sessionStorage.count }} item(s) - {{ formatBytes(storageStats.sessionStorage.sizeBytes) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-cookie"></v-icon>
                    </template>
                    <v-list-item-title>Cookies</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ storageStats.cookies.count }} cookie(s)
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  @click="loadStorageStats"
                  :loading="statsLoading"
                >
                  <v-icon start icon="mdi-refresh"></v-icon>
                  {{ $t('settings.data.refresh', 'Refresh') }}
                </v-btn>
              </div>

              <!-- Reset Warning -->
              <v-alert type="warning" variant="tonal" class="mb-4">
                <div class="font-weight-bold">{{ $t('settings.data.warning', 'Warning') }}</div>
                <div class="text-body-2">
                  {{ $t('settings.data.warningMessage', 'This action will permanently delete all stored data including logs, settings, and cached information. This cannot be undone.') }}
                </div>
              </v-alert>

              <!-- Reset Button -->
              <v-btn
                color="error"
                variant="elevated"
                @click="confirmReset = true"
                :loading="resetLoading"
              >
                <v-icon start icon="mdi-delete-forever"></v-icon>
                {{ $t('settings.data.reset', 'Reset All Data') }}
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmReset" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center bg-error">
          <v-icon icon="mdi-alert-circle" class="mr-2"></v-icon>
          {{ $t('settings.data.confirmTitle', 'Confirm Data Reset') }}
        </v-card-title>
        <v-card-text class="pt-4">
          <p>{{ $t('settings.data.confirmMessage', 'Are you sure you want to delete all application data?') }}</p>
          <p class="text-body-2 text-warning">{{ $t('settings.data.confirmWarning', 'This will clear:') }}</p>
          <ul class="text-body-2">
            <li>{{ $t('settings.data.confirmIndexedDB', 'All IndexedDB databases (logs, settings)') }}</li>
            <li>{{ $t('settings.data.confirmLocalStorage', 'localStorage (preferences, cached data)') }}</li>
            <li>{{ $t('settings.data.confirmSessionStorage', 'sessionStorage (temporary session data)') }}</li>
            <li>{{ $t('settings.data.confirmCookies', 'All cookies') }}</li>
          </ul>
          <p class="text-body-2 mt-3">{{ $t('settings.data.confirmReload', 'The page will reload after reset.') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="confirmReset = false"
          >
            {{ $t('common.cancel', 'Cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="resetAllData"
            :loading="resetLoading"
          >
            {{ $t('settings.data.confirmButton', 'Yes, Delete All Data') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { logService } from '@/services/log.service';
import { eventBus } from '@/services/event-bus.service';
import { dataResetService } from '@/services/data-reset.service';
import { settingsService, SettingKeys } from '@/services/settings.service';
import { authService } from '@/services/auth.service';

const { locale } = useI18n();
const router = useRouter();

// Language settings
const selectedLocale = ref(locale.value);

const locales = [
  { value: 'en', title: 'English', icon: 'mdi-flag-variant' },
  { value: 'fr', title: 'Français', icon: 'mdi-flag-variant' },
];

const changeLocale = async (newLocale: string) => {
  locale.value = newLocale;

  // Save to both localStorage (for compatibility) and IndexedDB
  localStorage.setItem('locale', newLocale);
  await settingsService.set(SettingKeys.LOCALE, newLocale);

  // Publish locale change to Web Components
  eventBus.publishLocale({ locale: newLocale });

  logService.info(`Language changed to ${newLocale}`, 'SettingsView');
};

// Account management
const redirectToPasswordChange = () => {
  authService.redirectToPasswordChange();
  logService.info('Redirecting to identity provider password change', 'SettingsView');
};

const redirectToAccountManagement = () => {
  authService.redirectToAccountManagement();
  logService.info('Redirecting to identity provider account management', 'SettingsView');
};

const navigateToLogs = () => {
  router.push('/admin/logs');
};

// Data management
const confirmReset = ref(false);
const resetLoading = ref(false);
const statsLoading = ref(false);
const storageStats = ref({
  indexedDB: { databases: [] as string[], count: 0 },
  localStorage: { keys: [] as string[], count: 0, sizeBytes: 0 },
  sessionStorage: { keys: [] as string[], count: 0, sizeBytes: 0 },
  cookies: { count: 0 },
});

const formatBytes = (bytes: number): string => {
  return dataResetService.formatBytes(bytes);
};

const loadStorageStats = async () => {
  statsLoading.value = true;
  try {
    storageStats.value = await dataResetService.getStorageStats();
    logService.debug('Storage stats loaded', 'SettingsView', storageStats.value);
  } catch (error) {
    logService.error('Failed to load storage stats', 'SettingsView', { error });
  } finally {
    statsLoading.value = false;
  }
};

const resetAllData = async () => {
  resetLoading.value = true;
  try {
    logService.info('Resetting all application data', 'SettingsView');

    // Clear all data
    await dataResetService.clearAll();

    logService.info('All application data cleared successfully', 'SettingsView');

    // Close dialog
    confirmReset.value = false;

    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    logService.error('Failed to reset data', 'SettingsView', { error });
    resetLoading.value = false;
  }
};

// Load stats on mount
onMounted(() => {
  loadStorageStats();

  // Load saved locale from IndexedDB if available
  settingsService.get<string>(SettingKeys.LOCALE).then(savedLocale => {
    if (savedLocale && savedLocale !== locale.value) {
      locale.value = savedLocale;
      selectedLocale.value = savedLocale;
      logService.debug(`Restored locale from IndexedDB: ${savedLocale}`, 'SettingsView');
    }
  });
});
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
