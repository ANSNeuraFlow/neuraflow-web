export type LoggedInUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { id: number; name: string } | null;
  permissions: string[];
  token?: string;
};
