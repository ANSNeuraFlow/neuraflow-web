<script setup lang="ts">
const localePath = useLocalePath();
</script>

<template>
  <div
    class="bg-surface p-md text-on-surface sm:p-x-lg relative flex min-h-screen flex-col items-center justify-center overflow-hidden font-sans"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-hero-pattern"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 bg-neural-glow"
      aria-hidden="true"
    />
    <div
      class="noise-overlay"
      aria-hidden="true"
    />
    <NuxtLink
      :to="localePath('/')"
      class="mb-x-lg text-body-sm text-on-surface-dim duration-short hover:text-on-surface relative z-20 transition-colors"
    >
      ← {{ $t('auth.layout.backToHome') }}
    </NuxtLink>
    <div class="relative z-20 w-full max-w-auth-panel sm:max-w-auth-panel-wide">
      <slot />
    </div>
  </div>
</template>
