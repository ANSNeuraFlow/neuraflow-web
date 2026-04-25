<script setup lang="ts">
const emit = defineEmits<{
  endSession: [];
}>();
</script>

<template>
  <div class="gap-x-lg flex flex-col">
    <BlockSlideGame @close="emit('endSession')" />
  </div>
</template>
