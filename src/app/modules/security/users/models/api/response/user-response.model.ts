export type UserType = "Administrator" | "HR" | "Employee";

export interface UserResponse {
  id: string;
  code: string;
  fullName: string;
  username: string;
  userType: UserType;
  status: string;
}
