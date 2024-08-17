import { formatDao } from './index';

interface IList {
  createTime: Date;
  updateTime: Date;
}

/**
 * 根据给定的数据数组和分页信息，生成一个经过处理的分页结果对象。
 * @param data - 符合IList接口的数据数组，数组中的每个元素需要有createTime和updateTime属性。
 * @param pagination - 包含分页信息的对象，应包含pageNum, pageSize, count等属性。
 * @returns 返回一个对象，包含记录列表、页码、每页大小、总记录数、总页数等分页相关信息，以及对createTime和updateTime进行格式化处理后的结果。
 */
export const successList = <T extends IList>(data: T[], pagination: Record<string, number>) => {
  const { pageNum, pageSize, count } = pagination;
  const formatTimeList = formatDao(data)

  // 返回处理后的分页结果对象
  return {
    records: formatTimeList,
    // records: data,
    pageNum,
    pageSize,
    total: count,
    pages: Math.ceil(count / pageSize), // 计算总页数
    orders: [],
    optimizeCountSql: true,
    hitCount: false,
    countId: null,
    maxLimit: null,
    searchCount: true,
  };
};
