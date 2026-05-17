<script setup lang="ts">
import type { EegIngressMode } from '../models/eeg-ingress.domain';

defineProps<{
  modelValue: EegIngressMode;
  bridgeError?: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: EegIngressMode];
}>();

const { t } = useI18n();

const options: { value: EegIngressMode; emoji: string; titleKey: string }[] = [
  {
    value: 'neuraflow-bridge',
    emoji: '📡',
    titleKey: 'machineLearning.eegIngress.neuraflowBridgeTitle',
  },
  {
    value: 'local-bridge',
    emoji: '💻',
    titleKey: 'machineLearning.eegIngress.localBridgeTitle',
  },
];
</script>

<template>
  <div class="gap-sm flex flex-col">
    <p class="text-body-sm text-on-surface font-medium">
      {{ t('machineLearning.eegIngress.streamingMethodLabel') }}
      <span class="text-error ml-xx-sm">*</span>
    </p>
    <div class="gap-sm grid grid-cols-2">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="gap-sm border-on-surface/10 duration-short p-sm flex w-full min-w-0 items-center rounded-xl border text-left transition-colors"
        :class="
          modelValue === opt.value
            ? 'text-on-surface border border-white/20 bg-white/[0.08] dark:border-white/15 dark:bg-white/[0.07]'
            : 'hover:bg-on-surface/[0.04] text-on-surface-dim hover:text-on-surface'
        "
        @click="emit('update:modelValue', opt.value)"
      >
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          :class="modelValue === opt.value ? 'bg-white/[0.1]' : 'bg-on-surface/[0.06]'"
        >
          <span
            class="block select-none text-[1.35rem] leading-none grayscale"
            aria-hidden="true"
            >{{ opt.emoji }}</span
          >
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-body-sm font-semibold">{{ t(opt.titleKey) }}</p>
        </div>
        <div class="ml-auto shrink-0">
          <div
            class="border-on-surface/20 flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded-full border-2 transition-colors"
            :class="modelValue === opt.value ? 'border-white/40 dark:border-white/35' : ''"
          >
            <div
              aria-hidden="true"
              class="bg-on-surface/50 pointer-events-none h-[0.8rem] w-[0.8rem] shrink-0 rounded-full transition-opacity dark:bg-white/50"
              :class="modelValue === opt.value ? 'opacity-100' : 'opacity-0'"
            />
          </div>
        </div>
      </button>
    </div>
    <p
      v-if="modelValue === 'neuraflow-bridge' && bridgeError"
      class="text-body-sm text-error"
      role="status"
      aria-live="polite"
    >
      {{ bridgeError }}
    </p>
  </div>
</template>
