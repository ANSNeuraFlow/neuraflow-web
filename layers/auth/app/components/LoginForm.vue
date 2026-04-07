<script setup lang="ts">
import { useLogin } from '../composables/useLogin';

const { email, emailAttrs, password, passwordAttrs, errors, isSubmitting, apiError, passwordChangeEmail, onSubmit } =
  useLogin();

const localePath = useLocalePath();
const route = useRoute();
const justRegistered = computed(() => route.query.registered === 'true');
</script>

<template>
  <div class="glass-card p-xx-lg sm:p-xxx-lg w-full sm:mx-auto">
    <div class="mb-xx-lg text-center">
      <BrandLogo
        size="default"
        class="mb-x-lg mx-auto opacity-95"
      />
      <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
        {{ $t('auth.login.title') }}
      </h1>
    </div>
    <div
      v-if="justRegistered"
      class="mb-x-lg border-success/40 bg-success/10 p-md text-body-sm text-success rounded-lg border"
    >
      {{ $t('auth.login.registrationSuccess') }}
    </div>
    <div
      v-if="passwordChangeEmail"
      class="mb-x-lg border-warning/40 bg-warning/10 p-md text-body-sm text-warning rounded-lg border"
    >
      {{ $t('auth.login.passwordChangeRequired') }}
    </div>

    <div
      v-if="apiError"
      class="mb-x-lg border-error/40 bg-error/10 p-md text-body-sm text-error rounded-lg border"
      role="alert"
    >
      {{ apiError }}
    </div>

    <form
      class="gap-x-lg flex flex-col"
      novalidate
      @submit="onSubmit"
    >
      <AppFormField
        :label="$t('auth.fields.email')"
        :error="errors.email ? $t(errors.email) : undefined"
        html-for="login-email"
        required
      >
        <AppInput
          id="login-email"
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          :placeholder="$t('auth.placeholders.email')"
          :error="!!errors.email"
          autocomplete="email"
        />
      </AppFormField>

      <AppFormField
        :label="$t('auth.fields.password')"
        :error="errors.password ? $t(errors.password) : undefined"
        html-for="login-password"
        required
      >
        <AppPasswordInput
          id="login-password"
          v-model="password"
          v-bind="passwordAttrs"
          :placeholder="$t('auth.placeholders.password')"
          :error="!!errors.password"
          autocomplete="current-password"
        />
      </AppFormField>

      <button
        type="submit"
        class="btn-primary w-full"
        :disabled="isSubmitting"
        :aria-busy="isSubmitting"
      >
        <Icon
          v-if="isSubmitting"
          name="material-symbols:progress-activity"
          class="h-x-lg w-x-lg shrink-0 animate-spin"
          aria-hidden="true"
        />
        <span v-else>{{ $t('auth.login.submit') }}</span>
      </button>
    </form>

    <p class="mt-x-lg text-body-sm text-on-surface-dim text-center">
      {{ $t('auth.login.noAccount') }}
      <NuxtLink
        :to="localePath('/register')"
        class="duration-short font-medium text-neural-400 transition-colors hover:text-cyan-400"
      >
        {{ $t('auth.login.registerLink') }}
      </NuxtLink>
    </p>
  </div>
</template>
