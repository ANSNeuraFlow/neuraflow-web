<script setup lang="ts">
const { t } = useI18n();

const emailValue = ref('');
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const isEmailInvalid = ref(false);

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleEmailInput = (): void => {
  if (isEmailInvalid.value) {
    isEmailInvalid.value = !validateEmail(emailValue.value);
  }
};

const handleFormSubmit = async (): Promise<void> => {
  if (!validateEmail(emailValue.value)) {
    isEmailInvalid.value = true;
    return;
  }

  isEmailInvalid.value = false;
  isSubmitting.value = true;

  await new Promise<void>((resolve) => setTimeout(resolve, 1200));

  isSubmitting.value = false;
  isSubmitted.value = true;
  emailValue.value = '';

  setTimeout(() => {
    isSubmitted.value = false;
  }, 5000);
};
</script>

<template>
  <section
    id="cta"
    class="py-huge sm:py-x-huge relative overflow-hidden"
    aria-label="Join the beta"
  >
    <!-- Glow background -->
    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-neural-950/60 via-dark-900 to-dark-900" />
      <div
        class="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neural-600/10 blur-3xl"
      />
    </div>

    <div class="px-md sm:px-x-lg lg:px-xx-lg relative mx-auto w-full max-w-landing-card text-center">
      <!-- Badge -->
      <div class="mb-xx-lg flex justify-center">
        <span class="section-label">
          <span
            class="h-2 w-2 animate-pulse rounded-full bg-green-400"
            aria-hidden="true"
          />
          {{ t('landing.cta.badge') }}
        </span>
      </div>

      <!-- Title -->
      <h2 class="mb-xx-lg text-heading-md sm:text-heading-lg lg:text-heading-x-lg font-display font-bold text-white">
        {{ t('landing.cta.title') }}
        <span class="gradient-text"> {{ t('landing.cta.titleAccent') }}</span>
        {{ t('landing.cta.titleSuffix') }}
      </h2>

      <!-- Description -->
      <p class="mb-xxx-lg text-body-md sm:text-body-lg mx-auto max-w-landing-copy leading-relaxed text-slate-400">
        {{ t('landing.cta.description') }}
      </p>

      <!-- Email form -->
      <form
        class="mb-xx-lg gap-md mx-auto flex w-full max-w-landing-form flex-col sm:flex-row"
        :aria-label="t('landing.cta.badge')"
        @submit.prevent="handleFormSubmit"
      >
        <div class="flex-1">
          <label
            for="cta-email"
            class="sr-only"
            >{{ t('landing.cta.emailLabel') }}</label
          >
          <input
            id="cta-email"
            v-model="emailValue"
            type="email"
            name="email"
            autocomplete="email"
            :placeholder="t('landing.cta.emailPlaceholder')"
            required
            aria-required="true"
            :aria-invalid="isEmailInvalid"
            aria-describedby="cta-email-error"
            class="px-md py-md text-body-md duration-short w-full rounded-lg border border-white/[0.10] bg-white/[0.04] text-white placeholder-slate-500 transition-colors focus:border-neural-500 focus:outline-none focus:ring-2 focus:ring-neural-500/20"
            :class="isEmailInvalid ? 'border-red-500/60' : ''"
            @input="handleEmailInput"
          />
          <p
            v-if="isEmailInvalid"
            id="cta-email-error"
            class="mt-xx-sm text-body-x-sm text-left text-red-400"
            role="alert"
          >
            {{ t('landing.cta.emailError') }}
          </p>
        </div>
        <button
          type="submit"
          class="btn-primary sm:flex-shrink-0"
          :aria-label="t('landing.cta.submitLabel')"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">{{ t('landing.cta.submitLabel') }}</span>
          <span
            v-else
            class="flex items-center gap-2"
          >
            <svg
              class="h-md w-md animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ t('landing.cta.submittingLabel') }}
          </span>
        </button>
      </form>

      <!-- Success message -->
      <Transition name="fade">
        <div
          v-if="isSubmitted"
          class="mb-xx-lg gap-sm px-md py-md text-body-sm flex items-center justify-center rounded-lg border border-green-500/30 bg-green-950/60 text-green-400"
          role="status"
          aria-live="polite"
        >
          <svg
            class="h-md w-md flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{ t('landing.cta.successMessage') }}
        </div>
      </Transition>

      <!-- Trust signals -->
      <div class="gap-xx-lg text-body-x-sm flex flex-wrap items-center justify-center text-slate-600">
        <div class="gap-xx-sm flex items-center">
          <svg
            class="h-md w-md text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          {{ t('landing.cta.trust1') }}
        </div>
        <div class="gap-xx-sm flex items-center">
          <svg
            class="h-md w-md text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          {{ t('landing.cta.trust2') }}
        </div>
        <div class="gap-xx-sm flex items-center">
          <svg
            class="h-md w-md text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          {{ t('landing.cta.trust3') }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
