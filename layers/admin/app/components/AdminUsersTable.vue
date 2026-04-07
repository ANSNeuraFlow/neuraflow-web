<script setup lang="ts">
import type { AdminUser } from '../models/admin-api.domain';

defineProps<{
  users: AdminUser[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  editRole: [user: AdminUser];
  deleteUser: [user: AdminUser];
}>();

const { locale } = useI18n();

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getRoleBadgeClass = (role: string | null) => {
  if (!role) return 'bg-on-surface/10 text-on-surface-dim';
  if (role === 'ADMIN') return 'bg-accent/10 text-accent';
  return 'bg-success/10 text-success';
};
</script>

<template>
  <div class="w-full overflow-x-auto">
    <div
      v-if="isLoading"
      class="py-xx-lg flex items-center justify-center"
    >
      <Icon
        name="material-symbols:progress-activity"
        size="2.4rem"
        class="text-accent animate-spin"
      />
    </div>

    <table
      v-else
      class="w-full border-separate border-spacing-0"
    >
      <thead>
        <tr class="text-body-sm text-on-surface-dim text-left">
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">{{ $t('admin.table.name') }}</th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">{{ $t('admin.table.email') }}</th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">{{ $t('admin.table.role') }}</th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">{{ $t('admin.table.status') }}</th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">{{ $t('admin.table.createdAt') }}</th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">{{ $t('admin.table.actions') }}</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
          class="duration-short hover:bg-on-surface/[0.04] transition-colors"
        >
          <td class="border-on-surface/[0.06] px-md py-sm text-body-md text-on-surface border-b">
            {{ user.firstName }} {{ user.lastName }}
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm text-body-md text-on-surface border-b">
            {{ user.email }}
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm border-b">
            <span
              :class="[
                'px-sm py-x-tiny text-body-x-sm inline-flex items-center rounded-full font-medium',
                getRoleBadgeClass(user.role),
              ]"
            >
              {{ user.role ?? $t('admin.table.noRole') }}
            </span>
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm border-b">
            <span
              v-if="user.isPasswordChangeRequired"
              class="gap-xs bg-warning/10 px-sm py-x-tiny text-body-x-sm text-warning inline-flex items-center rounded-full font-medium"
            >
              <Icon
                name="material-symbols:lock-outline"
                size="1.2rem"
              />
              {{ $t('admin.table.passwordChangeRequired') }}
            </span>
            <span
              v-else-if="user.isVerified"
              class="gap-xs bg-success/10 px-sm py-x-tiny text-body-x-sm text-success inline-flex items-center rounded-full font-medium"
            >
              <Icon
                name="material-symbols:check-circle-outline"
                size="1.2rem"
              />
              {{ $t('admin.table.active') }}
            </span>
            <span
              v-else
              class="gap-xs bg-on-surface/10 px-sm py-x-tiny text-body-x-sm text-on-surface-dim inline-flex items-center rounded-full font-medium"
            >
              {{ $t('admin.table.unverified') }}
            </span>
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b">
            {{ formatDate(user.createdAt) }}
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm border-b">
            <div class="gap-sm flex items-center">
              <AppButton
                variant="ghost"
                size="sm"
                :title="$t('admin.actions.editRole')"
                @click="emit('editRole', user)"
              >
                <Icon
                  name="material-symbols:manage-accounts-outline"
                  size="1.6rem"
                />
              </AppButton>
              <AppButton
                variant="ghost"
                size="sm"
                :title="$t('admin.actions.delete')"
                class="text-error hover:bg-error/10"
                @click="emit('deleteUser', user)"
              >
                <Icon
                  name="material-symbols:delete-outline"
                  size="1.6rem"
                />
              </AppButton>
            </div>
          </td>
        </tr>

        <tr v-if="users.length === 0 && !isLoading">
          <td
            colspan="6"
            class="py-xx-lg text-body-md text-on-surface-dim text-center"
          >
            {{ $t('admin.table.empty') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
