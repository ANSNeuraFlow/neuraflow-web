<script setup lang="ts">
import type { BlockSlideBciDisplayMode } from '../../models/block-slide.domain';

defineProps<{
  controlMode?: 'bci' | 'manual';
  bciDisplayMode?: BlockSlideBciDisplayMode;
}>();

const emit = defineEmits<{
  endSession: [];
}>();
</script>

<template>
  <div class="gap-x-lg flex flex-col">
    <BlockSlideGame
      :control-mode="controlMode"
      :bci-display-mode="bciDisplayMode"
      @close="emit('endSession')"
    />
  </div>
</template>
