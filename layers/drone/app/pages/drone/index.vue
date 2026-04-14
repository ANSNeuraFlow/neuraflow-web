<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: 'drone',
  middleware: [
    function () {
      return navigateTo('/drone/eeg');
    },
  ],
});
</script>
