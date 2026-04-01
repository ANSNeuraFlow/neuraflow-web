<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  title: 'auth.welcome.title',
});
</script>

<template>
  <div class="flex flex-1 flex-col">
    <p class="text-heading-lg text-on-surface">
      {{ $t('auth.welcome.title') }}
    </p>

    <BrandLogo />
  </div>
</template>
