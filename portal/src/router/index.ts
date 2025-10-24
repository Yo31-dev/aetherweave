import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import CallbackView from '@/views/CallbackView.vue';
import SilentRenewView from '@/views/SilentRenewView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
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
  ],
});

export default router;
