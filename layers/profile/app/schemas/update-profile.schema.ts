import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'profile.validation.firstNameRequired').max(128, 'profile.validation.firstNameTooLong'),
  lastName: z.string().min(1, 'profile.validation.lastNameRequired').max(128, 'profile.validation.lastNameTooLong'),
  bio: z.string().max(2000, 'profile.validation.bioTooLong').optional(),
  phoneNumber: z.string().max(32, 'profile.validation.phoneTooLong').optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'profile.validation.dateOfBirthInvalid')
    .optional()
    .or(z.literal('')),
});

export type UpdateProfileInput = z.input<typeof updateProfileSchema>;
export type UpdateProfileOutput = z.output<typeof updateProfileSchema>;
