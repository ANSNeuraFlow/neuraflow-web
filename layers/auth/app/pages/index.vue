<script setup lang="ts">
definePageMeta({ title: 'NeuraFlow' });
</script>

<template>
  <div class="bg-surface flex min-h-screen items-center justify-center">
    <div class="text-center">
      <BrandLogo
        size="large"
        class="mb-xx-lg mx-auto"
      />
      <h1 class="text-heading-x-lg text-on-surface mb-x-lg font-semibold">NeuraFlow</h1>
      <div class="gap-md flex justify-center">
        <NuxtLink :to="$localePath('/login')">
          <AppButton
            variant="primary"
            size="lg"
            >Zaloguj się</AppButton
          >
        </NuxtLink>
        <NuxtLink :to="$localePath('/register')">
          <AppButton
            variant="secondary"
            size="lg"
            >Zarejestruj się</AppButton
          >
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
