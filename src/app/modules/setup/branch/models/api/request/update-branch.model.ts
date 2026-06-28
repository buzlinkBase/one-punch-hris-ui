import type { CreateBranch } from './create-branch.model';

export interface UpdateBranch extends CreateBranch {
  id: string;
}
