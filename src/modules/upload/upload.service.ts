import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { createWriteStream } from 'fs';
import { extname } from 'path';

@Injectable({ scope: Scope.REQUEST })
export class UploadService {
  constructor(@Inject(REQUEST) private request: Request) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = Date.now() + extname(file.originalname);
    const uploadPath = `upload/${fileName}`;

    const fileStream = createWriteStream(uploadPath);
    fileStream.write(file.buffer);
    fileStream.end();

    return `${this.getHostAndPort()}/` + uploadPath;
  }

  private getHostAndPort(): string {
    const host = this.request?.headers['host'];
    return `http://${host}`;
  }
}
