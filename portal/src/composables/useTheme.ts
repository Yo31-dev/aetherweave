import { ref, watch } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';
import { eventBus } from '@/services/event-bus.service';

const THEME_STORAGE_KEY = 'theme';
const THEME_CHANGE_EVENT = 'theme:changed';

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme();
  const isDark = ref(vuetifyTheme.global.name.value === 'dark');

  // Toggle between light and dark theme
  function toggleTheme() {
    isDark.value = !isDark.value;
    const newTheme = isDark.value ? 'dark' : 'light';

    // Vuetify 3.10.7 uses .value for reactivity
    vuetifyTheme.global.name.value = newTheme;

    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Emit event for Web Components using stateful event
    eventBus.emitStateful(THEME_CHANGE_EVENT, { theme: newTheme, isDark: isDark.value });
  }

  // Set specific theme
  function setTheme(theme: 'light' | 'dark') {
    isDark.value = theme === 'dark';

    // Vuetify 3.10.7 uses .value for reactivity
    vuetifyTheme.global.name.value = theme;

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Emit event for Web Components using stateful event
    eventBus.emitStateful(THEME_CHANGE_EVENT, { theme, isDark: isDark.value });
  }

  // Get current theme name
  function getCurrentTheme(): 'light' | 'dark' {
    return vuetifyTheme.global.name.value as 'light' | 'dark';
  }

  // Watch for theme changes (e.g., from system preferences)
  watch(
    () => vuetifyTheme.global.name.value,
    (newTheme) => {
      isDark.value = newTheme === 'dark';
    }
  );

  return {
    isDark,
    toggleTheme,
    setTheme,
    getCurrentTheme,
  };
}
