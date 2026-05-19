<script setup lang="ts">
defineProps<{
  controlMode?: 'bci' | 'manual';
}>();

const emit = defineEmits<{
  endSession: [];
}>();
</script>

<template>
  <div class="gap-x-lg flex flex-col">
    <BlockSlideGame
      :control-mode="controlMode"
      @close="emit('endSession')"
    />
  </div>
</template>
