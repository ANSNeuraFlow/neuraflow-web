<script setup lang="ts">
const { t } = useI18n();

const form = reactive({
  name: '',
  email: '',
  message: '',
});

const onSubmit = () => {};
</script>

<template>
  <section
    id="contact"
    class="px-md py-xxx-huge lg:px-xx-lg container mx-auto"
  >
    <div class="gap-xx-lg grid grid-cols-1 lg:grid-cols-2">
      <div class="gap-md flex flex-col">
        <h2 class="text-heading-x-lg tracking-sm text-on-surface font-semibold">
          {{ t('landing.contact.title') }}
        </h2>
        <p class="text-body-md text-on-surface-dim">
          {{ t('landing.contact.description') }}
        </p>
      </div>

      <AppCard
        border
        shadow="md"
      >
        <form
          class="gap-md flex flex-col"
          @submit.prevent="onSubmit"
        >
          <AppFormField
            :label="t('landing.contact.nameLabel')"
            html-for="landing-name"
            required
          >
            <AppInput
              id="landing-name"
              v-model="form.name"
              type="text"
              name="name"
              autocomplete="name"
              :placeholder="t('landing.contact.namePlaceholder')"
            />
          </AppFormField>

          <AppFormField
            :label="t('landing.contact.emailLabel')"
            html-for="landing-email"
            required
          >
            <AppInput
              id="landing-email"
              v-model="form.email"
              type="email"
              name="email"
              autocomplete="email"
              :placeholder="t('landing.contact.emailPlaceholder')"
            />
          </AppFormField>

          <AppFormField
            :label="t('landing.contact.messageLabel')"
            html-for="landing-message"
            required
          >
            <textarea
              id="landing-message"
              v-model="form.message"
              name="message"
              rows="5"
              :placeholder="t('landing.contact.messagePlaceholder')"
              class="border-on-surface/10 bg-surface-container px-md py-xx-sm text-body-md text-on-surface duration-short hover:border-on-surface/20 focus:border-accent focus:ring-accent/15 w-full rounded-sm border outline-none transition-colors focus:ring-2"
            />
          </AppFormField>

          <AppButton
            type="submit"
            size="full"
          >
            {{ t('landing.contact.submit') }}
          </AppButton>
        </form>
      </AppCard>
    </div>
  </section>
</template>
