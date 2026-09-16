import { BasePagedQuery } from '../../core/models/paging/base-paged-query';
import { PageResult } from '../../core/models/paging/page-result';

export class ListInventoryCountsRequest extends BasePagedQuery {}

export interface ListInventoryCountsQueryDto {
  id: number;
  countNumber: string;
  note?: string | null;
  itemsCount: number;
  totalDifferenceValue: number;
  createdAtUtc: string;
}

export type ListInventoryCountsResponse = PageResult<ListInventoryCountsQueryDto>;
