<script setup lang="ts">
const localePath = useLocalePath();

definePageMeta({
  layout: false,
});

await navigateTo(localePath('/machine-learning/sessions'), { replace: true });
</script>
