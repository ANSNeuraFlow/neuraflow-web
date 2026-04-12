<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: 'machine-learning',
  middleware: [
    function () {
      return navigateTo('/machine-learning/sessions');
    },
  ],
});
</script>
