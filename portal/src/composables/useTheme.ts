import { ref, watch } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';

const THEME_STORAGE_KEY = 'theme';

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme();
  const isDark = ref(vuetifyTheme.global.name.value === 'dark');

  // Toggle between light and dark theme
  function toggleTheme() {
    isDark.value = !isDark.value;
    const newTheme = isDark.value ? 'dark' : 'light';
    vuetifyTheme.global.name.value = newTheme;
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }

  // Set specific theme
  function setTheme(theme: 'light' | 'dark') {
    isDark.value = theme === 'dark';
    vuetifyTheme.global.name.value = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
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
