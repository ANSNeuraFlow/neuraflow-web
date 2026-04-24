export type ProfileStats = {
  eegSessionCount: number;
  trainingJobCount: number;
  modelDeploymentCount: number;
  mlModelCount: number;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  isVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  role: { id: number; name: string } | null;
  permissions: string[];
  stats: ProfileStats;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
};
