import { toTypedSchema } from '@vee-validate/zod';

import { createSessionSchema } from '../schemas/create-session.schema';
import { useEegSessionService } from '../services/eeg-session.service';

export const useCreateEegSession = (onSuccess: () => void) => {
  const { t } = useI18n();
  const sessionService = useEegSessionService();

  const schema = toTypedSchema(createSessionSchema);
  const apiError = ref<string | null>(null);

  const { defineField, handleSubmit, errors, isSubmitting, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
      sessionName: '',
      protocolName: undefined,
    },
  });

  const [sessionName, sessionNameAttrs] = defineField('sessionName');
  const [protocolName, protocolNameAttrs] = defineField('protocolName');

  const onSubmit = handleSubmit(async (values) => {
    apiError.value = null;

    try {
      await sessionService.createSession(values);
      resetForm();
      onSuccess();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('eegSessions.errors.createFailed');
    }
  });

  return {
    sessionName,
    sessionNameAttrs,
    protocolName,
    protocolNameAttrs,
    errors,
    isSubmitting,
    apiError,
    onSubmit,
    resetForm,
  };
};
