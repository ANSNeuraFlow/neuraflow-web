<script setup lang="ts">
import type { EegSession, SessionStatus } from '../models/eeg-session.domain';

defineProps<{
  sessions: EegSession[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  stopSession: [session: EegSession];
  deleteSession: [session: EegSession];
}>();

const { locale } = useI18n();

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadgeClass = (status: SessionStatus) => {
  const map: Record<SessionStatus, string> = {
    INITIALIZED: 'bg-info/10 text-info',
    ACTIVE: 'bg-success/10 text-success',
    COMPLETED: 'bg-on-surface/10 text-on-surface-dim',
    FAILED: 'bg-error/10 text-error',
  };
  return map[status];
};

const getStatusIcon = (status: SessionStatus) => {
  const map: Record<SessionStatus, string> = {
    INITIALIZED: 'material-symbols:pending-outline',
    ACTIVE: 'material-symbols:radio-button-checked',
    COMPLETED: 'material-symbols:check-circle-outline',
    FAILED: 'material-symbols:error-outline',
  };
  return map[status];
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
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">
            {{ $t('eegSessions.table.device') }}
          </th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">
            {{ $t('eegSessions.table.protocol') }}
          </th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">
            {{ $t('eegSessions.table.status') }}
          </th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">
            {{ $t('eegSessions.table.createdAt') }}
          </th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">
            {{ $t('eegSessions.table.duration') }}
          </th>
          <th class="border-on-surface/10 px-md py-sm border-b font-medium">
            {{ $t('eegSessions.table.actions') }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="session in sessions"
          :key="session.id"
          class="duration-short hover:bg-on-surface/[0.04] transition-colors"
        >
          <td class="border-on-surface/[0.06] px-md py-sm text-body-md text-on-surface border-b">
            {{ session.deviceName }}
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b">
            {{ session.protocolName }}
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm border-b">
            <span
              :class="[
                'gap-xs px-sm py-x-tiny text-body-x-sm inline-flex items-center rounded-full font-medium',
                getStatusBadgeClass(session.status),
              ]"
            >
              <Icon
                :name="getStatusIcon(session.status)"
                size="1.2rem"
              />
              {{ $t(`eegSessions.status.${session.status}`) }}
            </span>
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b">
            {{ formatDate(session.createdAt) }}
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b">
            <span v-if="session.endedAt && session.startedAt">
              {{ Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000) }}s
            </span>
            <span v-else-if="session.startedAt">{{ $t('eegSessions.table.inProgress') }}</span>
            <span v-else>—</span>
          </td>
          <td class="border-on-surface/[0.06] px-md py-sm border-b">
            <div class="gap-sm flex items-center">
              <AppButton
                v-if="session.status === 'INITIALIZED' || session.status === 'ACTIVE'"
                variant="ghost"
                size="sm"
                :title="$t('eegSessions.actions.stop')"
                class="text-warning hover:bg-warning/10"
                @click="emit('stopSession', session)"
              >
                <Icon
                  name="material-symbols:stop-circle-outline"
                  size="1.6rem"
                />
              </AppButton>
              <AppButton
                variant="ghost"
                size="sm"
                :title="$t('eegSessions.actions.delete')"
                class="text-error hover:bg-error/10"
                :disabled="session.status === 'ACTIVE'"
                @click="emit('deleteSession', session)"
              >
                <Icon
                  name="material-symbols:delete-outline"
                  size="1.6rem"
                />
              </AppButton>
            </div>
          </td>
        </tr>

        <tr v-if="sessions.length === 0 && !isLoading">
          <td
            colspan="6"
            class="py-xx-lg text-body-md text-on-surface-dim text-center"
          >
            {{ $t('eegSessions.table.empty') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
