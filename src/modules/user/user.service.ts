import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { successList } from 'src/utils/response';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateUser, IUpdateUser } from './interface';
import { error } from 'node:console';
import { HttpStatus } from '@nestjs/common'
import { formatDao } from '../../utils'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }
  /**
   * 创建一个新的用户。
   * @param body - 包含用户创建信息的对象，例如姓名、邮箱等。这个对象来自于ICreateUser接口。
   * @returns 返回通过Prisma ORM创建的用户实例。
   */
  async create(body: ICreateUser) {
    const user = await this.findByUsername(body.username);
    if (!user) {
      // 删除createUser对象中的id属性，因为id应该是由系统自动生成的。
      delete body.id;
      // 使用Prisma客户端创建一个新的用户。
      return this.prisma.user.create({
        data: body,
      });
      // return user
    } else {
      throw new HttpException(`用户名 ${body.username} 已经存在，请填写其他用户名`, HttpStatus.OK)
    }
  }

  /**
   * 查找所有满足条件的用户信息。
   * @param pageNum 页码，表示需要获取的页数。
   * @param pageSize 每页的用户数量。
   * @param username 用户名，用于查询条件，按照用户名中包含指定字符串的方式查询。
   * @returns 返回一个对象，包含用户记录、页码、每页数量、总数量等信息。
   */
  async findAll(pageNum: number, pageSize: number, username: string) {
    // 使用Prisma客户端进行事务查询，同时获取用户列表和用户总数
    const { users, count } = await this.prisma.$transaction(async (prisma) => {
      return {
        users: await prisma.user.findMany({
          where: {
            username: { contains: username }, // 查询条件，用户名中包含指定的字符串
          },
          skip: (pageNum - 1) * pageSize, // 跳过指定数量的用户
          take: pageSize, // 返回指定数量的用户
          orderBy: {
            createTime: 'desc',
          },
        }),
        count: await prisma.user.count(), // 获取用户总数
      };
    });

    // 返回分页信息和查询结果
    return successList<User>(users, { pageNum, pageSize, count });
  }


  /**
   * 更新用户信息。
   * @param body - 包含需要更新的用户信息的对象。
   * @returns 返回更新后的用户信息。
   */
  async update(body: IUpdateUser) {
    const user = await this.findByUsername(body.username);
    if (!user) {
      // 使用Prisma客户端更新用户信息
      return this.prisma.user.update({
        where: { id: body.id }, // 根据ID定位到需要更新的用户
        data: body, // 提供更新后的用户数据
      });
    } else {
      throw new HttpException(`用户名 ${body.username} 已经存在，请填写其他用户名`, HttpStatus.OK)
    }

  }

  /**
   * 删除指定ID的用户。
   * @param id - 需要删除的用户的ID。
   * @returns 返回删除操作的结果。
   */
  remove(id: number) {
    // 使用Prisma客户端删除指定ID的用户
    return this.prisma.user.delete({
      where: { id: id }, // 根据ID定位到需要删除的用户
    });
  }

  /**
   * 批量删除用户
   * @param ids 需要删除的用户ID数组
   * @returns count 返回Prisma客户端的删除操作响应
   */
  batchRemove(ids: number[]) {
    return this.prisma.user.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  /**
   * 根据用户名查找用户，用于登录
   * @param username 需要查找的用户名
   * @returns User 返回Prisma客户端的查询结果，如果找到该用户，则返回用户信息，否则返回null
   */
  findByUsername(username: string) {
    // 使用Prisma客户端查询数据库中username为指定值的第一个用户
    return this.prisma.user.findFirst({
      where: { username: username },
    });
  }

  /**
   * 根据用户ID查询用户信息，并准备角色分配相关数据
   * @param id 用户的唯一标识符
   * @returns 返回一个对象，包含已分配的角色列表和所有角色列表
   */
  async toAssign(id: number) {
    // 通过ID查询唯一的用户信息
    const user = await this.prisma.user.findUnique({ where: { id } });

    // 初始化已分配的角色列表
    let assignRoles = [];

    // 将用户角色名以逗号分隔，存为列表
    const userRoleNameList = user.roleName?.split(',');

    // 如果用户有角色名，则查询与之匹配的所有角色信息
    if (userRoleNameList && userRoleNameList.length > 0) {
      assignRoles = await this.prisma.role.findMany({
        where: {
          roleName: {
            in: userRoleNameList,
          },
        },
      });
    }

    // 查询所有角色信息
    const allRolesList = await this.prisma.role.findMany();

    // 返回数据
    return {
      assignRoles,
      allRolesList,
    };
  }

  /**
   * 为用户分配角色。
   *
   * @param id 用户的唯一标识符。
   * @param roleIds 角色ID的数组，表示要为该用户分配的角色。
   * @returns 返回null。
   */
  async doAssignRole(id: number, roleIds: number[]) {
    // 根据提供的角色ID查询相应的角色信息
    const rolesList = await this.prisma.role.findMany({
      where: {
        id: {
          in: roleIds,
        }
      }
    });
    // 将查询到的角色名以逗号连接成字符串
    const rolesNameList = rolesList.map((item) => item.roleName).join(',');

    // 更新用户的角色名字段
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        roleName: rolesNameList,
      },
    });
    return null;
  }
}
