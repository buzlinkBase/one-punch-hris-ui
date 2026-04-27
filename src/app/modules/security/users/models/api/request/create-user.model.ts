import type { UserType } from "../response/user-response.model";

export interface CreateUser {
  fullName: string;
  username: string;
  password: string;
  userType: UserType;
  status: string;
}
