<script setup lang="ts">
definePageMeta({
  title: 'auth.login.title',
  layout: false,
});
</script>

<template>
  <div
    class="bg-surface p-md text-on-surface selection:bg-on-surface/10 relative flex min-h-screen items-center justify-center overflow-hidden transition-colors duration-500"
  >
    <div
      class="noise-overlay"
      aria-hidden="true"
    />

    <div
      class="pointer-events-none absolute inset-0 bg-hero-pattern opacity-50"
      aria-hidden="true"
    />

    <div
      class="bg-info/5 dark:bg-info/10 pointer-events-none absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl"
      aria-hidden="true"
    />
    <div
      class="bg-accent/5 dark:bg-accent/10 pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full blur-3xl"
      aria-hidden="true"
    />

    <div class="relative z-10 w-full max-w-[44rem]">
      <LoginForm />
    </div>
  </div>
</template>
