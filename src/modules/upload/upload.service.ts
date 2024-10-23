import { HttpException, HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as fs from 'fs';
import * as mime from 'mime-types';
import { IUploadEntity } from './upload.entity';

@Injectable({ scope: Scope.REQUEST })
export class UploadService {
  constructor(@Inject(REQUEST) private request: Request,private readonly prisma: PrismaService) {}

  async uploadFile(file): Promise<string> {
    const name = file.originalname;
    const fileName = Date.now() + extname(name);
    try {
      // 检查文件类型是否为图片
      const isImage = this.isImage(file);
      if (!isImage) {
        throw new Error('上传的文件不是 jpe?g|png|gif|bmp|webp 类型');
      }
      if(!fileName) {
        throw new Error("没有文件名")
      }
      const uploadPath = `upload/${fileName}`;
      const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
      // 查询数据库中是否存在相同的哈希值
      const existingFile = await this.prisma.image.findFirst({
        where: { hash },
      });
      if (existingFile) {
        // 文件已存在，直接返回
        return existingFile.url;
      }
      // 文件不存在，创建写入流并将文件保存到磁盘
      const fileStream = fs.createWriteStream(uploadPath);
      fileStream.write(file.buffer);
      fileStream.end();
      // 创建数据库记录
      const data = {
        num: 0,
        url: `${this.getHostAndPort()}/${uploadPath}`,
        name: name,
        hash, // 将哈希值保存到数据库
      };
      await this.prisma.image.create({
        data,
      });
      return data.url
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('上传失败', HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw error;
      }
    }
  }

  async deleteFile(url,id: number = 0,): Promise<string> {
    try {
      const checkParams = (id === 0 && url === "") || (id !== 0 && url !== "")
      // 从数据库中获取文件记录
      if (checkParams) {
        return "请传入正确的参数"
        // throw new HttpException('请传入正确的参数',HttpStatus.OK)
      }
      const fileRecord: IUploadEntity = await this.prisma.image.findFirst({
        where: { OR: [{ id }, { url } ] },
      });
      if (!fileRecord) {
        return "文件记录不存在"
        // throw new HttpException('文件记录不存在',HttpStatus.OK);
      }
      if (fileRecord.num > 0) {
        // throw new HttpException('文件存在引用',HttpStatus.OK);
        return "文件存在引用"
      }
      // 删除文件系统中的文件
      const filePath = fileRecord.url.split('/').slice(-2).join('/');
      fs.unlink(`./${filePath}`, async (err) => {
        if (err) {
          console.error('删除文件时发生错误:', err);
          throw new HttpException('删除文件失败',HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          // 从数据库中删除记录
          await this.prisma.image.deleteMany({
            where: { OR: [{ id }, { url } ] },
          });
          return "成功";
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('删除失败', HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw error;
      }
    }
  }

  private getHostAndPort(): string {
    const host = this.request?.headers['host'];
    return `http://${host}`;
  }

  private isImage(file: Express.Multer.File): boolean {
    // 检查文件扩展名是否为图片格式
    const imageExtensions = /\.(jpe?g|png|gif|bmp|webp)$/i;
    if (!imageExtensions.test(file.originalname)) {
      return false;
    }
    // 检查MIME类型是否为图片类型
    const mimeType = mime.lookup(file.originalname);
    return mimeType.startsWith('image/');
  }
}

