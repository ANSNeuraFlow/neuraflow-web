<script setup lang="ts">
import { useBridgeConnection } from '#layers/bridge-auth/app/composables/useBridgeConnection';

import { useBciController } from '../../../../../app/composables/useBciController';
import type { EegIngressMode } from '../../models/eeg-ingress.domain';

const { t } = useI18n();

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  start: [payload: { name: string; ingressMode: EegIngressMode }];
}>();

const sessionNameInput = ref('');
const sessionNameError = ref('');
const formGateError = ref('');
const ingressMode = ref<EegIngressMode>('neuraflow-bridge');

const bridgeConnection = useBridgeConnection();
const bridgeStreamErrorMessage = computed(() => bridgeConnection.error.value);
const { isConnected: localWsConnected } = useBciController();

watch(
  () => props.open,
  (val) => {
    if (val) {
      sessionNameInput.value = '';
      sessionNameError.value = '';
      formGateError.value = '';
      ingressMode.value = 'neuraflow-bridge';
      void bridgeConnection.fetchStatus();
    }
  },
);

const connectBridge = () => {
  void bridgeConnection.connect();
};

const startBridgeStreaming = () => {
  void bridgeConnection.startStreaming();
};

const isBridgeConnecting = computed(() => bridgeConnection.isConnecting.value);
const isStartingStream = computed(() => bridgeConnection.isStartingStream.value);

const showConnectButton = computed(() => !bridgeConnection.isConnected.value);
const showStreamButton = computed(
  () =>
    bridgeConnection.isConnected.value &&
    (!bridgeConnection.isStreaming.value || !bridgeConnection.streamConnected.value),
);

const submit = () => {
  sessionNameError.value = '';
  formGateError.value = '';
  const name = sessionNameInput.value.trim();
  if (!name) {
    sessionNameError.value = t('machineLearning.attention.session.nameRequired');
    return;
  }
  if (ingressMode.value === 'local-bridge') {
    if (!localWsConnected.value) {
      formGateError.value = t('machineLearning.eegIngress.localWsRequired');
      return;
    }
  } else {
    if (!bridgeConnection.isStreaming.value) {
      formGateError.value = t('machineLearning.bci.session.streamingRequired');
      return;
    }
    if (!bridgeConnection.streamConnected.value) {
      formGateError.value = t('machineLearning.bci.session.streamUplinkRequired');
      return;
    }
  }
  emit('update:open', false);
  emit('start', { name, ingressMode: ingressMode.value });
};

const footerPrimary = computed(() => {
  if (ingressMode.value === 'local-bridge') {
    return {
      icon: 'material-symbols:play-arrow-rounded',
      label: t('machineLearning.attention.session.start'),
      disabled: !localWsConnected.value,
      onClick: () => submit(),
    };
  }
  if (showConnectButton.value) {
    return {
      icon: isBridgeConnecting.value ? 'svg-spinners:ring-resize' : 'material-symbols:link-rounded',
      label: isBridgeConnecting.value
        ? t('machineLearning.bci.session.connecting')
        : t('machineLearning.bci.session.connectBridge'),
      disabled: isBridgeConnecting.value,
      onClick: () => connectBridge(),
    };
  }
  if (showStreamButton.value) {
    return {
      icon: isStartingStream.value ? 'svg-spinners:ring-resize' : 'material-symbols:sensors-rounded',
      label: isStartingStream.value
        ? t('machineLearning.bci.session.startingStreaming')
        : t('machineLearning.bci.session.startStreaming'),
      disabled: isStartingStream.value,
      onClick: () => startBridgeStreaming(),
    };
  }
  return {
    icon: 'material-symbols:play-arrow-rounded',
    label: t('machineLearning.attention.session.start'),
    disabled: false,
    onClick: () => submit(),
  };
});
</script>

<template>
  <DialogRoot
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <DialogContent
        class="bg-surface/80 dark:bg-surface/30 !border-on-surface/10 fixed left-1/2 top-1/2 z-50 w-full max-w-[52rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-[0_0_80px_rgba(0,0,0,0.4)] outline-none backdrop-blur-3xl"
        @open-auto-focus.prevent
      >
        <div
          class="bg-accent/5 dark:bg-accent/10 pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          class="bg-info/5 dark:bg-info/10 pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full blur-3xl"
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
                {{ t('machineLearning.attention.session.kicker') }}
              </p>
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                {{ t('machineLearning.attention.session.title') }}
              </DialogTitle>
            </div>
            <DialogClose as-child>
              <button
                class="mt-xx-sm p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface rounded-lg transition-colors"
                :aria-label="t('machineLearning.attention.session.cancel')"
              >
                <Icon
                  name="material-symbols:close"
                  size="2rem"
                />
              </button>
            </DialogClose>
          </div>

          <div class="gap-x-lg flex flex-col">
            <AppFormField
              :label="t('machineLearning.attention.session.nameLabel')"
              :error="sessionNameError || undefined"
              html-for="attention-session-name-input"
              required
            >
              <AppInput
                id="attention-session-name-input"
                v-model="sessionNameInput"
                :placeholder="t('machineLearning.attention.session.namePlaceholder')"
                :error="!!sessionNameError"
                @keydown.enter="submit"
              />
            </AppFormField>

            <div class="bg-on-surface/[0.04] border-on-surface/10 gap-sm p-sm flex items-center rounded-xl border">
              <Icon
                name="material-symbols:stacked-bar-chart"
                size="2rem"
                class="text-accent shrink-0"
              />
              <p class="text-body-sm text-on-surface-dim">
                {{ t('machineLearning.attention.session.trialsInfo') }}
              </p>
            </div>

            <p class="text-body-sm text-on-surface-dim">
              {{ t('machineLearning.attention.session.note') }}
            </p>

            <EegIngressModeSelect
              v-model="ingressMode"
              :bridge-error="bridgeStreamErrorMessage"
            />

            <div class="gap-md border-on-surface/10 pt-x-lg flex flex-col items-stretch border-t">
              <p
                v-if="formGateError"
                class="text-body-sm text-error"
              >
                {{ formGateError }}
              </p>
              <div class="gap-md flex flex-wrap items-center justify-end">
                <DialogClose as-child>
                  <AppButton variant="secondary">
                    {{ t('machineLearning.attention.session.cancel') }}
                  </AppButton>
                </DialogClose>

                <AppButton
                  variant="inverse"
                  class="min-h-[3rem] w-fit shrink-0 justify-center whitespace-nowrap"
                  :disabled="footerPrimary.disabled"
                  @click="footerPrimary.onClick"
                >
                  <Icon
                    :name="footerPrimary.icon"
                    size="1.8rem"
                  />
                  {{ footerPrimary.label }}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
