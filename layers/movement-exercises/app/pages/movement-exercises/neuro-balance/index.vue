<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
defineOptions({ name: 'MovementExercisesNeuroBalancePage' });

definePageMeta({
  layout: 'movement-exercises',
  title: 'movementExercises.neuroBalance.pageTitle',
});
</script>

<template>
  <NeuroBalanceSessionView />
</template>
