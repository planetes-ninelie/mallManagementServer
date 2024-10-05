import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUpdateTidDto } from './file.dto';
import { IImageRelationEntity } from './file.entity';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async addImageRelation(body: IUpdateTidDto) {
    const url = body.logoUrl
    const image = await this.prisma.image.findFirst({
      where: { url },
    })
    const data:IImageRelationEntity  = {
      type:body.type,
      tid:body.tid,
      imageId:image.id
    }
    return this.prisma.imageRelation.create({
      data
    })
  }
}

