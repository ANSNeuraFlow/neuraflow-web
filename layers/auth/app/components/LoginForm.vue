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
        class="mb-x-lg mx-auto"
      />
      <h1 class="text-heading-md text-on-surface font-semibold">
        {{ $t('auth.login.title') }}
      </h1>
    </div>
    <div
      v-if="justRegistered"
      class="mb-x-lg border-success/30 bg-success/10 p-md text-body-sm text-success rounded-sm border"
    >
      {{ $t('auth.login.registrationSuccess') }}
    </div>
    <div
      v-if="passwordChangeEmail"
      class="mb-x-lg border-warning/30 bg-warning/10 p-md text-body-sm text-warning rounded-sm border"
    >
      {{ $t('auth.login.passwordChangeRequired') }}
    </div>

    <div
      v-if="apiError"
      class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-sm border"
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

      <AppButton
        type="submit"
        size="full"
        :loading="isSubmitting"
      >
        {{ $t('auth.login.submit') }}
      </AppButton>
    </form>

    <p class="mt-x-lg text-body-sm text-on-surface-dim text-center">
      {{ $t('auth.login.noAccount') }}
      <NuxtLink
        :to="localePath('/register')"
        class="text-accent duration-short hover:text-accent/80 transition-colors"
      >
        {{ $t('auth.login.registerLink') }}
      </NuxtLink>
    </p>
  </div>
</template>
