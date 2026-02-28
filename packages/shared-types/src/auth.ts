export type UserRole = "CUSTOMER" | "OPERATOR" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

