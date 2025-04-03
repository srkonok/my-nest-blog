export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;

  constructor(items: T[], meta: PaginationMeta) {
    this.items = items;
    this.meta = meta;
  }

  static create<T>(
    items: T[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const meta: PaginationMeta = {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };

    return new PaginatedResponse(items, meta);
  }
} 