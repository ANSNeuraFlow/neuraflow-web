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
    <section class="glass-card mb-x-lg p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-info/5 pointer-events-none absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div class="gap-sm relative z-10 flex flex-wrap items-center justify-between">
        <div>
          <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
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
          class="gap-x-sm px-x-lg py-sm text-body-sm duration-short bg-on-surface text-surface hover:bg-on-surface/90 inline-flex items-center rounded-lg focus-visible:outline-none"
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

    <div class="glass-card overflow-hidden">
      <AdminUsersTable
        :users="users"
        :is-loading="isLoading"
        @edit-role="openEditRole"
        @delete-user="openDelete"
      />
    </div>

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
