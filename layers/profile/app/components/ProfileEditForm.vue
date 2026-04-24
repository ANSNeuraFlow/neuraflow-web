<script setup lang="ts">
import { useUpdateProfile } from '../composables/useUpdateProfile';
import type { UserProfile } from '../models/profile.domain';

const props = defineProps<{
  profile: UserProfile;
}>();

const emit = defineEmits<{
  updated: [profile: UserProfile];
}>();

const {
  firstName,
  firstNameAttrs,
  lastName,
  lastNameAttrs,
  bio,
  bioAttrs,
  phoneNumber,
  phoneNumberAttrs,
  dateOfBirth,
  dateOfBirthAttrs,
  errors,
  isSubmitting,
  apiError,
  isSuccess,
  prefill,
  onSubmit,
} = useUpdateProfile((updated) => emit('updated', updated));

watch(
  () => props.profile,
  (p) => prefill(p),
  { immediate: true },
);
</script>

<template>
  <section class="glass-card p-md sm:p-x-lg">
    <div class="mb-x-lg">
      <h2 class="text-heading-md text-on-surface font-semibold">
        {{ $t('profile.edit.title') }}
      </h2>
      <p class="text-body-sm mt-xx-sm text-on-surface-dim">
        {{ $t('profile.edit.subtitle') }}
      </p>
    </div>

    <form
      class="gap-md grid grid-cols-1 sm:grid-cols-2"
      @submit="onSubmit"
    >
      <AppFormField
        :label="$t('profile.edit.firstName')"
        :error="errors.firstName"
      >
        <AppInput
          v-model="firstName"
          v-bind="firstNameAttrs"
          :placeholder="$t('profile.edit.firstNamePlaceholder')"
          type="text"
          autocomplete="given-name"
        />
      </AppFormField>

      <AppFormField
        :label="$t('profile.edit.lastName')"
        :error="errors.lastName"
      >
        <AppInput
          v-model="lastName"
          v-bind="lastNameAttrs"
          :placeholder="$t('profile.edit.lastNamePlaceholder')"
          type="text"
          autocomplete="family-name"
        />
      </AppFormField>

      <AppFormField
        :label="$t('profile.edit.phoneNumber')"
        :error="errors.phoneNumber"
        class="sm:col-span-1"
      >
        <AppInput
          v-model="phoneNumber"
          v-bind="phoneNumberAttrs"
          :placeholder="$t('profile.edit.phoneNumberPlaceholder')"
          type="tel"
          autocomplete="tel"
        />
      </AppFormField>

      <AppFormField
        :label="$t('profile.edit.dateOfBirth')"
        :error="errors.dateOfBirth"
        class="sm:col-span-1"
      >
        <AppInput
          v-model="dateOfBirth"
          v-bind="dateOfBirthAttrs"
          placeholder="YYYY-MM-DD"
          type="date"
        />
      </AppFormField>

      <AppFormField
        :label="$t('profile.edit.bio')"
        :error="errors.bio"
        class="sm:col-span-2"
      >
        <textarea
          v-model="bio"
          v-bind="bioAttrs"
          :placeholder="$t('profile.edit.bioPlaceholder')"
          rows="4"
          class="bg-surface-container text-body-sm text-on-surface placeholder:text-on-surface-dim border-on-surface/10 focus:border-accent/50 focus:ring-accent/20 px-md py-sm w-full resize-none rounded-md border transition-colors focus:outline-none focus:ring-2"
        />
      </AppFormField>

      <div class="sm:col-span-2">
        <Transition name="fade-msg">
          <div
            v-if="apiError"
            class="mb-md border-error/30 bg-error/10 p-sm text-body-sm text-error rounded-lg border"
            role="alert"
          >
            {{ apiError }}
          </div>
          <div
            v-else-if="isSuccess"
            class="mb-md border-success/30 bg-success/10 p-sm text-body-sm text-success gap-sm flex items-center rounded-lg border"
            role="status"
          >
            <Icon
              name="material-symbols:check-circle"
              size="1.6rem"
            />
            {{ $t('profile.edit.saveSuccess') }}
          </div>
        </Transition>

        <AppButton
          type="submit"
          :loading="isSubmitting"
        >
          <Icon
            name="material-symbols:save"
            size="1.6rem"
          />
          {{ $t('profile.edit.save') }}
        </AppButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.fade-msg-enter-active,
.fade-msg-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-msg-enter-from,
.fade-msg-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
