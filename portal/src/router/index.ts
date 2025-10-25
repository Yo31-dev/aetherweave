import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import DashboardView from '@/views/DashboardView.vue';
import CallbackView from '@/views/CallbackView.vue';
import SilentRenewView from '@/views/SilentRenewView.vue';
import LogsAdminView from '@/views/admin/LogsAdminView.vue';
import SettingsView from '@/views/admin/SettingsView.vue';
import StatefulEventBusTest from '@/views/StatefulEventBusTest.vue';
import MicroFrontendLoader from '@/components/MicroFrontendLoader.vue';
import { getMicroServiceByPath } from '@/config/microservices.config';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth callbacks (no layout)
    {
      path: '/callback',
      name: 'callback',
      component: CallbackView,
    },
    {
      path: '/silent-renew',
      name: 'silent-renew',
      component: SilentRenewView,
    },
    // Main app with layout
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView,
          meta: {
            title: 'Dashboard',
          },
        },
        {
          path: '/users/:pathMatch(.*)*',
          name: 'users',
          component: MicroFrontendLoader,
          meta: {
            title: 'User Management',
          },
          props: () => {
            const microservice = getMicroServiceByPath('/users');
            if (!microservice) {
              throw new Error('Microservice not found');
            }
            return { microservice };
          },
        },
        {
          path: '/catalog',
          name: 'catalog',
          component: DashboardView,
          meta: {
            title: 'Catalog',
          },
        },
        {
          path: '/admin/settings',
          name: 'admin-settings',
          component: SettingsView,
          meta: {
            title: 'Settings',
          },
        },
        {
          path: '/admin/logs',
          name: 'admin-logs',
          component: LogsAdminView,
          meta: {
            title: 'System Logs',
          },
        },
        {
          path: '/test/stateful-eventbus',
          name: 'test-stateful-eventbus',
          component: StatefulEventBusTest,
          meta: {
            title: 'EventBus Test',
          },
        },
        // Future microservices routes will be added here
      ],
    },
  ],
});

export default router;
