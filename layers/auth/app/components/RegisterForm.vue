<script setup lang="ts">
import { useRegister } from '../composables/useRegister';

const {
  firstName,
  firstNameAttrs,
  lastName,
  lastNameAttrs,
  email,
  emailAttrs,
  password,
  passwordAttrs,
  confirmPassword,
  confirmPasswordAttrs,
  errors,
  isSubmitting,
  apiError,
  onSubmit,
} = useRegister();

const localePath = useLocalePath();
</script>

<template>
  <div class="glass-card p-xx-lg sm:p-xxx-lg w-full sm:mx-auto">
    <div class="mb-xx-lg text-center">
      <BrandLogo
        size="default"
        class="mb-x-lg mx-auto opacity-95"
      />
      <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
        {{ $t('auth.register.title') }}
      </h1>
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
      <div class="gap-x-lg grid grid-cols-1 sm:grid-cols-2">
        <AppFormField
          :label="$t('auth.fields.firstName')"
          :error="errors.firstName ? $t(errors.firstName) : undefined"
          html-for="reg-firstName"
          required
        >
          <AppInput
            id="reg-firstName"
            v-model="firstName"
            v-bind="firstNameAttrs"
            :error="!!errors.firstName"
            autocomplete="given-name"
          />
        </AppFormField>

        <AppFormField
          :label="$t('auth.fields.lastName')"
          :error="errors.lastName ? $t(errors.lastName) : undefined"
          html-for="reg-lastName"
          required
        >
          <AppInput
            id="reg-lastName"
            v-model="lastName"
            v-bind="lastNameAttrs"
            :error="!!errors.lastName"
            autocomplete="family-name"
          />
        </AppFormField>
      </div>

      <AppFormField
        :label="$t('auth.fields.email')"
        :error="errors.email ? $t(errors.email) : undefined"
        html-for="reg-email"
        required
      >
        <AppInput
          id="reg-email"
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
        html-for="reg-password"
        required
      >
        <AppPasswordInput
          id="reg-password"
          v-model="password"
          v-bind="passwordAttrs"
          :error="!!errors.password"
          autocomplete="new-password"
        />
      </AppFormField>

      <AppFormField
        :label="$t('auth.fields.confirmPassword')"
        :error="errors.confirmPassword ? $t(errors.confirmPassword) : undefined"
        html-for="reg-confirm"
        required
      >
        <AppPasswordInput
          id="reg-confirm"
          v-model="confirmPassword"
          v-bind="confirmPasswordAttrs"
          :error="!!errors.confirmPassword"
          autocomplete="new-password"
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
        <span v-else>{{ $t('auth.register.submit') }}</span>
      </button>
    </form>

    <p class="mt-x-lg text-body-sm text-on-surface-dim text-center">
      {{ $t('auth.register.hasAccount') }}
      <NuxtLink
        :to="localePath('/login')"
        class="duration-short font-medium text-neural-400 transition-colors hover:text-cyan-400"
      >
        {{ $t('auth.register.loginLink') }}
      </NuxtLink>
    </p>
  </div>
</template>
