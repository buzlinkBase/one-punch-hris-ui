export interface UserResponse {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  status: string;
}

export type UserType = "Owner | Admin" | "Member" | "Employee";
