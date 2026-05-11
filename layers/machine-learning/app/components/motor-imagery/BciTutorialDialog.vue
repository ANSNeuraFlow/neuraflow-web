<script setup lang="ts">
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  start: [];
}>();

const trialFlowSteps = computed(() => [
  {
    icon: 'material-symbols:add',
    label: t('machineLearning.bci.tutorial.trialCrossLabel'),
    desc: t('machineLearning.bci.tutorial.trialCrossDesc'),
  },
  {
    icon: 'material-symbols:notifications-active-rounded',
    label: t('machineLearning.bci.tutorial.trialBeepLabel'),
    desc: t('machineLearning.bci.tutorial.trialBeepDesc'),
  },
  {
    icon: 'material-symbols:arrow-left-alt-rounded',
    label: t('machineLearning.bci.tutorial.trialArrowLabel'),
    desc: t('machineLearning.bci.tutorial.trialArrowDesc'),
  },
  {
    icon: 'material-symbols:dark-mode-rounded',
    label: t('machineLearning.bci.tutorial.trialBlankLabel'),
    desc: t('machineLearning.bci.tutorial.trialBlankDesc'),
  },
]);

const cueCards = computed(() => [
  {
    dir: 'LEFT',
    icon: 'material-symbols:arrow-left-alt-rounded',
    label: t('machineLearning.bci.tutorial.leftLabel'),
    desc: t('machineLearning.bci.tutorial.leftDesc'),
    color: 'text-info',
    border: 'border-info/20 bg-info/[0.03]',
  },
  {
    dir: 'RIGHT',
    icon: 'material-symbols:arrow-right-alt-rounded',
    label: t('machineLearning.bci.tutorial.rightLabel'),
    desc: t('machineLearning.bci.tutorial.rightDesc'),
    color: 'text-accent',
    border: 'border-accent/20 bg-accent/[0.03]',
  },
]);

const handleOpenChange = (val: boolean) => emit('update:open', val);
</script>

