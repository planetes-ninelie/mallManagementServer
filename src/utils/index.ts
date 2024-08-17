import { Request } from 'express';
import { createHash } from 'node:crypto';
import moment from 'moment';

/**
 * 用于格式化日期时间的函数
 * @param dateTime
 * @returns 返回一个表示指定日期和时间的"yyyy-MM-dd HH:mm:ss"格式字符串。
 */
export function formatDateTime(dateTime: Date): string {
  return moment(dateTime).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 对含有时间的数组对象进行处理
 */
export function formatDao(obj:any[]):object {
  return obj.map((item) => ({
    ...item,
    createTime: formatDateTime(obj?.createTime),
    updateTime: formatDateTime(obj?.updateTime),
  }));
}


/**
 * 计算字符串的MD5哈希值
 * @param content 需要计算哈希值的字符串
 * @returns 返回计算后的MD5哈希值，结果为大写十六进制字符串
 */
export function md5(content: string) {
  // 使用crypto模块的createHash函数创建一个MD5哈希计算器，更新内容，然后计算出哈希值
  return createHash('md5').update(content).digest('hex').toLocaleUpperCase();
}

/**
 * 从请求头中提取token
 * @param request 请求对象，需要包含头信息
 * @returns 提取得到的token，如果不存在则返回空字符串
 */
export function extractTokenFromHeader(request: Request) {
  // 从请求头中的授权信息中提取token
  return extractToken((request.headers.token || request.headers.authorization) as string);
}

/**
 * 从授权字符串中提取令牌。
 *
 * @param auth 授权字符串，预期以“Bearer ”开头，后跟令牌。
 * @returns 如果授权字符串以“Bearer ”开头，则返回去掉该前缀后的令牌字符串；否则返回原授权字符串。
 */
export function extractToken(auth: string) {
  // 检查授权字符串是否以"Bearer "开头
  if (!auth.startsWith('Bearer ')) {
    return auth;
  }
  // 如果是，分割字符串并返回令牌部分
  return auth.split(' ')[1];
}

/**
 * 从用户对象中排除指定的键，返回一个不包含这些键的新对象。
 * @param user - 用户对象。
 * @param keys - 要排除的键的数组。
 * @returns 返回一个不包含指定键的新用户对象，使用了Omit类型来确保类型安全。
 */
export function exclude<User, Key extends keyof User>(user: User, keys: Key[]): Omit<User, Key> {
  // 通过过滤掉指定的键，从用户对象中创建一个新的对象
  return Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key as Key))) as Omit<User, Key>;
}

/**
 * 将给定的字符串转换为驼峰命名法
 * @param str 待转换的字符串，预期中可能包含短横线（-）分隔的单词
 * @returns 转换后的字符串，其中原短横线分隔的单词将变为驼峰命名法表示
 */
export function convertToCamelCase(str: string) {
  // 使用短横线分隔字符串，并对每个单词进行处理
  return (
    str
      .split('-')
      // 对每个单词的首字母大写，然后接上剩余部分
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      // 将处理后的单词重新连接为一个字符串
      .join('')
  );
}

/**
 * 判断一个对象是否为空。
 * @param obj 需要判断的对象。
 * @returns 如果对象为空，则返回true；否则返回false。
 */
export function isEmpty(obj: object): boolean {
  // 判断obj不是一个对象，就返回
  if (typeof obj !== 'object' || obj === null) {
    return true;
  }
  // 返回对象中键的数量，如果为0则表示对象为空
  return Object.keys(obj).length === 0;
}

/**
 * 将菜单列表转换为树结构。
 * @param menus 菜单列表，每个菜单项应包含 id 和 pid。id 表示菜单项的唯一标识，pid 表示父菜单项的标识。
 * @param parentId 当前遍历层级的父菜单项的id。
 * @returns 返回一个树结构的菜单列表，每个菜单项包括其子菜单项（如果有的话）。
 */
export function generateMenuToTree<T extends { id: number; pid: number }>(menus: T[], parentId: number) {
  // 过滤出当前父菜单ID的所有子菜单项
  return menus
    .filter((menu) => menu.pid === parentId)
    .map((menu) => {
      // 递归调用，为当前菜单项生成子菜单项
      const children = generateMenuToTree(menus, menu.id);
      const formatMenu = {
        ...menu ,
        createTime: formatDateTime(menu?.createTime),
        updateTime: formatDateTime(menu?.updateTime)
      }
      // 返回包含子菜单项的菜单项对象
      return { ...formatMenu, children}
    });
}

// 将普通的数组转换为树形结构
// 输入的类型，调用transformToOption时，传入的参数类型必须包含InputItem接口里的属性，可以多不能少
export interface InputItem {
  name: string;
  children?: InputItem[];
  [key: string]: any;
}
// 输出的类型
export interface TransformedItem {
  value: number | string;
  label: string;
  children?: TransformedItem[];
}

/**
 * 将普通的数组转换为value和label的树形结构
 * @param arr 输入的数组
 * @param key 输入的数组的key
 * @returns 输出的树形结构数组
 */
export function transformToOption(arr: InputItem[], key: string = 'id'): TransformedItem[] {
  return arr.map((item) => {
    const newItem: TransformedItem = {
      value: item[key],
      label: item.name,
    };
    if (item.children && item.children.length > 0) {
      newItem.children = transformToOption(item.children, key);
    }
    return newItem;
  });
}
