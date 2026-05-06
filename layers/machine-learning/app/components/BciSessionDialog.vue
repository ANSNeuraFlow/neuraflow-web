<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  start: [payload: { name: string; classes: string[]; trialsPerDirection: number }];
}>();

type DirectionMode = '4way' | '2way';

const DEFAULT_DIRECTION_MODE: DirectionMode = '2way';
const DEFAULT_TRIALS_PER_DIRECTION_STR = '30';

const sessionNameInput = ref('');
const sessionNameError = ref('');
const directionMode = ref<DirectionMode>(DEFAULT_DIRECTION_MODE);
const trialsPerDirectionStr = ref(DEFAULT_TRIALS_PER_DIRECTION_STR);
const trialsError = ref('');

const trialsPerDirection = computed(() => {
  const n = parseInt(trialsPerDirectionStr.value, 10);
  return isNaN(n) ? 0 : n;
});

const activeClasses = computed(() =>
  directionMode.value === '4way' ? ['LEFT', 'RIGHT', 'UP', 'DOWN'] : ['LEFT', 'RIGHT'],
);

const totalTrials = computed(() => activeClasses.value.length * trialsPerDirection.value);

const trialsHint = computed(() => {
  const n = trialsPerDirection.value;
  const total = totalTrials.value;
  if (directionMode.value === '4way') {
    return t('machineLearning.bci.session.trialsHint4way', { n, total });
  }
  return t('machineLearning.bci.session.trialsHint2way', { n, total });
});

const directionModeOptions: { value: DirectionMode; label: string; icon: string; description: string }[] = [
  {
    value: '2way',
    label: t('machineLearning.bci.session.dir2wayLabel'),
    icon: 'material-symbols:swap-horiz-rounded',
    description: t('machineLearning.bci.session.dir2wayDesc'),
  },
  {
    value: '4way',
    label: t('machineLearning.bci.session.dir4wayLabel'),
    icon: 'material-symbols:open-with-rounded',
    description: t('machineLearning.bci.session.dir4wayDesc'),
  },
];

watch(
  () => props.open,
  (val) => {
    if (val) {
      sessionNameInput.value = '';
      sessionNameError.value = '';
      trialsError.value = '';
      directionMode.value = DEFAULT_DIRECTION_MODE;
      trialsPerDirectionStr.value = DEFAULT_TRIALS_PER_DIRECTION_STR;
    }
  },
);

const submit = () => {
  sessionNameError.value = '';
  trialsError.value = '';

  const name = sessionNameInput.value.trim();
  if (!name) {
    sessionNameError.value = t('machineLearning.bci.session.nameRequired');
    return;
  }
  if (trialsPerDirection.value < 1) {
    trialsError.value = t('machineLearning.bci.session.trialsMin');
    return;
  }
  if (trialsPerDirection.value > 100) {
    trialsError.value = t('machineLearning.bci.session.trialsMax');
    return;
  }

  emit('update:open', false);
  emit('start', { name, classes: activeClasses.value, trialsPerDirection: trialsPerDirection.value });
};
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
          class="bg-info/5 dark:bg-info/10 pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          class="bg-accent/5 dark:bg-accent/10 pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full blur-3xl"
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
                {{ t('machineLearning.bci.session.kicker') }}
              </p>
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                {{ t('machineLearning.bci.session.title') }}
              </DialogTitle>
            </div>
            <DialogClose as-child>
              <button
                class="mt-xx-sm p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface rounded-lg transition-colors"
                :aria-label="t('machineLearning.bci.session.cancel')"
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
              :label="t('machineLearning.bci.session.nameLabel')"
              :error="sessionNameError || undefined"
              html-for="session-name-bci-input"
              required
            >
              <AppInput
                id="session-name-bci-input"
                v-model="sessionNameInput"
                :placeholder="t('machineLearning.bci.session.namePlaceholder')"
                :error="!!sessionNameError"
                @keydown.enter="submit"
              />
            </AppFormField>

            <div class="gap-sm flex flex-col">
              <p class="text-body-sm text-on-surface font-medium">
                {{ t('machineLearning.bci.session.dirModeLabel') }}
                <span class="text-error ml-xx-sm">*</span>
              </p>
              <div class="gap-sm grid grid-cols-2">
                <button
                  v-for="opt in directionModeOptions"
                  :key="opt.value"
                  type="button"
                  class="gap-sm border-on-surface/10 duration-short p-sm flex items-center rounded-xl border text-left transition-colors"
                  :class="
                    directionMode === opt.value
                      ? 'text-on-surface border border-white/20 bg-white/[0.08] dark:border-white/15 dark:bg-white/[0.07]'
                      : 'hover:bg-on-surface/[0.04] text-on-surface-dim hover:text-on-surface'
                  "
                  @click="directionMode = opt.value"
                >
                  <div
                    class="p-xx-sm flex shrink-0 items-center justify-center rounded-lg"
                    :class="directionMode === opt.value ? 'bg-white/[0.1]' : 'bg-on-surface/[0.06]'"
                  >
                    <Icon
                      :name="opt.icon"
                      size="2rem"
                    />
                  </div>
                  <div>
                    <p class="text-body-sm font-semibold">{{ opt.label }}</p>
                    <p class="text-body-x-sm opacity-70">{{ opt.description }}</p>
                  </div>
                  <div class="ml-auto shrink-0">
                    <div
                      class="border-on-surface/20 flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded-full border-2 transition-colors"
                      :class="directionMode === opt.value ? 'border-white/40 dark:border-white/35' : ''"
                    >
                      <div
                        v-if="directionMode === opt.value"
                        class="bg-on-surface/50 h-[0.8rem] w-[0.8rem] rounded-full dark:bg-white/50"
                      />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <AppFormField
              :label="t('machineLearning.bci.session.trialsLabel')"
              :error="trialsError || undefined"
              :hint="trialsError ? undefined : trialsHint"
              html-for="trials-per-direction-input"
              required
            >
              <div class="gap-sm flex items-center">
                <AppInput
                  id="trials-per-direction-input"
                  v-model="trialsPerDirectionStr"
                  type="number"
                  :placeholder="t('machineLearning.bci.session.trialsPlaceholder')"
                  :error="!!trialsError"
                  class="w-full"
                />
                <div
                  class="bg-on-surface/[0.04] border-on-surface/10 text-body-sm text-on-surface-dim px-sm py-xx-sm shrink-0 rounded-xl border text-center"
                  style="min-width: 13rem"
                >
                  <span class="text-on-surface font-semibold">{{ totalTrials }}</span>
                  {{ t('machineLearning.bci.session.trialsTotal') }}
                </div>
              </div>
            </AppFormField>

            <p class="text-body-sm text-on-surface-dim">
              {{ t('machineLearning.bci.session.note') }}
            </p>

            <div class="gap-md border-on-surface/10 pt-x-lg flex justify-end border-t">
              <DialogClose as-child>
                <AppButton variant="secondary">{{ t('machineLearning.bci.session.cancel') }}</AppButton>
              </DialogClose>
              <AppButton
                variant="inverse"
                @click="submit"
              >
                <Icon
                  name="material-symbols:play-arrow-rounded"
                  size="1.8rem"
                />
                {{ t('machineLearning.bci.session.start') }}
              </AppButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
