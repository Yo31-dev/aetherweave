import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#FF6B35',      // AetherWeave Orange
          secondary: '#FFB74D',    // AetherWeave Yellow-Orange
          accent: '#FFA726',       // Orange Light
          error: '#F44336',        // Red
          info: '#2196F3',         // Blue
          success: '#4CAF50',      // Green
          warning: '#FFC107',      // Amber (complements orange)
          background: '#FAFAFA',   // Light Gray
          surface: '#FFFFFF',      // White
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
});
