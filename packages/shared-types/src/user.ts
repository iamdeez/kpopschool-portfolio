export interface User {
  id: string;
  createdAt: string;
  isTeacher: boolean;
  profile: string;
  name: string;
  firstName: string;
  email: string;
  interest: string[];
  experience: string;
  birthday: string;
  gender: string;
  interestClass: string[];
  interestTeacher: string[];
  timezone: string;
  frequency: string;
  classes: string[];
}

/**
 * password is intentionally absent from every User-shaped type in this package.
 * Credential verification is delegated entirely to the auth provider (FR-013).
 */
export type CreateUserInput = Omit<User, "id" | "createdAt"> & {
  email: string;
  password: string;
};

export type UpdateUserInput = Partial<Omit<User, "id" | "createdAt" | "email">>;
