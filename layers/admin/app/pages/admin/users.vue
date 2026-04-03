<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { AppSelectOption } from '#layers/neuraflow-core-layer/app/components/app-select/index';

import { useAdminUsers } from '../../composables/useAdminUsers';
import type { AdminUser } from '../../models/admin-api.domain';

// definePageMeta({
//   requiredPermissions: ['VIEW_ADMIN_PANEL'],
// });

const { users, isLoading, error, fetchUsers, availableRoles } = useAdminUsers();

const isCreateOpen = ref(false);
const isEditRoleOpen = ref(false);
const isDeleteOpen = ref(false);
const selectedUser = ref<AdminUser | null>(null);

const openEditRole = (user: AdminUser) => {
  selectedUser.value = user;
  isEditRoleOpen.value = true;
};

const openDelete = (user: AdminUser) => {
  selectedUser.value = user;
  isDeleteOpen.value = true;
};

const roleOptions = computed<AppSelectOption[]>(() =>
  availableRoles.value.map((role) => ({
    label: role.name,
    value: role.id,
  })),
);
</script>

<template>
  <div class="p-x-lg mx-auto max-w-[120rem]">
    <div class="mb-x-lg flex items-center justify-between">
      <div>
        <h1 class="text-heading-lg text-on-surface font-semibold">
          {{ $t('admin.users.title') }}
        </h1>
        <p class="text-body-md text-on-surface-dim mt-xs">
          {{ $t('admin.users.subtitle', { count: users.length }) }}
        </p>
      </div>
      <AppButton @click="isCreateOpen = true">
        <Icon
          name="material-symbols:add"
          size="1.6rem"
          class="mr-xs"
        />
        {{ $t('admin.actions.createUser') }}
      </AppButton>
    </div>

    <div
      v-if="error"
      class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-sm border"
      role="alert"
    >
      {{ error }}
      <AppButton
        variant="ghost"
        size="sm"
        class="ml-sm"
        @click="fetchUsers"
      >
        {{ $t('admin.actions.retry') }}
      </AppButton>
    </div>

    <AppCard border>
      <AdminUsersTable
        :users="users"
        :is-loading="isLoading"
        @edit-role="openEditRole"
        @delete-user="openDelete"
      />
    </AppCard>

    <CreateUserModal
      v-model:open="isCreateOpen"
      :role-options="roleOptions"
      @created="fetchUsers"
    />

    <EditRoleModal
      v-model:open="isEditRoleOpen"
      :user="selectedUser"
      :role-options="roleOptions"
      @updated="fetchUsers"
    />

    <DeleteUserModal
      v-model:open="isDeleteOpen"
      :user="selectedUser"
      @deleted="fetchUsers"
    />
  </div>
</template>
