<template>
  <v-breadcrumbs :items="breadcrumbs" class="px-4 py-2">
    <template v-slot:prepend>
      <v-icon icon="mdi-home" size="small"></v-icon>
    </template>
    <template v-slot:divider>
      <v-icon icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getMicroServiceByPath } from '@/config/microservices.config';

const route = useRoute();
const { t } = useI18n();

const breadcrumbs = computed(() => {
  const items = [
    {
      title: t('nav.dashboard'),
      disabled: false,
      href: '/',
    },
  ];

  // If on microservice route, add microservice name
  const microservice = getMicroServiceByPath(route.path);
  if (microservice) {
    items.push({
      title: t(`nav.${microservice.id}`, microservice.title),
      disabled: true,
      href: microservice.path,
    });
  }

  return items;
});
</script>
