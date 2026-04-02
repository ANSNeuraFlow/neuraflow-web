export type LoginApiResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: { id: string; name: string } | null;
    isVerified: boolean;
    isPasswordChangeRequired: boolean;
  };
};

export type LoginPasswordChangeRequiredResponse = {
  message: 'PASSWORD_CHANGE_REQUIRED';
  email: string;
};

export type RegisterApiResponse = {
  id: string;
  email: string;
  isVerified: boolean;
  isPasswordChangeRequired: boolean;
};

export type MeApiResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { id: string; name: string } | null;
  createdAt: string;
  permissions: { name: string }[];
};
