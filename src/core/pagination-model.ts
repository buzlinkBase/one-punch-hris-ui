export interface PageMetaData {
  currentPage: number;
  totalCount: number; 
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean; 
}

export interface PaginatedResponse<T> {
  metadata: PageMetaData;
  data: T;
}