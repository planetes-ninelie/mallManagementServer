import { Injectable } from '@nestjs/common';
import { successList } from 'src/utils/response';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { IUpdateTidDto } from '../file/file.dto';
import { ITrademarkVo } from './trademark.vo';
import { ITrademarkDto } from './trademark.dto';

@Injectable()
export class TrademarkService {
  constructor(private readonly prisma: PrismaService,private readonly fileService: FileService) {}

  /**
   * 找到所有品牌，并根据页码和页面大小进行分页。
   * @param pageNum 当前页码
   * @param pageSize 每页的品牌数量
   * @returns 返回一个包含品牌列表和分页信息的对象
   */
  async findAll(pageNum: number, pageSize: number) {
    // 使用Prisma客户端进行事务查询，同时获取品牌列表和品牌总数
    const { trademarks, count } = await this.prisma.$transaction(async (prisma) => {
      return {
        trademarks: await prisma.trademark.findMany({
          skip: (pageNum - 1) * pageSize, // 跳过指定数量的品牌以实现分页
          take: pageSize, // 返回指定数量的品牌
          orderBy: {
            createTime: 'desc',
          },
          include: {
            image: {
              select: {
                url:true
              }
            }
          }
        }),
        // 获取品牌总数
        count: await prisma.trademark.count(),
      };
    });
    const trademarksList: ITrademarkVo[] = trademarks.map(item => {
      item.logoUrl = item.image.url;
      delete item.image
      return item
    });
    // 返回分页信息和查询结果
    return successList<ITrademarkVo>(trademarksList, { pageNum, pageSize, count });
  }

  /**
   * 创建一个新的品牌。
   * @param body 包含品牌信息的对象
   * @returns 返回创建的品牌对象
   */
  async create(body: ITrademarkDto) {
    const tmName= body.tmName
    const image = await this.fileService.selectImage(body.logoUrl)
    const result = await this.prisma.trademark.create({
      data: {
        tmName,
        imageId:image.id
      },
    });
    const imageRelation:IUpdateTidDto = {
      type: 2,
      tid: result.id,
      logoUrl: body.logoUrl
    }
    await this.fileService.addImageRelation(imageRelation)
    return result
  }

  /**
   * 更新一个现有的品牌信息。
   * @param body 包含更新后的品牌信息的对象，其中必须包含id以标识要更新的品牌
   * @returns 返回更新后的品牌对象
   */
  async update(body: ITrademarkDto) {
    const imageRelation= {
      type: 2,
      tid: body.id,
      logoUrl: body.logoUrl
    }
    const findExist = await this.fileService.selectImageRelationByUrl(imageRelation)
    const trademarkOld = await this.selectOne(body.id)
    const trOldDto = {
      type: 2,
      tid:trademarkOld.id,
      imageId:trademarkOld.imageId
    }
    const imageRelationOld = await this.fileService.selectImageRelation(trOldDto)
    let data
    if (!findExist) {
      const nowImageRelation = await this.fileService.addImageRelation(imageRelation)
      await this.fileService.removeImageRelation(imageRelationOld.id)
      data = {
        tmName: body.tmName,
        imageId: nowImageRelation.imageId
      }
    } else {
      data = {
        tmName: body.tmName,
      }
    }
    return await this.prisma.trademark.update({
      where: {
        id: body.id,
      },
      data
    });
  }

  /**
   * 删除指定ID的品牌。
   * @param id 要删除的品牌的ID
   * @returns 返回一个表示操作成功或失败的对象
   */
  async remove(id: number) {
    const trademark = await this.selectOne(id)
    const data = {
      type:2,
      tid: trademark.id,
      imageId:trademark.imageId,
    }
    const imageRelation = await this.fileService.selectImageRelation(data)
    await this.fileService.removeImageRelation(imageRelation.id)
    return this.prisma.trademark.delete({
      where: {
        id
      },
    });
  }

  /**
   * 根据id查询单个品牌数据
   * @param id
   */
  selectOne(id: number) {
    return this.prisma.trademark.findFirst({
      where: { id }
    })
  }
}
