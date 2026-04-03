<script setup lang="ts">
const { t } = useI18n();

const goToTechnology = () => {
  if (!import.meta.client) {
    return;
  }

  document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<template>
  <section
    id="top"
    class="border-on-surface/8 relative overflow-hidden border-b"
  >
    <div
      class="inset-none from-accent/10 absolute bg-gradient-to-b via-transparent to-transparent"
      aria-hidden="true"
    />
    <div
      class="gap-xxx-lg px-md py-xxx-huge lg:px-xx-lg container relative mx-auto grid grid-cols-1 items-center lg:grid-cols-2"
    >
      <div class="gap-lg flex flex-col">
        <p
          class="border-accent/30 bg-accent/10 px-md py-xx-sm text-body-x-sm tracking-lg text-accent inline-flex w-fit items-center rounded-full border font-medium"
        >
          {{ t('landing.hero.badge') }}
        </p>

        <h1 class="text-heading-x-lg tracking-sm text-on-surface lg:text-heading-x-huge font-semibold">
          {{ t('landing.hero.titlePrefix') }}
          <span class="text-accent">{{ t('landing.hero.titleAccent') }}</span>
          {{ t('landing.hero.titleSuffix') }}
        </h1>

        <p class="text-body-lg text-on-surface-dim lg:pr-xx-huge">
          {{ t('landing.hero.description') }}
        </p>

        <div class="gap-sm flex flex-col sm:flex-row">
          <AppButton
            size="lg"
            @click="navigateTo('/register')"
          >
            {{ t('landing.hero.primaryCta') }}
          </AppButton>
          <AppButton
            variant="secondary"
            size="lg"
            @click="goToTechnology"
          >
            {{ t('landing.hero.secondaryCta') }}
          </AppButton>
        </div>
      </div>

      <AppCard
        padding="xl"
        border
        shadow="md"
        class="group relative overflow-hidden"
      >
        <div
          class="inset-none from-accent/20 to-info/20 absolute bg-gradient-to-br via-transparent opacity-70"
          aria-hidden="true"
        />
        <div class="gap-lg relative flex flex-col">
          <div class="flex items-center justify-between">
            <h2 class="text-heading-md text-on-surface font-semibold">
              {{ t('landing.hero.visualTitle') }}
            </h2>
            <Icon
              name="material-symbols:sensors-rounded"
              size="2.4rem"
              class="text-accent"
              aria-hidden="true"
            />
          </div>

          <svg
            viewBox="0 0 600 220"
            class="text-accent w-full"
            role="img"
            :aria-label="t('landing.hero.visualTitle')"
          >
            <defs>
              <linearGradient
                id="eegStroke"
                x1="0%"
                x2="100%"
                y1="0%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stop-color="rgb(var(--color-accent))"
                  stop-opacity="0.35"
                />
                <stop
                  offset="50%"
                  stop-color="rgb(var(--color-accent))"
                  stop-opacity="1"
                />
                <stop
                  offset="100%"
                  stop-color="rgb(var(--color-info))"
                  stop-opacity="0.45"
                />
              </linearGradient>
            </defs>
            <rect
              x="0"
              y="0"
              width="600"
              height="220"
              fill="transparent"
            />
            <path
              d="M0 108 C40 30, 80 190, 120 108 S200 30, 240 108 S320 190, 360 108 S440 30, 480 108 S560 190, 600 108"
              fill="none"
              stroke="url(#eegStroke)"
              stroke-width="4"
              class="duration-medium group-hover:translate-x-tiny transition-all ease-in-out"
            />
            <path
              d="M0 130 C40 70, 80 170, 120 130 S200 70, 240 130 S320 170, 360 130 S440 70, 480 130 S560 170, 600 130"
              fill="none"
              stroke="rgb(var(--color-accent) / 0.35)"
              stroke-width="2"
              class="duration-medium group-hover:-translate-x-tiny transition-all ease-in-out"
            />
          </svg>

          <p class="text-body-sm text-on-surface-dim">
            {{ t('landing.hero.visualCaption') }}
          </p>
        </div>
      </AppCard>
    </div>
  </section>
</template>
