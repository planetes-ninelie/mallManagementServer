import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { successList } from 'src/utils/response';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateRoleDto, IUpdateRoleDto } from './role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建一个新的角色。
   * @param body 包含角色信息的对象，除了id以外的所有字段。
   * @returns 返回创建的角色信息。
   */
  create(body: ICreateRoleDto) {
    return this.prisma.role.create({
      data: body,
    });
  }

  /**
   * 查询并返回所有角色，支持分页和角色名筛选。
   * @param pageNum 当前页码。
   * @param pageSize 每页的角色数量。
   * @param roleName 包含指定角色名的角色将被返回。
   * @returns 返回一个包含角色列表和分页信息的对象。
   */
  async findAll(pageNum: number, pageSize: number, roleName: string) {
    const { roles, count } = await this.prisma.$transaction(async (prisma) => {
      // 在一个事务中查询角色和用户数量。
      return {
        roles: await prisma.role.findMany({
          where: {
            roleName: { contains: roleName }, // 筛选包含指定角色名的角色。
          },
          skip: (pageNum - 1) * pageSize, // 计算跳过的记录数。
          take: pageSize, // 设置每页的角色数量。
          orderBy: {
            createTime: 'desc',
          },
        }),
        count: await prisma.role.count(), // 查询角色的总数。
      };
    });

    // 返回分页信息和查询结果。
    return successList<Role>(roles, { pageNum, pageSize, count });
  }

  /**
   * 更新一个存在的角色信息。
   * @param body 包含要更新的角色信息的对象，必须包含id字段以标识要更新的角色。
   * @returns 返回更新后的角色信息。
   */
  update(body: IUpdateRoleDto) {
    return this.prisma.role.update({
      where: { id: body.id },
      data: body,
    });
  }

  /**
   * 根据ID删除一个角色。
   * @param id 要删除的角色的ID。
   * @returns 返回删除操作的结果。
   */
  remove(id: number) {
    return this.prisma.role.delete({
      where: { id: id },
    });
  }

  /**
   * 批量删除多个角色。
   * @param ids 要删除的角色的ID数组。
   * @returns 返回批量删除操作的结果。
   */
  batchRemove(ids: number[]) {
    return this.prisma.role.deleteMany({
      where: {
        id: {
          in: ids, // 删除ID在指定数组中的所有角色。
        },
      },
    });
  }
}
