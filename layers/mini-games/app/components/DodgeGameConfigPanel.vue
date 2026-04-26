<script setup lang="ts">
import { DIFFICULTY_PRESETS, type DodgeGameConfig } from '../composables/useDodgeGame';

defineOptions({ name: 'DodgeGameConfigPanel' });

defineProps<{
  config: DodgeGameConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', config: DodgeGameConfig): void;
}>();

const { t } = useI18n();
</script>

<template>
  <div class="glass-card p-x-lg gap-x-lg flex h-full flex-col">
    <div class="gap-md flex items-center">
      <div
        class="bg-on-surface/10 text-on-surface flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-full"
      >
        <Icon
          name="lucide:settings-2"
          size="2rem"
        />
      </div>
      <div>
        <h2 class="text-heading-sm text-on-surface font-display font-bold">
          {{ t('minigames.dodge.config.title') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-xx-sm">
          {{ t('minigames.dodge.config.subtitle') }}
        </p>
      </div>
    </div>

    <div class="gap-md flex flex-1 flex-col justify-center">
      <p class="text-body-sm text-on-surface-dim font-medium">
        {{ t('minigames.dodge.config.selectDifficulty') }}
      </p>

      <div class="border-on-surface/[0.08] bg-on-surface/[0.03] flex overflow-hidden rounded-xl border">
        <button
          v-for="d in DIFFICULTY_PRESETS"
          :key="d"
          type="button"
          class="text-body-sm py-sm flex-1 text-center font-semibold transition-colors duration-150"
          :class="
            config.difficulty === d
              ? 'bg-on-surface text-surface'
              : 'text-on-surface-dim hover:bg-on-surface/[0.07] hover:text-on-surface'
          "
          @click="emit('update:config', { ...config, difficulty: d })"
        >
          {{ t(`minigames.dodge.difficulty.${d}`) }}
        </button>
      </div>

      <p class="text-body-x-sm text-on-surface-dim leading-relaxed">
        {{ t(`minigames.dodge.difficultyDesc.${config.difficulty}`) }}
      </p>
    </div>
  </div>
</template>
