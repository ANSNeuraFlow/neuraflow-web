<script setup lang="ts">
import type { AppSelectOption } from '#layers/neuraflow-core-layer/app/components/app-select/index';

import { useCreateEegSession } from '../composables/useCreateEegSession';
import { EEG_PROTOCOL_IDS } from '../constants/eeg-protocols.const';

defineProps<{
  open: boolean;
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
  sessionName,
  sessionNameAttrs,
  protocolName,
  protocolNameAttrs,
  errors,
  isSubmitting,
  apiError,
  onSubmit,
  resetForm,
} = useCreateEegSession(handleSuccess);

const { t } = useI18n();
const protocolOptions = computed<AppSelectOption[]>(() =>
  EEG_PROTOCOL_IDS.map((id) => ({
    value: id,
    label: t(`eegSessions.protocols.${id}`),
  })),
);

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
        class="bg-surface/80 dark:bg-surface/30 !border-on-surface/10 fixed left-1/2 top-1/2 z-50 w-full max-w-[54rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-[0_0_80px_rgba(0,0,0,0.4)] outline-none backdrop-blur-3xl"
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
          <div class="mb-x-lg gap-md flex items-start justify-between">
            <div>
              <p class="mb-xx-sm text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
                {{ $t('eegSessions.kicker') }}
              </p>
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                {{ $t('eegSessions.createSession.title') }}
              </DialogTitle>
            </div>
            <DialogClose as-child>
              <button
                class="mt-xx-sm p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface rounded-lg transition-colors"
                :aria-label="$t('eegSessions.actions.cancel')"
              >
                <Icon
                  name="material-symbols:close"
                  size="2rem"
                />
              </button>
            </DialogClose>
          </div>

          <div
            v-if="apiError"
            class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
            role="alert"
          >
            {{ apiError }}
          </div>

          <form
            class="gap-x-lg flex flex-col"
            novalidate
            @submit="onSubmit"
          >
            <AppFormField
              :label="$t('eegSessions.fields.sessionName')"
              :error="errors.sessionName ? $t(errors.sessionName) : undefined"
              html-for="session-name-input"
              required
            >
              <AppInput
                id="session-name-input"
                v-model="sessionName"
                v-bind="sessionNameAttrs"
                :placeholder="$t('eegSessions.placeholders.sessionName')"
                :error="!!errors.sessionName"
              />
            </AppFormField>

            <AppFormField
              :label="$t('eegSessions.table.protocol')"
              :error="errors.protocolName ? $t(errors.protocolName) : undefined"
              html-for="session-protocol-select"
              required
            >
              <AppSelect
                id="session-protocol-select"
                v-model="protocolName"
                v-bind="protocolNameAttrs"
                :options="protocolOptions"
                :placeholder="$t('eegSessions.placeholders.protocol')"
                :error="!!errors.protocolName"
              />
            </AppFormField>

            <p class="text-body-sm text-on-surface-dim">
              {{ $t('eegSessions.createSession.note') }}
            </p>

            <div class="gap-md border-on-surface/10 pt-x-lg flex justify-end border-t">
              <DialogClose as-child>
                <AppButton
                  variant="secondary"
                  :disabled="isSubmitting"
                >
                  {{ $t('eegSessions.actions.cancel') }}
                </AppButton>
              </DialogClose>
              <AppButton
                type="submit"
                :loading="isSubmitting"
              >
                {{ $t('eegSessions.createSession.submit') }}
              </AppButton>
            </div>
          </form>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
