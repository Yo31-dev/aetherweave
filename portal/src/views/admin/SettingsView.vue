<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">{{ $t('settings.title', 'Settings') }}</h1>
      </v-col>
    </v-row>

    <!-- Language Settings -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-translate" class="mr-2"></v-icon>
            {{ $t('settings.language.title', 'Language Settings') }}
          </v-card-title>
          <v-card-text>
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
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Account Management -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-account-cog" class="mr-2"></v-icon>
            {{ $t('settings.account.title', 'Account Management') }}
          </v-card-title>
          <v-card-text>
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
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Administration Links -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-cog" class="mr-2"></v-icon>
            {{ $t('settings.admin.title', 'Administration') }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                prepend-icon="mdi-console-line"
                :title="$t('settings.admin.logs', 'System Logs')"
                :subtitle="$t('settings.admin.logsDesc', 'View and manage system logs')"
                @click="navigateToLogs"
              >
                <template v-slot:append>
                  <v-icon icon="mdi-chevron-right"></v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Management -->
    <v-row>
      <v-col cols="12">
        <v-card color="warning-darken-4">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-database-remove" class="mr-2"></v-icon>
            {{ $t('settings.data.title', 'Data Management') }}
          </v-card-title>
          <v-card-text>
            <p class="text-body-2 mb-4">
              {{ $t('settings.data.description', 'Manage application data stored locally in your browser.') }}
            </p>

            <!-- Storage Statistics -->
            <v-expansion-panels class="mb-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon icon="mdi-chart-bar" class="mr-2"></v-icon>
                  {{ $t('settings.data.stats', 'Storage Statistics') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list density="compact">
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
                    @click="loadStorageStats"
                    :loading="statsLoading"
                    class="mt-2"
                  >
                    <v-icon start icon="mdi-refresh"></v-icon>
                    {{ $t('settings.data.refresh', 'Refresh') }}
                  </v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Reset Warning -->
            <v-alert type="warning" variant="tonal" class="mb-4">
              <div class="d-flex align-center">
                <v-icon icon="mdi-alert" class="mr-2"></v-icon>
                <div>
                  <div class="font-weight-bold">{{ $t('settings.data.warning', 'Warning') }}</div>
                  <div class="text-body-2">
                    {{ $t('settings.data.warningMessage', 'This action will permanently delete all stored data including logs, settings, and cached information. This cannot be undone.') }}
                  </div>
                </div>
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
          </v-card-text>
        </v-card>
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
