<script setup lang="ts">
const props = defineProps<{
  isArmed: boolean;
  isFlying: boolean;
}>();

const emit = defineEmits<{
  arm: [];
  disarm: [];
  takeoff: [];
  land: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="glass-card gap-md p-md sm:p-x-lg flex h-full min-h-0 w-full flex-col">
    <div class="gap-sm flex shrink-0 items-center">
      <Icon
        name="material-symbols:settings-power"
        size="1.8rem"
        class="text-on-surface-dim shrink-0"
      />
      <h2 class="text-heading-x-sm text-on-surface font-display font-bold">
        {{ t('remote.droneControl.controls.powerTitle') }}
      </h2>
    </div>

    <div
      :class="[
        'gap-sm px-md py-sm flex shrink-0 items-center rounded-xl border transition-all duration-300',
        props.isArmed ? 'border-success/20 bg-success/[0.05]' : 'border-on-surface/[0.08] bg-on-surface/[0.03]',
      ]"
    >
      <div
        :class="[
          'flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full transition-colors duration-300',
          props.isArmed ? 'bg-success/15 text-success' : 'bg-on-surface/[0.08] text-on-surface-dim',
        ]"
      >
        <Icon
          :name="props.isArmed ? 'material-symbols:lock-open-outline' : 'material-symbols:lock-outline'"
          size="1.8rem"
        />
      </div>
      <div>
        <p class="text-body-sm text-on-surface font-semibold">
          {{
            props.isArmed
              ? t('remote.droneControl.controls.armedStatus')
              : t('remote.droneControl.controls.disarmedStatus')
          }}
        </p>
        <p class="text-body-x-sm text-on-surface-dim/70">
          {{
            props.isFlying
              ? t('remote.droneControl.controls.flyingStatus')
              : t('remote.droneControl.controls.groundedStatus')
          }}
        </p>
      </div>
    </div>

    <AppButton
      v-if="!props.isArmed"
      variant="secondary"
      size="full"
      class="shrink-0"
      @click="emit('arm')"
    >
      <Icon
        name="material-symbols:lock-open-outline"
        size="2rem"
      />
      {{ t('remote.droneControl.controls.arm') }}
    </AppButton>
    <AppButton
      v-else
      variant="danger"
      size="full"
      class="shrink-0"
      @click="emit('disarm')"
    >
      <Icon
        name="material-symbols:lock-outline"
        size="2rem"
      />
      {{ t('remote.droneControl.controls.disarm') }}
    </AppButton>

    <div class="border-on-surface/[0.08] shrink-0 border-t" />

    <div class="min-h-0 flex-1" />

    <div class="gap-sm grid shrink-0 grid-cols-2">
      <button
        type="button"
        :disabled="!props.isArmed || props.isFlying"
        class="text-body-sm gap-x-sm px-sm flex min-h-[6.4rem] select-none flex-col items-center justify-center rounded-xl border font-semibold transition-all duration-150"
        :class="
          !props.isArmed || props.isFlying
            ? 'border-on-surface/[0.06] bg-on-surface/[0.03] text-on-surface-dim/40 cursor-not-allowed'
            : 'border-success/25 bg-success/[0.07] text-success hover:bg-success/[0.13] cursor-pointer active:scale-95'
        "
        @click="emit('takeoff')"
      >
        <Icon
          name="material-symbols:flight-takeoff"
          size="2.4rem"
        />
        {{ t('remote.droneControl.controls.takeoff') }}
      </button>

      <button
        type="button"
        :disabled="!props.isFlying"
        class="text-body-sm gap-x-sm px-sm flex min-h-[6.4rem] select-none flex-col items-center justify-center rounded-xl border font-semibold transition-all duration-150"
        :class="
          !props.isFlying
            ? 'border-on-surface/[0.06] bg-on-surface/[0.03] text-on-surface-dim/40 cursor-not-allowed'
            : 'border-on-surface/[0.15] bg-on-surface/[0.07] text-on-surface hover:bg-on-surface/[0.13] cursor-pointer active:scale-95'
        "
        @click="emit('land')"
      >
        <Icon
          name="material-symbols:flight-land"
          size="2.4rem"
        />
        {{ t('remote.droneControl.controls.land') }}
      </button>
    </div>
  </div>
</template>
