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

// Synchronizuj user z composable gdy prop się zmienia
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
      <DialogOverlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
      <DialogContent
        class="bg-surface fixed left-1/2 top-1/2 z-50 w-full max-w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-md shadow-xl"
      >
        <AppCard
          padding="xl"
          class="w-full"
        >
          <div class="mb-x-lg flex items-center justify-between">
            <div>
              <DialogTitle class="text-heading-sm text-on-surface font-semibold">
                {{ $t('admin.editRole.title') }}
              </DialogTitle>
              <p
                v-if="user"
                class="text-body-sm text-on-surface-dim mt-xs"
              >
                {{ user.firstName }} {{ user.lastName }} · {{ user.email }}
              </p>
            </div>
            <DialogClose as-child>
              <AppButton
                variant="ghost"
                size="sm"
              >
                <Icon
                  name="material-symbols:close"
                  size="2rem"
                />
              </AppButton>
            </DialogClose>
          </div>

          <div
            v-if="apiError"
            class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-sm border"
            role="alert"
          >
            {{ apiError }}
          </div>

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

            <div class="mt-x-lg gap-md flex justify-end">
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
        </AppCard>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
