<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { AppSelectOption } from '#layers/neuraflow-core-layer/app/components/app-select/index';

import { useAdminUsers } from '../../composables/useAdminUsers';
import type { AdminUser } from '../../models/admin-api.domain';

definePageMeta({
  layout: 'admin',
  requiredPermissions: ['VIEW_ADMIN_PANEL'],
});

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
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <div class="gap-sm flex flex-wrap items-start justify-between">
        <div>
          <p class="text-body-x-sm mb-xx-sm font-semibold uppercase tracking-wider text-neural-400">
            {{ $t('admin.users.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ $t('admin.users.title') }}
          </h1>
          <p class="text-body-md mt-xx-sm text-on-surface-dim">
            {{ $t('admin.users.subtitle', { count: users.length }) }}
          </p>
        </div>
        <button
          class="gap-x-sm px-x-lg py-sm text-body-sm duration-short inline-flex items-center rounded-lg bg-neural-600 font-semibold text-white transition-colors hover:bg-neural-500 focus-visible:outline-none"
          @click="isCreateOpen = true"
        >
          <Icon
            name="material-symbols:add"
            size="1.6rem"
          />
          {{ $t('admin.actions.createUser') }}
        </button>
      </div>
    </section>

    <div class="mb-x-lg flex items-center justify-between">
      <div>
        <h2 class="text-heading-md text-on-surface font-semibold">
          {{ $t('admin.users.tableTitle') }}
        </h2>
        <p class="text-body-sm mt-xx-sm text-on-surface-dim">
          {{ $t('admin.users.tableSubtitle') }}
        </p>
      </div>
    </div>

    <div
      v-if="error"
      class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
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

    <AppCard
      border
      class="border-on-surface/10 bg-surface/60 backdrop-blur-xl"
    >
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
