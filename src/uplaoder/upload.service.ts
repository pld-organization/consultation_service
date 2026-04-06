import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './upload.entity';
import { Repository } from 'typeorm';
import { extname, join } from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(@InjectRepository(File) private fileRepo: Repository<File>) {}

  private getOriginalFileName(fileName: string) {
    const nameArr = fileName.split('.');
    nameArr.pop();
    return nameArr.join();
  }

  private getFileType(mimeType: string) {
    return mimeType.split('/')[1];
  }

  private formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private deleteFile(fileName: string) {
    const filePath = join('public/files', fileName);
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      const fsError = error as NodeJS.ErrnoException;
      if (fsError.code === 'ENOENT') {
        throw new NotFoundException("File doesn't exist");
      }
      throw new BadRequestException();
    }
  }

  saveFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const MAX_FILE_SIZE = 4 * 1024 * 1024;
    const ALLOWED_MIME_TYPES = [
      'image/png',
      'image/jpeg',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size must not exceed 4 MB');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, PDF, DOC, DOCX, XLS, XLSX',
      );
    }

    const fileExt = extname(file.originalname);
    const fileName = file.originalname.replace(fileExt, '');
    const timestamp = Date.now();
    const finalFileName = `${fileName}_${timestamp}${fileExt}`;
    const savePath = join('public/files', finalFileName);

    fs.writeFileSync(savePath, file.buffer);

    return finalFileName;
  }

  async create(file: Express.Multer.File, modifiedFileName: string) {
    const name = this.getOriginalFileName(file.originalname);

    const fileType = this.getFileType(file.mimetype);
    const fileSize = this.formatFileSize(file.size);

    const newFile = this.fileRepo.create({
      originalFileName: name,
      fileType,
      fileSize,
      modifiedFileName,
    });

    return await this.fileRepo.save(newFile);
  }

  async findAll() {
    let files = await this.fileRepo.find();

    if (files) {
      files = files.map((f) => {
        return {
          ...f,
          modifiedFileName: `/public/files/${f.modifiedFileName}`,
        };
      });
    }

    return files;
  }

  async removeFile(id: string) {
    const file = await this.fileRepo.findOne({ where: { id } });

    if (!file) throw new NotFoundException('File not found');

    this.deleteFile(file.modifiedFileName);

    return await this.fileRepo.remove(file);
  }

  async updateFile(id: string, file?: Express.Multer.File, name?: string) {
    const fileDoc = await this.fileRepo.findOne({ where: { id } });

    if (!fileDoc) throw new NotFoundException('File not found');

    if (file) {
      this.deleteFile(fileDoc.modifiedFileName);

      const modifiedFileName = this.saveFile(file);

      const fileType = this.getFileType(file.mimetype);
      const fileSize = this.formatFileSize(file.size);

      fileDoc.fileSize = fileSize;
      fileDoc.fileType = fileType;
      fileDoc.modifiedFileName = modifiedFileName;
    }

    if (name) {
      try {
        const oldFileName = join('public/files', fileDoc.modifiedFileName);
        const fileExt = extname(oldFileName);
        const timestamp = Date.now();
        const newName = `${name}_${timestamp}${fileExt}`;
        const newFileName = join('public/files', newName);
        fs.renameSync(oldFileName, newFileName);

        fileDoc.originalFileName = name;
        fileDoc.modifiedFileName = newName;
      } catch (error) {
        console.log(error);
        throw new BadRequestException('Error renaming file');
      }
    }

    await this.fileRepo.save(fileDoc);
  }
}