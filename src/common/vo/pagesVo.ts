export class PagesVo<T> {
  records: T[];
  pageNum: number;
  pageSize: number;
  total: number;
}