<template>
  <DialogRoot
    :open="open"
    @update:open="handleOpenChange($event)"
  >
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <DialogContent
        class="bg-surface/80 dark:bg-surface/30 !border-on-surface/10 fixed left-1/2 top-1/2 z-50 flex max-h-[min(90vh,52rem)] w-full max-w-[56rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border shadow-[0_0_80px_rgba(0,0,0,0.4)] outline-none backdrop-blur-3xl"
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

        <div class="border-on-surface/10 p-x-lg pb-x-lg pt-x-lg sm:px-xx-lg sm:pt-xx-lg shrink-0 border-b">
          <div class="gap-md relative z-10 flex items-start justify-between">
            <div>
              <p class="mb-xx-sm text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
                {{ t('machineLearning.bci.tutorial.kicker') }}
              </p>
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                {{ t('machineLearning.bci.tutorial.dialogTitle') }}
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
        </div>

        <div class="px-x-lg py-x-lg sm:px-xx-lg relative z-10 min-h-0 flex-1 overflow-y-auto">
          <div class="gap-xx-lg flex flex-col">
            <section class="gap-sm flex flex-col">
              <h3 class="text-body-sm text-on-surface font-semibold">
                {{ t('machineLearning.bci.tutorial.step1Title') }}
              </h3>
              <div class="gap-sm bg-on-surface/[0.04] p-x-lg flex items-start rounded-xl">
                <Icon
                  name="material-symbols:neurology-rounded"
                  size="3.2rem"
                  class="text-accent mt-xx-sm shrink-0"
                />
                <p class="text-body-md text-on-surface-dim leading-relaxed">
                  {{ t('machineLearning.bci.tutorial.step1Body') }}
                </p>
              </div>
              <p
                id="bci-trial-flow-heading"
                class="text-body-sm text-on-surface font-semibold"
              >
                {{ t('machineLearning.bci.tutorial.trialFlowTitle') }}
              </p>
              <div
                class="border-outline/15 bg-on-surface/[0.04] grid grid-cols-2 overflow-hidden rounded-xl border sm:grid-cols-4"
                aria-labelledby="bci-trial-flow-heading"
              >
                <div
                  v-for="fs in trialFlowSteps"
                  :key="fs.label"
                  class="gap-xs p-sm border-on-surface/[0.1] flex flex-col items-center border-b border-r text-center sm:border-b-0 sm:border-r sm:last:border-r-0 max-sm:[&:nth-child(2n)]:border-r-0 max-sm:[&:nth-child(n+3)]:border-b-0"
                >
                  <Icon
                    :name="fs.icon"
                    size="2.4rem"
                    class="text-on-surface-dim"
                  />
                  <p class="text-body-x-sm text-on-surface font-semibold">{{ fs.label }}</p>
                  <p class="text-body-x-sm text-on-surface-dim">{{ fs.desc }}</p>
                </div>
              </div>
            </section>

            <section class="gap-sm flex flex-col">
              <h3 class="text-body-sm text-on-surface font-semibold">
                {{ t('machineLearning.bci.tutorial.step2Title') }}
              </h3>
              <i18n-t
                keypath="machineLearning.bci.tutorial.step2Body"
                tag="p"
                class="text-body-md text-on-surface-dim"
              >
                <template #strong>
                  <strong class="text-on-surface">{{ t('machineLearning.bci.tutorial.step2BodyStrong') }}</strong>
                </template>
              </i18n-t>
              <div class="gap-sm grid grid-cols-1 sm:grid-cols-2">
                <div
                  v-for="cue in cueCards"
                  :key="cue.dir"
                  class="gap-sm p-x-lg flex items-start rounded-xl border"
                  :class="cue.border"
                >
                  <Icon
                    :name="cue.icon"
                    size="3.6rem"
                    :class="[cue.color, 'mt-xx-sm shrink-0']"
                  />
                  <div>
                    <p class="text-body-sm text-on-surface mb-xx-sm font-bold">{{ cue.label }}</p>
                    <p class="text-body-sm text-on-surface-dim leading-relaxed">{{ cue.desc }}</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="gap-sm flex flex-col">
              <h3 class="text-body-sm text-on-surface font-semibold">
                {{ t('machineLearning.bci.tutorial.step3Title') }}
              </h3>
              <div class="gap-sm bg-on-surface/[0.04] p-x-lg flex items-start rounded-xl">
                <Icon
                  name="material-symbols:science-rounded"
                  size="3.2rem"
                  class="text-accent mt-xx-sm shrink-0"
                />
                <i18n-t
                  keypath="machineLearning.bci.tutorial.step3Body"
                  tag="p"
                  class="text-body-md text-on-surface-dim leading-relaxed"
                >
                  <template #strong>
                    <strong class="text-on-surface">{{ t('machineLearning.bci.tutorial.step3BodyStrong') }}</strong>
                  </template>
                </i18n-t>
              </div>
              <p class="text-body-sm text-on-surface font-semibold">
                {{ t('machineLearning.bci.tutorial.sequenceTitle') }}
              </p>
              <div class="gap-sm flex items-center">
                <div
                  v-for="(dir, i) in ['LEFT', 'RIGHT', 'LEFT', 'RIGHT']"
                  :key="i"
                  class="gap-xs py-sm flex flex-1 flex-col items-center rounded-xl border"
                  :class="
                    dir === 'LEFT'
                      ? 'border-info/30 bg-info/[0.06] text-info'
                      : 'border-accent/30 bg-accent/[0.06] text-accent'
                  "
                >
                  <Icon
                    :name="
                      dir === 'LEFT'
                        ? 'material-symbols:arrow-left-alt-rounded'
                        : 'material-symbols:arrow-right-alt-rounded'
                    "
                    size="2.8rem"
                  />
                  <p class="text-body-x-sm font-mono font-semibold">
                    {{
                      dir === 'LEFT'
                        ? t('machineLearning.bci.tutorial.dirLeft')
                        : t('machineLearning.bci.tutorial.dirRight')
                    }}
                  </p>
                </div>
              </div>
              <i18n-t
                keypath="machineLearning.bci.tutorial.notSaved"
                tag="p"
                class="text-body-sm text-on-surface-dim"
              >
                <template #strong>
                  <strong class="text-on-surface">{{ t('machineLearning.bci.tutorial.notSavedStrong') }}</strong>
                </template>
              </i18n-t>
            </section>
          </div>
        </div>

        <div class="border-on-surface/10 p-x-lg py-x-lg sm:px-xx-lg relative z-10 shrink-0 border-t">
          <div class="gap-md flex flex-wrap justify-end">
            <DialogClose as-child>
              <AppButton variant="secondary">{{ t('machineLearning.bci.session.cancel') }}</AppButton>
            </DialogClose>
            <AppButton
              variant="inverse"
              @click="$emit('start')"
            >
              <Icon
                name="material-symbols:play-arrow-rounded"
                size="1.8rem"
                class="mr-sm"
              />
              {{ t('machineLearning.bci.tutorial.start') }}
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
