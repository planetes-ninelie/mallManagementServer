import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUpdateTidDto } from './file.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService,private readonly uploadService: UploadService) {}

  /**
   * 根据url查询图片表的数据
   * @param url
   */
  selectImage(url) {
    return this.prisma.image.findFirst({
      where:{
        url
      }
    })
  }

  /**
   * 根据url删除图片表数据
   * @param url
   */
  async deleteImage(url) {
    const image = await this.selectImage(url)
    await this.uploadService.deleteFile(image.id)
    if (image.num !== 0) {
      const imageRelation = await this.prisma.imageRelation.findMany({
        where: {
          imageId: image.id
        }
      })
      for (const item of imageRelation) {
        if (item.type === 2) {
          await this.prisma.trademark.delete({
            where: {
              id:item.tid
            }
          })
        } else if (item.type === 3) {}
        else if (item.type === 1) {}
        else {}
      }
      await this.prisma.imageRelation.deleteMany({
        where: {
          imageId: image.id,
        }
      })
    }
    return this.prisma.image.delete({
      where: {
        url
      }
    })
  }

  /**
   * 根据type，tid，logoUrl查询图片关系表
   * @param body type，tid，logoUrl
   */
  async selectImageRelationByUrl(body: IUpdateTidDto) {
    const image = await this.selectImage(body.logoUrl)
    const data = {
      type:body.type,
      tid:body.tid,
      imageId:image.id,
    }
    this.selectImageRelation(data)
  }

  /**
   * 根据tid、type、imageId查图片关系表
   * @param body
   */
  selectImageRelation(body) {
    return this.prisma.imageRelation.findFirst({
      where: {
        ...body
      }
    })
  }

  /**
   * 根据id查询图片关系表
   * @param id
   */
  async selectImageRelationById(id) {
    return this.prisma.imageRelation.findUnique({
      where: {
        id: id
      }
    })
  }

  /**
   * 新增图片与其他的关系数据
   * @param body type，tid，logoUrl
   */
  async addImageRelation(body: IUpdateTidDto) {
    const image = await this.updateNumByUrl(body.logoUrl,true)
    const data = {
      type:body.type,
      tid:body.tid,
      imageId:image.id
    }
    return this.prisma.imageRelation.create({
      data
    })
  }

  /**
   * 根据id删除图片关系表数据
   * @param id
   */
  async removeImageRelation(id) {
    const data = await this.selectImageRelationById(id)
    await this.updateNumById(data.imageId,false)
    return this.prisma.imageRelation.delete({
      where:{
        id
      }
    })
  }

  /**
   * 根据url对图片表num进行修改
   * @param url 图片url
   * @param isAdd true为+1，false为-1
   * @private
   */
  private async updateNumByUrl(url:string,isAdd:boolean) {
    const image = await this.selectImage(url)
    return this.updateNum(image,isAdd)
  }

  /**
   * 根据id对图片表num进行修改
   * @param id
   * @param isAdd
   */
  private async updateNumById(id:number,isAdd:boolean) {
    const image = await this.prisma.image.findUnique({
      where: {
        id
      }
    })
    await this.updateNum(image,isAdd)
  }

  /**
   * 根据image单条数据对图片表num进行修改
   * @param image
   * @param isAdd
   */
  private async updateNum(image,isAdd:boolean) {
    const num = image.num + (isAdd ? 1: -1)
    const id = image.id
    if (num === 0) {
      await this.uploadService.deleteFile(id)
      await this.prisma.image.delete({
        where:{
          id
        }
      })
    } else {
      await this.prisma.image.update({
        where: {
          id
        },
        data:{
          num
        }
      })
    }
    return {
      ...image,
      num
    }
  }
}

