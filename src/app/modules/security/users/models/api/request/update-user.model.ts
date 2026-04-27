import type { UserType } from "../response/user-response.model";

export interface UpdateUser {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  userType: UserType;
  status: string;
}
