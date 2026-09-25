export interface PageMetaData {
  currentPage: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Backend PaginatedResult<T> serialized with Newtonsoft's camelCase resolver -- its
// `MetaData` property arrives as `metaData`.
export interface PaginatedResponse<T> {
  metaData: PageMetaData;
  data: T;
}
