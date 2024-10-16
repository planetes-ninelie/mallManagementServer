import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Menu, RoleMenu } from '@prisma/client';
import { generateMenuToTree } from 'src/utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './menu.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * 查找所有菜单项并生成树状结构返回
   * @returns 生成的菜单树
   */
  async findAll() {
    const menuList = await this.prisma.menu.findMany();
    return generateMenuToTree<Menu>(menuList, 0);
  }

  /**
   * 创建一个新的菜单项
   * @param body 包含菜单项信息的对象
   * @returns 创建的菜单项
   */
  async create(body: CreateMenuDto) {
    const { code, level, name, pid, type } = body;
    if(!name) {
      throw new HttpException('菜单名称不能为空，请填写菜单名称',HttpStatus.OK);
    }
    const menu = await this.findByName(name)
    if (menu.length === 0) {
      return this.prisma.menu.create({
        data: {
          code,
          level,
          name,
          pid,
          type,
        },
      });
    } else {
      throw new HttpException(`菜单名称 ${name} 已存在，请重新填写菜单名称`, HttpStatus.OK);
    }
  }

  /**
   * 根据菜单名称查菜单详情
   * @param name 菜单名称
   */
  findByName(name: string) {
    return this.prisma.menu.findMany({
      where:{name}
    })
  }

  /**
   * 更新一个现有的菜单项
   * @param body 包含菜单项信息和ID的对象
   * @returns 更新后的菜单项
   */
  async update(body: UpdateMenuDto) {
    const { id, code, level, name, pid, type } = body;
    if(!name) {
      throw new HttpException('菜单名称不能为空，请填写菜单名称',HttpStatus.OK);
    }
    const menu = await this.findByName(name)
    const check = (menu.length === 1 && menu.id !== body.id) || (menu.length === 0)
    if(check) {
      return this.prisma.menu.update({
        where: {
          id,
        },
        data: {
          code,
          level,
          name,
          pid,
          type,
        },
      });
    } else {
      throw new HttpException(`菜单名称 ${name} 已存在，请重新填写菜单名称`,HttpStatus.OK);
    }
  }

  /**
   * 删除一个菜单项
   * @param id 要删除的菜单项的ID
   * @returns 删除操作的结果
   */
  async remove(id: number) {
    const ids = await this.findChildren(id,[id])
    await this.prisma.roleMenu.deleteMany({
      where : {
        menuId: {
          in: ids
        }
      }
    })
    return this.prisma.menu.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })
  }

  /**
   * 根据pid查菜单信息
   * @param pid 菜单父id
   */
  findByPid(pid: number) {
    return this.prisma.menu.findMany({
      where:{pid}
    })
  }

  async findChildren(pid: number,ids:number[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    async function findChildrenByPid(pid) {
      const menus = await that.findByPid(pid)
      if(menus.length > 0){
        for (const item of menus) {
          ids.push(item.id);
          await findChildrenByPid(item.id)
        }
      }
    }
    await findChildrenByPid(pid)
    return ids
  }


  /**
   * 获取指定角色的权限
   * @param roleId 角色的ID
   * @returns 生成的针对该角色的菜单树，含选中状态
   */
  async toAssign(roleId: number) {
    const menuList = await this.prisma.menu.findMany();
    const roleMenuList = await this.prisma.roleMenu.findMany({
      where: {
        roleId
      },
    });
    return this.generateMenuToTreeToSelect<Menu>(menuList, 0, roleMenuList);
  }

  /**
   * 为角色分配权限
   * @param roleId 角色的ID
   * @param permissionIdList 权限ID的数组
   * @returns 创建的权限关联记录
   */
  async doAssign(roleId: number, permissionIdList: number[]) {
    const oldPermissionIdList = await this.prisma.roleMenu.findMany({
      where: {
        roleId
      },
      select: {
        menuId: true
      }
    }).then(roleMenuList => roleMenuList.map(item => item.menuId ))
    const addIdList = permissionIdList.filter(item => !oldPermissionIdList.includes(item));
    if (addIdList) {
      await this.prisma.roleMenu.createMany({
        data: addIdList.map(item => {
          return {
            roleId,
            menuId:item
          }
        })
      })
    }
    const removeIdList = oldPermissionIdList.filter(item => !permissionIdList.includes(item));
    if (removeIdList) {
      await this.prisma.roleMenu.deleteMany({
        where: {
          menuId: {
            in: removeIdList
          },
          roleId
        }
      })
    }
  }

  /**
 * 生成带有选中状态的树状菜单结构，用于角色权限分配展示
 * @param menus 菜单列表，包含id（主键）和pid（父菜单id）属性
 * @param parentId 当前处理的父菜单ID，用于过滤子菜单
 * @param roleMenuList 角色已有的菜单ID列表，用于判断菜单是否已被选中
 * @returns 生成的树状菜单结构，包含子菜单项和选中状态
 *
 * 此函数接收一个菜单列表和角色已分配的菜单ID列表，通过以下步骤生成树状结构：
 * 1. 使用`.filter()`方法筛选出pid等于`parentId`的子菜单项。
 * 2. 使用`.map()`方法遍历筛选后的子菜单项，进行以下操作：
   - 使用扩展运算符`...menu`保留原始菜单项的所有属性。
   - 添加`select`属性，通过`some()`方法判断菜单项是否已被角色分配（即在`roleMenuList`中存在）。
   - 添加`children`属性，递归调用此函数，生成子菜单项的树状结构。
 *
 * 本版本注重代码简洁性，通过链式调用和函数组合完成整个逻辑。
 */
  private generateMenuToTreeToSelect<T extends { id: number; pid: number }>(menus: T[], parentId: number, roleMenuList: RoleMenu[]): T[] {
    return menus
      .filter((menu) => menu.pid === parentId)
      .map((menu) => ({
        ...menu,
        select: roleMenuList.some((item) => item.menuId === menu.id),
        children: this.generateMenuToTreeToSelect(menus, menu.id, roleMenuList),
      }));
  }
}
