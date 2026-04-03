<script setup lang="ts">
import { useDeleteUser } from '../composables/useDeleteUser';
import type { AdminUser } from '../models/admin-api.domain';

const props = defineProps<{
  open: boolean;
  user: AdminUser | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  deleted: [];
}>();

const handleSuccess = () => {
  emit('deleted');
  emit('update:open', false);
};

const { isDeleting, apiError, confirm, close, open: openDelete } = useDeleteUser(handleSuccess);

watch(
  () => props.user,
  (user) => {
    if (user) openDelete(user);
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
          <div class="mb-x-lg gap-md flex items-center">
            <div
              class="bg-error/10 text-error flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-full"
            >
              <Icon
                name="material-symbols:delete-outline"
                size="2rem"
              />
            </div>
            <div>
              <DialogTitle class="text-heading-sm text-on-surface font-semibold">
                {{ $t('admin.deleteUser.title') }}
              </DialogTitle>
              <p
                v-if="user"
                class="text-body-sm text-on-surface-dim mt-xs"
              >
                {{ $t('admin.deleteUser.confirm', { name: `${user.firstName} ${user.lastName}` }) }}
              </p>
            </div>
          </div>

          <div
            v-if="apiError"
            class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-sm border"
            role="alert"
          >
            {{ apiError }}
          </div>

          <div class="gap-md flex justify-end">
            <DialogClose as-child>
              <AppButton
                variant="secondary"
                :disabled="isDeleting"
              >
                {{ $t('admin.actions.cancel') }}
              </AppButton>
            </DialogClose>
            <AppButton
              variant="destructive"
              :loading="isDeleting"
              @click="confirm"
            >
              {{ $t('admin.deleteUser.submit') }}
            </AppButton>
          </div>
        </AppCard>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
