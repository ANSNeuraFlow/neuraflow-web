<script setup lang="ts">
import type { AppSelectOption } from '#layers/neuraflow-core-layer/app/components/app-select/index';

import { useUpdateUserRole } from '../composables/useUpdateUserRole';
import type { AdminUser } from '../models/admin-api.domain';

const props = defineProps<{
  open: boolean;
  user: AdminUser | null;
  roleOptions: AppSelectOption[];
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  updated: [];
}>();

const handleSuccess = () => {
  emit('updated');
  emit('update:open', false);
};

const {
  roleId,
  roleIdAttrs,
  errors,
  isSubmitting,
  apiError,
  onSubmit,
  open: openEdit,
  close,
} = useUpdateUserRole(handleSuccess);

watch(
  () => props.user,
  (user) => {
    if (user) openEdit(user);
  },
);

const handleOpenChange = (val: boolean) => {
  if (!val) close();
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
        class="bg-surface/80 dark:bg-surface/30 !border-on-surface/10 fixed left-1/2 top-1/2 z-50 w-full max-w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border shadow-[0_0_80px_rgba(0,0,0,0.4)] outline-none backdrop-blur-3xl"
      >
        <div
          class="bg-info/5 dark:bg-info/10 pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full blur-3xl transition-colors duration-500"
          aria-hidden="true"
        />
        <div
          class="bg-accent/5 dark:bg-accent/10 pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full blur-3xl transition-colors duration-500"
          aria-hidden="true"
        />
        <div
          class="noise-overlay"
          aria-hidden="true"
        />
        <div class="p-x-lg sm:p-xx-lg relative z-10">
          <!-- Header -->
          <div class="mb-x-lg gap-md flex items-start justify-between">
            <div>
              <p class="mb-xx-sm text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
                {{ $t('admin.navigation.users') }}
              </p>
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                {{ $t('admin.editRole.title') }}
              </DialogTitle>
              <p
                v-if="user"
                class="mt-xx-sm text-body-sm text-on-surface-dim"
              >
                {{ user.firstName }} {{ user.lastName }}
                <span class="mx-xs opacity-50">·</span>
                {{ user.email }}
              </p>
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
            novalidate
            @submit="onSubmit"
          >
            <AppFormField
              :label="$t('admin.fields.role')"
              :error="errors.roleId ? $t(errors.roleId) : undefined"
              html-for="edit-role-select"
              required
            >
              <AppSelect
                id="edit-role-select"
                v-model="roleId"
                v-bind="roleIdAttrs"
                :options="roleOptions"
                :placeholder="$t('admin.placeholders.role')"
                :error="!!errors.roleId"
              />
            </AppFormField>

            <div class="mt-x-lg gap-md border-on-surface/10 pt-x-lg flex justify-end border-t">
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
                {{ $t('admin.editRole.submit') }}
              </AppButton>
            </div>
          </form>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
