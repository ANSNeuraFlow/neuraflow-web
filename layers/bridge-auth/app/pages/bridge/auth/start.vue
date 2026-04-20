<script setup lang="ts">
import { useBridgeAuthFlow } from '../../../composables/useBridgeAuthFlow';

definePageMeta({
  title: 'bridgeAuth.title',
  layout: false,
  middleware: ['bridge-auth-required'],
});

const { t } = useI18n();
const { status, errorKey, errorMessage, retry, start } = useBridgeAuthFlow();

onMounted(() => {
  void start();
});

const translatedError = computed(() => (errorKey.value ? t(errorKey.value) : null));
</script>

<template>
  <div
    class="bg-surface p-md text-on-surface relative flex min-h-screen items-center justify-center overflow-hidden transition-colors duration-500"
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
      <div
        v-if="status === 'validating' || status === 'loading' || status === 'success'"
        class="glass-card p-x-lg sm:p-xx-lg text-center"
      >
        <div class="mb-md flex justify-center">
          <div
            class="border-on-surface/20 border-t-on-surface h-12 w-12 animate-spin rounded-full border-2"
            aria-hidden="true"
          />
        </div>

        <h1 class="text-heading-md text-on-surface font-display font-bold">
          {{ $t('bridgeAuth.connecting.title') }}
        </h1>
        <p class="text-body-sm mt-sm text-on-surface-dim">
          {{ $t('bridgeAuth.connecting.subtitle') }}
        </p>
      </div>

      <div
        v-else-if="status === 'invalid_query'"
        class="glass-card p-x-lg sm:p-xx-lg text-center"
      >
        <div class="mb-md flex justify-center">
          <Icon
            name="material-symbols:error-outline"
            size="3.2rem"
            class="text-error"
            aria-hidden="true"
          />
        </div>

        <h1 class="text-heading-md text-error font-display font-bold">
          {{ $t('bridgeAuth.errors.invalidQueryTitle') }}
        </h1>
        <p class="text-body-sm mt-sm text-on-surface-dim">
          {{ translatedError ?? $t('bridgeAuth.errors.invalidQuery') }}
        </p>
        <p class="text-body-x-sm mt-md text-on-surface-dim">
          {{ $t('bridgeAuth.errors.invalidQueryHint') }}
        </p>
      </div>

      <div
        v-else
        class="glass-card p-x-lg sm:p-xx-lg text-center"
      >
        <div class="mb-md flex justify-center">
          <Icon
            name="material-symbols:warning-outline"
            size="3.2rem"
            class="text-error"
            aria-hidden="true"
          />
        </div>

        <h1 class="text-heading-md text-error font-display font-bold">
          {{ $t('bridgeAuth.errors.backendFailureTitle') }}
        </h1>
        <p class="text-body-sm mt-sm text-on-surface-dim">
          {{ translatedError ?? $t('bridgeAuth.errors.backendFailure') }}
        </p>
        <p
          v-if="errorMessage"
          class="text-body-x-sm mt-sm text-on-surface-dim"
        >
          {{ errorMessage }}
        </p>

        <div class="mt-lg flex justify-center">
          <button
            type="button"
            class="bg-on-surface text-surface px-lg py-sm text-body-sm hover:bg-on-surface/90 rounded-md font-semibold transition-colors"
            @click="retry"
          >
            {{ $t('bridgeAuth.actions.retry') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
