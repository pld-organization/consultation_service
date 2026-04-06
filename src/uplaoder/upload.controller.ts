import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FilesService } from './upload.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = this.filesService.saveFile(file);

    return this.filesService.create(file, fileName);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  updateFile(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: { name?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.filesService.updateFile(id, file, body.name);
  }

  @Delete(':id')
  removeFile(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.filesService.removeFile(id);
  }
}