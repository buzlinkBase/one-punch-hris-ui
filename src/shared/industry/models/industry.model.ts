export interface SubIndustry {
  code: string;
  name: string;
}

export interface Industry {
  code: string;
  name: string;
  subIndustries: SubIndustry[];
}
