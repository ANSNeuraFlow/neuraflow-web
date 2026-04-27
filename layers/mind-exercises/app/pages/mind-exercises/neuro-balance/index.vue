<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
defineOptions({ name: 'MindExercisesNeuroBalancePage' });

definePageMeta({
  layout: 'mind-exercises',
  title: 'mindExercises.neuroBalance.pageTitle',
});
</script>

<template>
  <NeuroBalanceSessionView />
</template>
