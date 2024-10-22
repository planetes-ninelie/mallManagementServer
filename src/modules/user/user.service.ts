import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { successList } from 'src/utils/response';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateUserDto, IUpdateAvatarDto, IUpdateUserDto } from './user.dto';
import { md5 } from '../../utils';
import { FileService } from '../file/file.service';

// noinspection Annotator
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService,private readonly fileService: FileService) {
  }

  /**
   * 创建一个新的用户。
   * @param body - 包含用户创建信息的对象，例如姓名、邮箱等。这个对象来自于ICreateUser接口。
   * @returns 返回通过Prisma ORM创建的用户实例。
   */
  async create(body: ICreateUserDto) {
    if (!body.username) {
      throw new HttpException(`用户昵称不能为空，请填写用户昵称`, HttpStatus.OK);
    }
    const user = await this.findByUsername(body.username);
    if (!user) {
      // 删除createUser对象中的id属性，因为id应该是由系统自动生成的。
      delete body.id;
      body.password = md5(body.password);
      // 使用Prisma客户端创建一个新的用户。
      return this.prisma.user.create({
        data: body,
      });
    } else {
      throw new HttpException(`用户昵称 ${body.username} 已经存在，请填写其他用户名`, HttpStatus.OK);
    }
  }

  /**
   * 查找所有满足条件的用户信息。
   * @param pageNum 页码，表示需要获取的页数。
   * @param pageSize 每页的用户数量。
   * @param username 用户昵称，用于查询条件，按照用户名中包含指定字符串的方式查询。
   * @param name 用户姓名，用于查询条件，按照用户名中包含指定字符串的方式查询。
   * @returns 返回一个对象，包含用户记录、页码、每页数量、总数量等信息。
   */
  async findAll(pageNum: number, pageSize: number, username: string, name: string) {
    // 使用Prisma客户端进行事务查询，获取用户列表
    const { userRole, count } = await this.prisma.$transaction(async (prisma) => {
      return {
        userRole: await this.prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: username } },
              { name: { contains: name } },
            ],
          },
          skip: (pageNum - 1) * pageSize, // 分页跳过的记录数
          take: pageSize, // 每页显示的记录数
          orderBy: {
            createTime: 'desc',
          },
          include: {
            roles: {
              select: {
                role: true,
              },
            },
            image: {
              select: {
                url:true
              }
            }
          },
        }),
        count: await prisma.user.count({
          where: {
            OR: [
              { username: { contains: username } },
              { name: { contains: name } },
            ],
          },
        }),
      };
    });
    const userVo = userRole.map(user => {
      let avatar = null
      if (user.image !== null) {
        avatar = user.image.url
      }
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        createTime: user.createTime,
        updateTime: user.updateTime,
        username: user.username,
        roleName: user.roles.map(item => item.role.roleName).join(' '),
        avatar
      }
    });
    // 返回分页信息和查询结果
    return successList(userVo, { pageNum, pageSize, count });
  }

  /**
   * 更新用户信息。
   * @param body - 包含需要更新的用户信息的对象。
   * @returns 返回更新后的用户信息。
   */
  async update(body: IUpdateUserDto) {
    if (!body.username) {
      throw new HttpException(`用户昵称不能为空，请填写用户昵称`, HttpStatus.OK);
    }
    const user = await this.findByUsername(body.username);
    const checkUser = !user || user.id === body.id
    if (!checkUser) throw new HttpException(`用户昵称 ${body.username} 已经存在，请填写其他用户名`, HttpStatus.OK);
    else {
      // 使用Prisma客户端更新用户信息
      return this.prisma.user.update({
        where: { id: body.id }, // 根据ID定位到需要更新的用户
        data: body, // 提供更新后的用户数据
      });
    }
  }

  /**
   * 删除指定ID的用户。
   * @param id - 需要删除的用户的ID。
   * @returns 返回删除操作的结果。
   */
   async remove(id: number) {
    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    })
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
  async batchRemove(ids: number[]) {
    await this.prisma.userRole.deleteMany({
      where: {
        userId: {
          in: ids,
        }
      }
    })
    return this.prisma.user.deleteMany({
      where: {
        id: {
          in: ids,
        }
      }
    });
  }

  /**
   * 根据用户名查找用户，用于登录
   * @param username 需要查找的用户名
   * @returns User 返回Prisma客户端的查询结果，如果找到该用户，则返回用户信息，否则返回null
   */
  findByUsername(username: string) {
    // 使用Prisma客户端查询数据库中username为指定值的第一个用户(username唯一)
    return this.prisma.user.findFirst({
      where: { username: username },
    });
  }


  /**
   * 为用户分配角色。
   *
   * @param id 用户的唯一标识符。
   * @param roleIds 角色ID的数组，表示要为该用户分配的角色。
   * @returns 返回null。
   */
  async doAssignRole(id: number, roleIds: number[]) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new HttpException(`用户 ${user} 不存在，分配失败`, HttpStatus.OK);
    }
    // 为用户分配角色
    for (const roleId of roleIds) {
      const existingUserRole = await this.prisma.userRole.findFirst({
        where: {
          userId: id,
          roleId: roleId,
        },
      });
      // 根据提供的角色ID查询相应的角色信息
      const role = await this.prisma.role.findUnique({
        where: {
          id: roleId,
        },
      });
      if (!role) {
        throw new HttpException(`角色id ${roleId} 不存在，分配失败`, HttpStatus.OK);
      }
      if (!existingUserRole) {
        // 如果该用户尚未拥有此角色，则创建一个新的 UserRole 记录
        await this.prisma.userRole.create({
          data: {
            userId: id,
            roleId: roleId,
          },
        });
      }
    }
    const userRole = await  this.prisma.userRole.findMany({
      where: {
        userId: id,
      }
    })
    for (const item of userRole) {
      if(!roleIds.includes( item.roleId )) {
        await  this.prisma.userRole.delete({
          where: {
            userId_roleId: {
              userId: id,
              roleId: item.roleId
            }
          }
        })
      }
    }
    const data = await this.prisma.user.findUnique({
      where:{
        id:id
      },
      select:{
        name:true,
        username:true,
        password:true,
        phone:true
      }
    })
    await this.prisma.user.update({
      where: { id: id }, // 根据ID定位到需要更新的用户
      data: data, // 提供更新后的用户数据
    });
    return null;
  }

  /**
   * 根据用户id查用户信息
   * @param userId
   */
  findByUserId(userId: number) {
    return this.prisma.user.findFirst({
      where: {
        id: userId
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                menus: {
                  include: {
                    menu: true
                  }
                }
              }
            }
          }
        },
        image: true
      }
    })
  }


  /**
   * 根据用户id和图片url修改头像
   * @param body
   */
  async updateAvatar(body: IUpdateAvatarDto) {
    const imageRelation= {
      type: 1,
      tid: body.id,
      logoUrl: body.avatar
    }
    const findExist = await this.fileService.selectImageRelationByUrl(imageRelation)
    const userOld = await this.findByUserId(body.id)
    if (userOld.image !== null) {
      const userOldDto = {
        type: 1,
        tid: body.id,
        imageId: userOld.image.id
      }
      const imageRelationOld = await this.fileService.selectImageRelation(userOldDto)
      await this.fileService.removeImageRelation(imageRelationOld.id)
    }
    const nowImageRelation = await this.fileService.addImageRelation(imageRelation)
    return this.prisma.user.update({
      where: {
        id: body.id
      },
      data: {
        imageId: nowImageRelation.imageId
      }
    })
  }
}
