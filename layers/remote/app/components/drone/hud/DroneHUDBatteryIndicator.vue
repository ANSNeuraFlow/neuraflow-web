<script setup lang="ts">
const props = defineProps<{
  voltage: number;
  percent: number;
}>();

const { t } = useI18n();

const textClass = computed(() => {
  if (props.percent > 50) return 'text-success';
  if (props.percent > 25) return 'text-warning';
  return 'text-error';
});

const badgeClass = computed(() => {
  if (props.percent > 50) return 'bg-success/10 border-success/25';
  if (props.percent > 25) return 'bg-warning/10 border-warning/25';
  return 'bg-error/10 border-error/25';
});

const iconName = computed(() => {
  if (props.percent > 80) return 'material-symbols:battery-full';
  if (props.percent > 50) return 'material-symbols:battery-5-bar';
  if (props.percent > 25) return 'material-symbols:battery-3-bar';
  return 'material-symbols:battery-alert';
});

const progressColor = computed((): 'success' | 'warning' | 'error' => {
  if (props.percent > 50) return 'success';
  if (props.percent > 25) return 'warning';
  return 'error';
});
</script>

<template>
  <div
    :class="[
      'gap-x-sm gap-y-xx-sm px-sm py-xx-sm flex min-w-0 shrink-0 flex-wrap items-center rounded-xl border sm:flex-nowrap',
      badgeClass,
    ]"
  >
    <div class="gap-x-sm text-body-x-sm flex min-w-0 shrink-0 items-center font-semibold">
      <Icon
        :name="iconName"
        size="1.6rem"
        class="shrink-0"
        :class="textClass"
      />
      <span :class="['whitespace-nowrap tabular-nums', textClass]">{{ voltage.toFixed(2) }} V</span>
      <span class="text-on-surface-dim/60 whitespace-nowrap tabular-nums">{{ percent }}%</span>
    </div>
    <AppProgressBar
      :value="percent"
      size="sm"
      :color="progressColor"
      :label="t('remote.droneControl.hud.batteryAria')"
      class="min-w-[8rem]"
    />
  </div>
</template>
