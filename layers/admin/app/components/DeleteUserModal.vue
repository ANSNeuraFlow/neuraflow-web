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
      <DialogOverlay class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <DialogContent
        class="bg-surface/80 dark:bg-surface/30 !border-on-surface/10 fixed left-1/2 top-1/2 z-50 w-full max-w-[42rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-[0_0_80px_rgba(0,0,0,0.4)] outline-none backdrop-blur-3xl"
      >
        <div
          class="bg-error/5 dark:bg-error/10 pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full blur-3xl transition-colors duration-500"
          aria-hidden="true"
        />
        <div
          class="bg-info/5 dark:bg-info/10 pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full blur-3xl transition-colors duration-500"
          aria-hidden="true"
        />
        <div
          class="noise-overlay"
          aria-hidden="true"
        />
        <div class="p-x-lg sm:p-xx-lg relative z-10">
          <!-- Header -->
          <div class="mb-x-lg gap-md flex items-start">
            <div
              class="bg-error/10 text-error flex h-[4.4rem] w-[4.4rem] shrink-0 items-center justify-center rounded-full"
            >
              <Icon
                name="material-symbols:delete-outline"
                size="2.2rem"
              />
            </div>
            <div class="flex-1">
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                {{ $t('admin.deleteUser.title') }}
              </DialogTitle>
              <p
                v-if="user"
                class="mt-xx-sm text-body-sm text-on-surface-dim"
              >
                {{ $t('admin.deleteUser.confirm', { name: `${user.firstName} ${user.lastName}` }) }}
              </p>
            </div>
            <DialogClose as-child>
              <button
                class="mt-xx-sm p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface shrink-0 rounded-lg transition-colors"
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

          <div class="gap-md border-on-surface/10 pt-x-lg flex justify-end border-t">
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
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
