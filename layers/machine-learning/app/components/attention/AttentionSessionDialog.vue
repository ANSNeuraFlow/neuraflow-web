<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  start: [name: string];
}>();

const sessionNameInput = ref('');
const sessionNameError = ref('');

watch(
  () => props.open,
  (val) => {
    if (val) {
      sessionNameInput.value = '';
      sessionNameError.value = '';
    }
  },
);

const submit = () => {
  sessionNameError.value = '';
  const name = sessionNameInput.value.trim();
  if (!name) {
    sessionNameError.value = t('machineLearning.attention.session.nameRequired');
    return;
  }
  emit('update:open', false);
  emit('start', name);
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

            <div class="gap-md border-on-surface/10 pt-x-lg flex justify-end border-t">
              <DialogClose as-child>
                <AppButton variant="secondary">
                  {{ t('machineLearning.attention.session.cancel') }}
                </AppButton>
              </DialogClose>
              <AppButton
                variant="inverse"
                @click="submit"
              >
                <Icon
                  name="material-symbols:play-arrow-rounded"
                  size="1.8rem"
                />
                {{ t('machineLearning.attention.session.start') }}
              </AppButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
