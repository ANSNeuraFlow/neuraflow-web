<script setup lang="ts">
const { t } = useI18n();

defineEmits<{ openSession: []; openTutorial: [] }>();
</script>

<template>
  <div class="gap-lg z-10 flex flex-col items-center text-center">
    <Icon
      name="material-symbols:neurology-rounded"
      size="8rem"
      class="text-accent opacity-80"
    />

    <div class="px-md max-w-2xl">
      <h2 class="text-heading-md text-on-surface mb-sm font-semibold">
        {{ t('machineLearning.bci.idle.title') }}
      </h2>
      <p class="text-body-md text-on-surface-dim mb-lg">
        {{ t('machineLearning.bci.idle.description') }}
      </p>
    </div>

    <div class="gap-sm flex flex-col items-center sm:flex-row">
      <AppButton
        variant="secondary"
        size="lg"
        class="w-full sm:w-auto"
        @click="$emit('openTutorial')"
      >
        <Icon
          name="material-symbols:school-rounded"
          size="2rem"
          class="mr-sm"
        />
        {{ t('machineLearning.bci.idle.btnTutorial') }}
      </AppButton>
      <AppButton
        variant="inverse"
        size="lg"
        class="w-full sm:w-auto"
        @click="$emit('openSession')"
      >
        <Icon
          name="material-symbols:play-arrow-rounded"
          size="2.4rem"
          class="mr-sm"
        />
        {{ t('machineLearning.bci.idle.btnStart') }}
      </AppButton>
    </div>
  </div>
</template>
