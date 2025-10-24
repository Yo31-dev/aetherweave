import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import DashboardView from '@/views/DashboardView.vue';
import CallbackView from '@/views/CallbackView.vue';
import SilentRenewView from '@/views/SilentRenewView.vue';
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
        },
        {
          path: '/users',
          name: 'users',
          component: MicroFrontendLoader,
          props: () => {
            const microservice = getMicroServiceByPath('/users');
            if (!microservice) {
              throw new Error('Microservice not found');
            }
            return { microservice };
          },
        },
        // Future microservices routes will be added here
      ],
    },
  ],
});

export default router;
