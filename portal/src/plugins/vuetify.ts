import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: localStorage.getItem('theme') || 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#FF6B35',      // AetherWeave Orange
          secondary: '#FFB74D',    // AetherWeave Yellow-Orange
          accent: '#FFA726',       // Orange Light
          error: '#F44336',        // Red
          info: '#2196F3',         // Blue
          success: '#4CAF50',      // Green
          warning: '#FFC107',      // Amber
          background: '#FAFAFA',   // Light Gray
          surface: '#FFFFFF',      // White
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#FF6B35',      // AetherWeave Orange (same)
          secondary: '#FFB74D',    // AetherWeave Yellow-Orange (same)
          accent: '#FFA726',       // Orange Light (same)
          error: '#F44336',        // Red
          info: '#2196F3',         // Blue
          success: '#4CAF50',      // Green
          warning: '#FFC107',      // Amber
          background: '#121212',   // Dark Gray (Material Design dark)
          surface: '#1E1E1E',      // Slightly lighter dark
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
});
