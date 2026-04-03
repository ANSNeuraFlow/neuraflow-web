export type LoggedInUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { id: string; name: string } | null;
  permissions: { name: string }[];
};
