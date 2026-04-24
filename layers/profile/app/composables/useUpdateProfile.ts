import { toTypedSchema } from '@vee-validate/zod';

import type { UserProfile } from '../models/profile.domain';
import { updateProfileSchema } from '../schemas/update-profile.schema';
import { useProfileService } from '../services/profile.service';

const schema = toTypedSchema(updateProfileSchema);

export const useUpdateProfile = (onSuccess: (updated: UserProfile) => void) => {
  const { t } = useI18n();
  const profileService = useProfileService();
  const apiError = ref<string | null>(null);
  const isSuccess = ref(false);

  const { defineField, handleSubmit, errors, isSubmitting, setValues } = useForm({
    validationSchema: schema,
  });

  const [firstName, firstNameAttrs] = defineField('firstName');
  const [lastName, lastNameAttrs] = defineField('lastName');
  const [bio, bioAttrs] = defineField('bio');
  const [phoneNumber, phoneNumberAttrs] = defineField('phoneNumber');
  const [dateOfBirth, dateOfBirthAttrs] = defineField('dateOfBirth');

  const prefill = (profile: UserProfile) => {
    setValues({
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      dateOfBirth: profile.dateOfBirth ?? '',
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    apiError.value = null;
    isSuccess.value = false;

    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        bio: values.bio || undefined,
        phoneNumber: values.phoneNumber || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
      };

      const updated = await profileService.updateProfile(payload);
      isSuccess.value = true;
      onSuccess(updated);

      setTimeout(() => {
        isSuccess.value = false;
      }, 3000);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('profile.errors.updateFailed');
    }
  });

  return {
    firstName,
    firstNameAttrs,
    lastName,
    lastNameAttrs,
    bio,
    bioAttrs,
    phoneNumber,
    phoneNumberAttrs,
    dateOfBirth,
    dateOfBirthAttrs,
    errors,
    isSubmitting,
    apiError,
    isSuccess,
    prefill,
    onSubmit,
  };
};
