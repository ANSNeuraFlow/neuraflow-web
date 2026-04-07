<script setup lang="ts">
import type { AppSelectOption } from '#layers/neuraflow-core-layer/app/components/app-select/index';

import { useCreateAdminUser } from '../composables/useCreateAdminUser';

defineProps<{
  open: boolean;
  roleOptions: AppSelectOption[];
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  created: [];
}>();

const handleSuccess = () => {
  emit('created');
  emit('update:open', false);
};

const {
  email,
  emailAttrs,
  firstName,
  firstNameAttrs,
  lastName,
  lastNameAttrs,
  temporaryPassword,
  temporaryPasswordAttrs,
  roleId,
  roleIdAttrs,
  errors,
  isSubmitting,
  apiError,
  onSubmit,
  resetForm,
} = useCreateAdminUser(handleSuccess);

const handleOpenChange = (val: boolean) => {
  if (!val) resetForm();
  emit('update:open', val);
};
</script>

<template>
  <DialogRoot
    :open="open"
    @update:open="handleOpenChange"
  >
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <DialogContent
        class="border-on-surface/10 bg-surface fixed left-1/2 top-1/2 z-50 w-full max-w-[54rem] -translate-x-1/2 -translate-y-1/2 rounded-lg border shadow-neural-lg outline-none"
      >
        <div class="p-x-lg sm:p-xx-lg">
          <!-- Header -->
          <div class="mb-x-lg gap-md flex items-start justify-between">
            <div>
              <p class="mb-xx-sm text-body-x-sm font-semibold uppercase tracking-wider text-neural-400">
                {{ $t('admin.navigation.panel') }}
              </p>
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                {{ $t('admin.createUser.title') }}
              </DialogTitle>
            </div>
            <DialogClose as-child>
              <button
                class="mt-xx-sm p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface rounded-lg transition-colors"
                :aria-label="$t('admin.actions.cancel')"
              >
                <Icon
                  name="material-symbols:close"
                  size="2rem"
                />
              </button>
            </DialogClose>
          </div>

          <!-- Error -->
          <div
            v-if="apiError"
            class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
            role="alert"
          >
            {{ apiError }}
          </div>

          <!-- Form -->
          <form
            class="gap-x-lg flex flex-col"
            novalidate
            @submit="onSubmit"
          >
            <div class="gap-x-lg grid grid-cols-1 sm:grid-cols-2">
              <AppFormField
                :label="$t('admin.fields.firstName')"
                :error="errors.firstName ? $t(errors.firstName) : undefined"
                html-for="create-user-first-name"
                required
              >
                <AppInput
                  id="create-user-first-name"
                  v-model="firstName"
                  v-bind="firstNameAttrs"
                  :placeholder="$t('admin.placeholders.firstName')"
                  :error="!!errors.firstName"
                />
              </AppFormField>

              <AppFormField
                :label="$t('admin.fields.lastName')"
                :error="errors.lastName ? $t(errors.lastName) : undefined"
                html-for="create-user-last-name"
                required
              >
                <AppInput
                  id="create-user-last-name"
                  v-model="lastName"
                  v-bind="lastNameAttrs"
                  :placeholder="$t('admin.placeholders.lastName')"
                  :error="!!errors.lastName"
                />
              </AppFormField>
            </div>

            <AppFormField
              :label="$t('admin.fields.email')"
              :error="errors.email ? $t(errors.email) : undefined"
              html-for="create-user-email"
              required
            >
              <AppInput
                id="create-user-email"
                v-model="email"
                v-bind="emailAttrs"
                type="email"
                :placeholder="$t('admin.placeholders.email')"
                :error="!!errors.email"
                autocomplete="off"
              />
            </AppFormField>

            <AppFormField
              :label="$t('admin.fields.temporaryPassword')"
              :error="errors.temporaryPassword ? $t(errors.temporaryPassword) : undefined"
              html-for="create-user-password"
              required
            >
              <AppPasswordInput
                id="create-user-password"
                v-model="temporaryPassword"
                v-bind="temporaryPasswordAttrs"
                :placeholder="$t('admin.placeholders.temporaryPassword')"
                :error="!!errors.temporaryPassword"
                autocomplete="new-password"
              />
            </AppFormField>

            <AppFormField
              :label="$t('admin.fields.role')"
              :error="errors.roleId ? $t(errors.roleId) : undefined"
              html-for="create-user-role"
            >
              <AppSelect
                id="create-user-role"
                v-model="roleId"
                v-bind="roleIdAttrs"
                :options="roleOptions"
                :placeholder="$t('admin.placeholders.roleOptional')"
                :error="!!errors.roleId"
              />
            </AppFormField>

            <p class="text-body-sm text-on-surface-dim">
              {{ $t('admin.createUser.passwordChangeNote') }}
            </p>

            <div class="gap-md border-on-surface/10 pt-x-lg flex justify-end border-t">
              <DialogClose as-child>
                <AppButton
                  variant="secondary"
                  :disabled="isSubmitting"
                >
                  {{ $t('admin.actions.cancel') }}
                </AppButton>
              </DialogClose>
              <AppButton
                type="submit"
                :loading="isSubmitting"
              >
                {{ $t('admin.createUser.submit') }}
              </AppButton>
            </div>
          </form>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
